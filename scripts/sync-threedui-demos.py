#!/usr/bin/env python3
"""Publish a built ThreeDUI playground as two Fortbrain concept pages.

Run `pnpm playground:build` in ThreeDUI first, then run this script here. Both
concepts share one hashed JavaScript bundle so the site does not duplicate the
renderer. The ThreeDUI build uses a relative Vite base for static hosting.
"""
import argparse
import re
import shutil
from pathlib import Path


def concept_html(source: str, scene: str, script_path: str) -> str:
    params = "params.set('scene', '%s');" % scene
    if scene == 'spatial':
        params += " if (!params.has('stage')) params.set('stage', 'overview');"
    params += " if (params.has('preview')) params.set('hud', '0');"
    title = 'ThreeDUI · 3D glass sign-up form' if scene == 'signup' else 'ThreeDUI · six-view spatial application'
    html = source.replace('<title>GlassUI · Playground</title>', f'<title>{title}</title>')
    html = re.sub(r'(?<=src=")\./assets/[^\"]+\.js(?=")', script_path, html, count=1)
    html = html.replace('<script type="module"',
        '<script>const params = new URLSearchParams(location.search); '
        + params + ' history.replaceState(null, "", location.pathname + "?" + params + location.hash);</script>\n  <script type="module"', 1)
    html = html.replace('</body>', '  <script src="../preview.js"></script>\n</body>')
    return html


def main() -> None:
    site = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist', type=Path, default=site.parent / 'ThreeDUI/examples/playground/dist')
    args = parser.parse_args()
    dist = args.dist.resolve()
    entry = dist / 'index.html'
    if not entry.is_file():
        raise SystemExit(f'missing ThreeDUI build: {entry}; run pnpm playground:build first')
    source = entry.read_text(encoding='utf-8')
    match = re.search(r'<script type="module"[^>]+src="\./assets/([^\"]+\.js)"', source)
    if not match:
        raise SystemExit(f'{dist / "index.html"}: missing relative Vite bundle')
    bundle = dist / 'assets' / match.group(1)
    if not bundle.is_file():
        raise SystemExit(f'missing bundle: {bundle}')
    signup = site / 'concepts/glassui-signup'
    spatial = site / 'concepts/glassui-spatial'
    assets = signup / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    spatial.mkdir(parents=True, exist_ok=True)
    for stale in assets.glob('*.js'):
        stale.unlink()
    shutil.copyfile(bundle, assets / bundle.name)
    (signup / 'index.html').write_text(concept_html(source, 'signup', f'./assets/{bundle.name}'), encoding='utf-8')
    (spatial / 'index.html').write_text(concept_html(source, 'spatial', f'../glassui-signup/assets/{bundle.name}'), encoding='utf-8')
    print(f'Published sign-up and spatial concepts from {bundle.name}')


if __name__ == '__main__':
    main()
