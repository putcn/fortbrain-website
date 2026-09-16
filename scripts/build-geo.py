#!/usr/bin/env python3
"""Build data/xuzhou.json from the Fortbrain bigscreen basemap.

Reads ~/Fortbrain/packs/mxipos/app/geo/320300.json (districts + OSM roads + water),
simplifies every ring/polyline with Douglas-Peucker, keeps only motorway/trunk roads,
drops tiny water areas, and writes a compact file (< 300KB) with the same structure.

Run on a dev machine that has the Fortbrain checkout:  python3 scripts/build-geo.py
"""
import json
import os
import sys

SRC = os.path.expanduser(os.environ.get("FB_GEO", "~/Fortbrain/packs/mxipos/app/geo/320300.json"))
DST = os.path.join(os.path.dirname(__file__), "..", "data", "xuzhou.json")
TOL = 0.0015         # degrees; ~150m, invisible at city scale
ROAD_CLASSES = {"motorway", "trunk"}
MIN_WATER_AREA = 2e-4  # square degrees
MIN_WATER_LEN = 0.03   # degrees; shorter creeks are noise at city scale


def perp_dist(p, a, b):
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
    t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    px, py = x1 + t * dx, y1 + t * dy
    return ((x - px) ** 2 + (y - py) ** 2) ** 0.5


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        best, bd = -1, tol
        for k in range(i + 1, j):
            d = perp_dist(pts[k], pts[i], pts[j])
            if d > bd:
                best, bd = k, d
        if best >= 0:
            keep[best] = True
            stack.append((i, best))
            stack.append((best, j))
    return [p for p, k in zip(pts, keep) if k]


def ring_area(r):
    a = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]
        x2, y2 = r[(i + 1) % len(r)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def rnd(pts):
    return [[round(x, 4), round(y, 4)] for x, y in pts]


def length(pts):
    return sum(((pts[i + 1][0] - pts[i][0]) ** 2 + (pts[i + 1][1] - pts[i][1]) ** 2) ** 0.5 for i in range(len(pts) - 1))


def chain(polylines):
    """Join polylines that share an endpoint into longer ones.

    OSM splits a motorway into thousands of 2-point ways; each way costs ~30 bytes of JSON
    wrapper, which was most of the file. Greedy end-to-end joining brings it back to
    a few hundred long lines.
    """
    key = lambda p: (round(p[0], 5), round(p[1], 5))
    ends = {}
    lines = [list(p) for p in polylines]
    alive = [True] * len(lines)
    for i, l in enumerate(lines):
        ends.setdefault(key(l[0]), []).append(i)
        ends.setdefault(key(l[-1]), []).append(i)
    out = []
    for i in range(len(lines)):
        if not alive[i]:
            continue
        alive[i] = False
        cur = lines[i]
        for direction in (1, -1):
            while True:
                tail = cur[-1] if direction == 1 else cur[0]
                nxt = next((j for j in ends.get(key(tail), []) if alive[j]), None)
                if nxt is None:
                    break
                alive[nxt] = False
                seg = lines[nxt]
                if key(seg[-1]) == key(tail):
                    seg = seg[::-1]
                if direction == 1:
                    cur = cur + seg[1:]
                else:
                    cur = seg[::-1][:-1] + cur if key(seg[0]) == key(tail) else seg[:-1] + cur
        out.append(cur)
    return out


def main():
    with open(SRC) as f:
        g = json.load(f)
    out = {
        "adcode": g["adcode"],
        "name": g["name"],
        "center": g["center"],
        "districts": [],
        "roads": [],
        "water": [],
        "source": {**g.get("source", {}), "simplified": f"DP tol {TOL}, roads {sorted(ROAD_CLASSES)}"},
    }
    for d in g["districts"]:
        rings = [rnd(simplify(r, TOL)) for r in d["rings"]]
        rings = [r for r in rings if len(r) >= 4]
        out["districts"].append({"name": d["name"], "center": d["center"], "rings": rings})
    for cls in sorted(ROAD_CLASSES):
        for pts in chain([r["pts"] for r in g["roads"] if r["cls"] == cls]):
            pts = rnd(simplify(pts, TOL))
            if len(pts) >= 2:
                out["roads"].append({"cls": cls, "pts": pts})
    for w in g["water"]:
        if w["kind"] != "area":
            continue
        if ring_area(w["ring"]) < MIN_WATER_AREA:
            continue
        ring = rnd(simplify(w["ring"], TOL))
        if len(ring) >= 4:
            out["water"].append({"kind": "area", "ring": ring})
    for pts in chain([w["pts"] for w in g["water"] if w["kind"] != "area"]):
        if length(pts) < MIN_WATER_LEN:
            continue
        pts = rnd(simplify(pts, TOL))
        if len(pts) >= 2:
            out["water"].append({"kind": "line", "pts": pts})
    os.makedirs(os.path.dirname(DST), exist_ok=True)
    with open(DST, "w") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize(DST)
    print(f"districts={len(out['districts'])} roads={len(out['roads'])} water={len(out['water'])} bytes={size}")
    if size > 300_000:
        print("WARNING: over 300KB budget", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
