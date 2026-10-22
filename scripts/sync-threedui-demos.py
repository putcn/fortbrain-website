#!/usr/bin/env python3
"""Publish a built ThreeDUI playground as four Fortbrain concept pages.

Run `pnpm playground:build` in ThreeDUI first, then run this script here. The
sign-up, spatial and gallery concepts share one hashed JavaScript bundle. The
demo index links to those pages and carries its own relative images.
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
    title = {'signup': 'ThreeDUI · 3D glass sign-up form',
             'spatial': 'ThreeDUI · six-view spatial application',
             'gallery': 'ThreeDUI · component gallery'}[scene]
    html = source.replace('<title>GlassUI · Playground</title>', f'<title>{title}</title>')
    html = re.sub(r'(?<=src=")\./assets/[^\"]+\.js(?=")', script_path, html, count=1)
    html = html.replace('<script type="module"',
        '<script>const params = new URLSearchParams(location.search); '
        + params + ' history.replaceState(null, "", location.pathname + "?" + params + location.hash);</script>\n  <script type="module"', 1)
    html = html.replace('</body>', '  <script src="../preview.js"></script>\n</body>')
    return html


def demo_index_html(source: str) -> str:
    links = {
        'href="./demos.html"': 'href="./"',
        'href="./?scene=spatial&amp;stage=overview"': 'href="../glassui-spatial/?stage=overview"',
        'href="./?scene=spatial"': 'href="../glassui-spatial/?stage=login"',
        'href="./?scene=gallery"': 'href="../glassui-gallery/"',
        'href="./?scene=signup"': 'href="../glassui-signup/"',
    }
    for old, new in links.items():
        if old not in source:
            raise SystemExit(f'ThreeDUI demo index changed: missing {old}')
        source = source.replace(old, new)
    return source.replace('</body>', '  <script src="../preview.js"></script>\n</body>')


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
    demo_entry = dist / 'demos.html'
    if not demo_entry.is_file():
        raise SystemExit(f'missing ThreeDUI demo index: {demo_entry}')
    demo_html = demo_index_html(demo_entry.read_text(encoding='utf-8'))
    images = dist / 'images'
    if not images.is_dir():
        raise SystemExit(f'missing ThreeDUI demo images: {images}')
    signup = site / 'concepts/glassui-signup'
    spatial = site / 'concepts/glassui-spatial'
    gallery = site / 'concepts/glassui-gallery'
    demo_index = site / 'concepts/glassui-demos'
    assets = signup / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    spatial.mkdir(parents=True, exist_ok=True)
    gallery.mkdir(parents=True, exist_ok=True)
    (demo_index / 'images').mkdir(parents=True, exist_ok=True)
    for stale in assets.glob('*.js'):
        stale.unlink()
    shutil.copyfile(bundle, assets / bundle.name)
    (signup / 'index.html').write_text(concept_html(source, 'signup', f'./assets/{bundle.name}'), encoding='utf-8')
    (spatial / 'index.html').write_text(concept_html(source, 'spatial', f'../glassui-signup/assets/{bundle.name}'), encoding='utf-8')
    (gallery / 'index.html').write_text(concept_html(source, 'gallery', f'../glassui-signup/assets/{bundle.name}'), encoding='utf-8')
    (demo_index / 'index.html').write_text(demo_html, encoding='utf-8')
    for image in images.iterdir():
        if image.is_file():
            shutil.copyfile(image, demo_index / 'images' / image.name)
    print(f'Published four ThreeDUI concepts from {bundle.name}')


if __name__ == '__main__':
    main()
