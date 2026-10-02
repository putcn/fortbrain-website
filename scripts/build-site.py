#!/usr/bin/env python3
"""
Static generator for the two sub-sites.

Inputs (under --root, default: repo root)
  blogs/posts/<slug>/zh.md (+ en.md)   bilingual posts, simple `key: value` front matter
  concepts/concepts.json               the UX Sandbox table

Outputs (under --out, default: --root)
  blogs/index.html, blogs/<slug>/index.html, blogs/posts.json, concepts/index.html

`--check` validates and writes nothing. Idempotent: same input → byte-identical output.
"""
import argparse
import html
import json
import re
import shutil
import sys
from pathlib import Path

import markdown

TAGS = {'concept', 'tech'}
STATUS = ['final', 'lab', 'early']
MD = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc', 'attr_list'])
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
IMG = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')

T = {  # UI strings of the generated pages
    'zh': {'blog': 'Blog', 'sandbox': 'UX Sandbox', 'lede': '概念背后的想法，和我们怎么把技术做出来。',
           'all': '全部', 'concept': '概念', 'tech': '技术', 'back': '← 全部文章', 'prev': '上一篇', 'next': '下一篇',
           'open': '打开实验 →', 'zhOnly': '', 'sbLede': '交互与质感的实验场。全部是单文件、示例数据，可拖、可点。',
           'final': '定稿', 'lab': '实验台', 'early': '早期对照', 'openC': '打开 →',
           'foot': '概念稿只用示例数据，不连任何真实服务'},
    'en': {'blog': 'Blog', 'sandbox': 'UX Sandbox', 'lede': 'The thinking behind the concepts, and how we build the technology.',
           'all': 'All', 'concept': 'Concept', 'tech': 'Tech', 'back': '← All posts', 'prev': 'Previous', 'next': 'Next',
           'open': 'Open the experiment →', 'zhOnly': 'This post is in Chinese only.',
           'sbLede': 'A playground for interaction and material. Single files, sample data; drag, click, explore.',
           'final': 'Final', 'lab': 'Lab', 'early': 'Early', 'openC': 'Open →',
           'foot': 'Concepts use sample data only and talk to no real service'},
}
E = html.escape


class BuildError(Exception):
    pass


# ── inputs ───────────────────────────────────────────────────────────────────
def parse_post(path: Path):
    text = path.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', text, re.S)
    if not m:
        raise BuildError(f'{path}: missing front matter')
    meta = {}
    for line in m.group(1).splitlines():
        if not line.strip():
            continue
        if ':' not in line:
            raise BuildError(f'{path}: bad front matter line {line!r}')
        k, v = line.split(':', 1)
        meta[k.strip()] = v.strip()
    return meta, m.group(2)


def load_posts(root: Path, concept_ids):
    posts = []
    for d in sorted((root / 'blogs' / 'posts').glob('*')):
        if not d.is_dir():
            continue
        zh = d / 'zh.md'
        if not zh.exists():
            raise BuildError(f'{d}: zh.md is required')
        meta, body_zh = parse_post(zh)
        errs = []
        for k in ('title', 'date', 'summary', 'tags'):
            if not meta.get(k):
                errs.append(f'missing {k}')
        if meta.get('date') and not DATE_RE.match(meta['date']):
            errs.append(f"date {meta['date']!r} is not YYYY-MM-DD")
        tags = [t.strip() for t in meta.get('tags', '').split(',') if t.strip()]
        bad = [t for t in tags if t not in TAGS]
        if bad:
            errs.append(f'tags {bad} not in {sorted(TAGS)}')
        if meta.get('concept') and meta['concept'] not in concept_ids:
            errs.append(f"concept {meta['concept']!r} not in concepts.json")
        if errs:
            raise BuildError(f'{zh}: ' + '; '.join(errs))
        en_path = d / 'en.md'
        en_meta, body_en = parse_post(en_path) if en_path.exists() else ({}, None)
        if en_path.exists() and not en_meta.get('title'):
            raise BuildError(f'{en_path}: missing title')
        posts.append({
            'slug': d.name, 'dir': d, 'date': meta['date'], 'tags': tags, 'concept': meta.get('concept'),
            'title': {'zh': meta['title'], 'en': en_meta.get('title', meta['title'])},
            'summary': {'zh': meta['summary'], 'en': en_meta.get('summary', meta['summary'])},
            'body': {'zh': body_zh, 'en': body_en}, 'hasEn': body_en is not None,
        })
    posts.sort(key=lambda p: (p['date'], p['slug']), reverse=True)
    return posts


def load_concepts(root: Path):
    path = root / 'concepts' / 'concepts.json'
    if not path.exists():
        raise BuildError(f'{path}: missing')
    items = json.loads(path.read_text(encoding='utf-8'))
    for c in items:
        for k in ('id', 'file', 'date', 'status', 'title', 'summary'):
            if k not in c:
                raise BuildError(f'{path}: concept {c.get("id", "?")!r} missing {k}')
        if c['status'] not in STATUS:
            raise BuildError(f"{path}: concept {c['id']!r} status {c['status']!r} not in {STATUS}")
        if not DATE_RE.match(c['date']):
            raise BuildError(f"{path}: concept {c['id']!r} date {c['date']!r} is not YYYY-MM-DD")
        if not (root / 'concepts' / c['file']).exists():
            raise BuildError(f"{path}: concept {c['id']!r} file {c['file']!r} does not exist")
        c.setdefault('live', True)
    return items


def render_md(text: str) -> str:
    MD.reset()
    return MD.convert(text)


# ── page chrome ──────────────────────────────────────────────────────────────
def both(zh, en):
    return f'<span lang="zh-CN">{zh}</span><span lang="en">{en}</span>'


def shell(title, desc, canonical, body, site):
    """One HTML document with both languages inside; sub.js picks one by setting <html lang>."""
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{E(desc)}">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta name="theme-color" content="#050b18">
<link rel="canonical" href="{E(canonical)}">
<title>{E(title)}</title>
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="stylesheet" href="/css/sub.css">
</head>
<body class="sub sub-{site}">
<header class="topbar">
  <a class="brand" href="/">Fortbrain</a>
  <span class="site">{both(E(T['zh'][site]), E(T['en'][site]))}</span>
  <nav class="links">
    <a href="/blogs/">Blog</a>
    <a href="/concepts/">UX Sandbox</a>
    <button id="langBtn" type="button" aria-label="Switch language">{both('EN', '中文')}</button>
  </nav>
</header>
<main class="wrap">
{body}
</main>
<footer class="foot">{both('Fortbrain · ' + E(T['zh']['foot']), 'Fortbrain · ' + E(T['en']['foot']))} · <a href="/">fortbrain.ai</a></footer>
<script type="module" src="/js/sub.js"></script>
</body>
</html>
'''


def tag_chips(tags):
    return ''.join(f'<span class="chip chip-{t}">{both(E(T["zh"][t]), E(T["en"][t]))}</span>' for t in tags)


def blog_index(posts):
    items = ''.join(f'''  <article class="post" data-tags="{' '.join(p['tags'])}">
    <div class="meta"><time datetime="{p['date']}">{p['date']}</time>{tag_chips(p['tags'])}</div>
    <h2><a href="/blogs/{p['slug']}/">{both(E(p['title']['zh']), E(p['title']['en']))}</a></h2>
    <p>{both(E(p['summary']['zh']), E(p['summary']['en']))}</p>
  </article>
''' for p in posts)
    body = f'''<section class="hero">
  <div class="eyebrow">Fortbrain · Blog</div>
  <h1>Blog</h1>
  <p class="lede">{both(E(T['zh']['lede']), E(T['en']['lede']))}</p>
</section>
<div class="filters">
  <button class="on" data-filter="">{both(T['zh']['all'], T['en']['all'])}</button>
  <button data-filter="concept">{both(T['zh']['concept'], T['en']['concept'])}</button>
  <button data-filter="tech">{both(T['zh']['tech'], T['en']['tech'])}</button>
</div>
<section class="posts">
{items}</section>'''
    return shell('Fortbrain · Blog', T['zh']['lede'], 'https://fortbrain.ai/blogs/', body, 'blog')


def blog_post(p, prev, nxt, concepts):
    zh_html = render_md(p['body']['zh'])
    en_html = render_md(p['body']['en']) if p['hasEn'] else f'<p class="note">{E(T["en"]["zhOnly"])}</p>' + render_md(p['body']['zh'])
    concept = next((c for c in concepts if c['id'] == p['concept']), None) if p['concept'] else None
    concept_html = f'''  <aside class="concept-card">
    <div class="eyebrow">UX Sandbox</div>
    <b>{both(E(concept['title']['zh']), E(concept['title']['en']))}</b>
    <a class="btn" href="/concepts/{E(concept['file'])}" target="_blank" rel="noopener">{both(E(T['zh']['open']), E(T['en']['open']))}</a>
  </aside>
''' if concept else ''
    pn = '<nav class="pn">'
    pn += (f'<a class="prev" href="/blogs/{prev["slug"]}/"><small>{both(T["zh"]["prev"], T["en"]["prev"])}</small>'
           f'{both(E(prev["title"]["zh"]), E(prev["title"]["en"]))}</a>') if prev else '<span></span>'
    pn += (f'<a class="next" href="/blogs/{nxt["slug"]}/"><small>{both(T["zh"]["next"], T["en"]["next"])}</small>'
           f'{both(E(nxt["title"]["zh"]), E(nxt["title"]["en"]))}</a>') if nxt else '<span></span>'
    pn += '</nav>'
    body = f'''<a class="back" href="/blogs/">{both(E(T['zh']['back']), E(T['en']['back']))}</a>
<article class="article">
  <header>
    <div class="meta"><time datetime="{p['date']}">{p['date']}</time>{tag_chips(p['tags'])}</div>
    <h1>{both(E(p['title']['zh']), E(p['title']['en']))}</h1>
    <p class="lede">{both(E(p['summary']['zh']), E(p['summary']['en']))}</p>
  </header>
  <div class="body" lang="zh-CN">
{zh_html}
  </div>
  <div class="body" lang="en">
{en_html}
  </div>
{concept_html}</article>
{pn}'''
    return shell(f"{p['title']['zh']} · Fortbrain Blog", p['summary']['zh'], f'https://fortbrain.ai/blogs/{p["slug"]}/', body, 'blog')


def concepts_index(concepts):
    groups = ''
    for st in STATUS:
        items = sorted((c for c in concepts if c['status'] == st), key=lambda c: (c['date'], c['id']), reverse=True)
        if not items:
            continue
        cards = ''.join(f'''    <a class="card" href="{E(c['file'])}" target="_blank" rel="noopener">
      <div class="pv" data-letter="{E(c['title']['zh'][:1])}"{(' data-src="' + E(c['file']) + '?preview=1"') if c.get('live') else ''}></div>
      <div class="k"><span class="chip chip-{st}">{both(T['zh'][st], T['en'][st])}</span><time datetime="{c['date']}">{c['date']}</time></div>
      <h2>{both(E(c['title']['zh']), E(c['title']['en']))}</h2>
      <p>{both(E(c['summary']['zh']), E(c['summary']['en']))}</p>
      <div class="go">{both(T['zh']['openC'], T['en']['openC'])}</div>
    </a>
''' for c in items)
        groups += f'<div class="sect">{both(T["zh"][st], T["en"][st])}</div>\n<div class="grid">\n{cards}</div>\n'
    body = f'''<section class="hero">
  <div class="eyebrow">Fortbrain · Concepts</div>
  <h1>UX Sandbox</h1>
  <p class="lede">{both(E(T['zh']['sbLede']), E(T['en']['sbLede']))}</p>
</section>
{groups}<script type="module" src="/js/preview-loader.js"></script>'''
    return shell('Fortbrain · UX Sandbox', T['zh']['sbLede'], 'https://fortbrain.ai/concepts/', body, 'sandbox')


# ── main ─────────────────────────────────────────────────────────────────────
def build(root: Path, out: Path, check: bool):
    concepts = load_concepts(root)
    posts = load_posts(root, {c['id'] for c in concepts})
    if check:
        return
    (out / 'blogs').mkdir(parents=True, exist_ok=True)
    (out / 'concepts').mkdir(parents=True, exist_ok=True)
    (out / 'blogs' / 'index.html').write_text(blog_index(posts), encoding='utf-8')
    for i, p in enumerate(posts):
        d = out / 'blogs' / p['slug']
        d.mkdir(parents=True, exist_ok=True)
        prev = posts[i - 1] if i > 0 else None               # newer
        nxt = posts[i + 1] if i + 1 < len(posts) else None   # older
        (d / 'index.html').write_text(blog_post(p, prev, nxt, concepts), encoding='utf-8')
        for asset in p['dir'].iterdir():                      # images next to the post travel with it
            if asset.suffix.lower() in IMG:
                shutil.copyfile(asset, d / asset.name)
    (out / 'blogs' / 'posts.json').write_text(json.dumps([
        {'slug': p['slug'], 'date': p['date'], 'tags': p['tags'], 'title': p['title'], 'summary': p['summary'],
         'url': f"/blogs/{p['slug']}/", 'hasEn': p['hasEn']} for p in posts], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (out / 'concepts' / 'index.html').write_text(concepts_index(concepts), encoding='utf-8')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument('--out', default=None)
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    root = Path(a.root).resolve()
    try:
        build(root, Path(a.out).resolve() if a.out else root, a.check)
    except BuildError as e:
        print(f'error: {e}', file=sys.stderr)
        sys.exit(1)
