/**
 * Geo arithmetic for the 3D basemap (no Three.js dependency, unit-testable).
 * Coordinate system: city center at the origin, x east, z south (matches a Three.js
 * top-down view), 1 degree ≈ 100 units. Ported from the Fortbrain bigscreen.
 */

/** Seeded pseudo-random (LCG) so store placement is identical on every load. */
export const lcg = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

export function makeProjector(center, k = 100) {
  const [cx, cy] = center
  const kx = k * Math.cos((cy * Math.PI) / 180)
  return { P: (lon, lat) => [(lon - cx) * kx + 0, -(lat - cy) * k + 0] }
}

/** Scale points away from `center` by `factor`: real stores sit within a few km and would stack. */
export function spread(center, factor) {
  const [sx, sy] = center
  return (lon, lat) => [Number((sx + (lon - sx) * factor).toFixed(6)), Number((sy + (lat - sy) * factor).toFixed(6))]
}

export function pointInRing(x, z, ring) {
  let ins = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) ins = !ins
  }
  return ins
}

/**
 * Staggered-grid placement. Cells come in three tiers (whole footprint on the map /
 * center on the map / anywhere); stores take the nearest free cell by descending weight,
 * so overlap is impossible by construction. Each store needs px/pz (projected position)
 * and w (weight); x/z are written back.
 */
export function placeStores(stores, { onMap, cellW, cellH, rows = 8, cols = 7, rnd = Math.random, sq = 3.1, labelW = 20, labelH = 5.6 }) {
  const cells = []
  for (let r = -rows; r <= rows; r++) {
    const z = r * cellH, off = r % 2 ? cellW / 2 : 0
    for (let c = -cols; c <= cols; c++) {
      const x = c * cellW + off
      const full = onMap(x - sq / 2, z - labelH / 2) && onMap(x + sq / 2 + 1 + labelW, z - labelH / 2)
        && onMap(x - sq / 2, z + labelH / 2) && onMap(x + sq / 2 + 1 + labelW, z + labelH / 2)
      cells.push({ x, z, used: false, tier: full ? 0 : onMap(x, z) ? 1 : 2 })
    }
  }
  for (const s of [...stores].sort((a, b) => b.w - a.w)) {
    let best = null
    for (const tier of [0, 1, 2]) {
      let bd = Infinity
      for (const c of cells) {
        if (c.used || c.tier !== tier) continue
        const d = Math.hypot(c.x - s.px, c.z - s.pz)
        if (d < bd) { bd = d; best = c }
      }
      if (best) break
    }
    if (best) { best.used = true; s.x = best.x + (rnd() - 0.5) * 2.2; s.z = best.z + (rnd() - 0.5) * 1.6 }
    else { s.x = s.px; s.z = s.pz }
  }
  return stores
}

/**
 * Pick `n` stores for the close-ups: start at the one nearest the centroid, then greedily
 * add whichever store is farthest from everything already picked (farthest-point sampling),
 * so the camera flies across the whole city instead of hopping between neighbours.
 */
export function pickFeatured(stores, n) {
  if (!stores.length) return []
  const cx = stores.reduce((a, s) => a + s.x, 0) / stores.length, cz = stores.reduce((a, s) => a + s.z, 0) / stores.length
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z)
  const picked = [[...stores].sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz))[0]]
  while (picked.length < Math.min(n, stores.length)) {
    let best = null, bd = -1
    for (const s of stores) {
      if (picked.includes(s)) continue
      const d = Math.min(...picked.map((p) => dist(p, s)))
      if (d > bd) { bd = d; best = s }
    }
    picked.push(best)
  }
  return picked
}

/** Flatten polylines into a LineSegments position array (one draw call for thousands of roads). */
export function segmentPositions(polylines, y) {
  const pos = []
  for (const pts of polylines) for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1]
    pos.push(x1, y, z1, x2, y, z2)
  }
  return pos
}

/** Shoelace area; used to drop water bodies too small to see. */
export function ringArea(r) {
  let a = 0
  for (let i = 0; i < r.length; i++) { const [x1, z1] = r[i], [x2, z2] = r[(i + 1) % r.length]; a += x1 * z2 - x2 * z1 }
  return Math.abs(a) / 2
}
