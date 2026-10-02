# Blog + UX Sandbox + Homepage Tail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Markdown-driven bilingual blog at `/blogs/`, rebuild the `/concepts/` index as "UX Sandbox" with live scaled-down previews, move `sf-tour.html` under `concepts/` with a redirect, and give the homepage a tail panel (latest post + latest concept) and a top-right Blog link.

**Architecture:** One Python generator (`scripts/build-site.py`, python-markdown) turns `blogs/posts/*/{zh,en}.md` and `concepts/concepts.json` into committed static HTML plus `blogs/posts.json`. Sub-site pages share `css/sub.css` + `js/sub.js` (language toggle on `localStorage.lang`). Live previews are same-origin iframes of the concept pages in `?preview=1` mode, managed by `js/preview-loader.js` (IntersectionObserver, concurrency cap). The homepage reads the two JSON files in `js/tail.js` and renders the tail panel over a 3-screen finale.

**Tech Stack:** Python 3.12 + `markdown` 3.10 (installed), vanilla ES modules, `node --test`, GitHub Pages (`.nojekyll` present).

**Spec:** `docs/superpowers/specs/2026-10-02-blog-sandbox-tail-design.md`

## Global Constraints

- Generated files are committed; the generator must be idempotent (same input → byte-identical output).
- `tags` accept only `concept` and `tech`; `status` accepts only `final`, `lab`, `early`; dates are `YYYY-MM-DD`.
- No file or folder deployed to Pages may start with `_` (Jekyll rule; `.nojekyll` exists but keep the habit).
- Sub-site language key is `localStorage.lang` with values `zh` / `en`, same as the homepage; `<html lang>` is `zh-CN` or `en`.
- Blog URLs are `/blogs/<slug>/`; tiles and cards open in a new tab with `rel="noopener"`.
- Bump `VERSION` in `js/main.js` and the `?v=` on the `<script>` tag in `index.html` before each push.
- Commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. A post with `en.md` missing must still build and show a "Chinese only" notice in English mode (Task 1 test).
2. Front matter with an unknown tag, bad date, or a `concept:` id not in `concepts.json` must fail `--check` with exit 1 and a message naming the file (Task 1 test).
3. `concepts.json` entries whose `file` does not exist must fail the build (Task 1 test).
4. The homepage tail must render "—" and keep working when either JSON fetch fails (Task 7: fetch rejected → tile shows dash, error pushed to `window.__fb.errors`).
5. `/sf-tour.html?x=1#y` must redirect preserving query and hash (Task 5 browser check).

---

## Batch 1 — generator + blog (Tasks 1–3)

### Task 1: Generator with validation, tested on a fixture

**Files:**
- Create: `scripts/build-site.py`
- Test: `tests/build-site.test.mjs`, `tests/fixtures/site/` (fixture inputs)

**Interfaces:**
- Produces CLI: `python3 scripts/build-site.py [--root DIR] [--out DIR] [--check]`.
  - `--root` (default repo root): where `blogs/posts/` and `concepts/concepts.json` are read from.
  - `--out` (default = root): where `blogs/index.html`, `blogs/<slug>/index.html`, `blogs/posts.json`, `concepts/index.html` are written.
  - `--check`: validate only; exit 1 with `error: <file>: <reason>` lines on stderr.
- `posts.json` schema: `[{ "slug", "date", "tags": [..], "title": {"zh","en"}, "summary": {"zh","en"}, "url": "/blogs/<slug>/", "hasEn": bool }]`, newest first.
- Pages depend on `../css/sub.css` and `../js/sub.js` (Task 2) via absolute paths `/css/sub.css`, `/js/sub.js`, `/js/preview-loader.js`, `/assets/favicon.ico`.

- [ ] **Step 1: Fixture inputs**

Create `tests/fixtures/site/concepts/concepts.json`:

```json
[
  { "id": "alpha", "file": "alpha.html", "date": "2026-09-30", "status": "final", "live": true,
    "title": { "zh": "甲概念", "en": "Alpha concept" }, "summary": { "zh": "甲的摘要", "en": "Alpha summary" } },
  { "id": "beta", "file": "beta.html", "date": "2026-09-28", "status": "lab", "live": false,
    "title": { "zh": "乙概念", "en": "Beta concept" }, "summary": { "zh": "乙的摘要", "en": "Beta summary" } }
]
```

Create empty files `tests/fixtures/site/concepts/alpha.html` and `beta.html` (one line `<!doctype html>`).

Create `tests/fixtures/site/blogs/posts/first/zh.md`:

```markdown
---
title: 第一篇
date: 2026-10-01
tags: tech
summary: 第一篇摘要
concept: alpha
---

## 小节

正文 **加粗**。
```

`tests/fixtures/site/blogs/posts/first/en.md`:

```markdown
---
title: First post
date: 2026-10-01
tags: tech
summary: First summary
---

## Section

Body **bold**.
```

`tests/fixtures/site/blogs/posts/second/zh.md` (no `en.md`):

```markdown
---
title: 第二篇
date: 2026-09-20
tags: concept
summary: 第二篇摘要
---

只有中文。
```

Create `tests/fixtures/site-bad/concepts/concepts.json` as `[]` and `tests/fixtures/site-bad/blogs/posts/bad/zh.md`:

```markdown
---
title: 坏文章
date: 2026/10/01
tags: news
summary: x
concept: nope
---

x
```

- [ ] **Step 2: Write the failing tests**

`tests/build-site.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SCRIPT = new URL('../scripts/build-site.py', import.meta.url).pathname
const FIX = new URL('./fixtures/site', import.meta.url).pathname
const BAD = new URL('./fixtures/site-bad', import.meta.url).pathname
const run = (args) => spawnSync('python3', [SCRIPT, ...args], { encoding: 'utf8' })

test('builds blog pages, posts.json and the concepts index from the fixture', () => {
  const out = mkdtempSync(join(tmpdir(), 'fb-site-'))
  try {
    const r = run(['--root', FIX, '--out', out])
    assert.equal(r.status, 0, r.stderr)
    for (const f of ['blogs/index.html', 'blogs/first/index.html', 'blogs/second/index.html', 'blogs/posts.json', 'concepts/index.html']) assert.ok(existsSync(join(out, f)), f)
    const posts = JSON.parse(readFileSync(join(out, 'blogs/posts.json'), 'utf8'))
    assert.deepEqual(posts.map((p) => p.slug), ['first', 'second'])                 // newest first
    assert.deepEqual(posts[0], { slug: 'first', date: '2026-10-01', tags: ['tech'], title: { zh: '第一篇', en: 'First post' }, summary: { zh: '第一篇摘要', en: 'First summary' }, url: '/blogs/first/', hasEn: true })
    assert.equal(posts[1].hasEn, false)
    const first = readFileSync(join(out, 'blogs/first/index.html'), 'utf8')
    assert.ok(first.includes('lang="zh-CN"') && first.includes('lang="en"'), 'both languages embedded')
    assert.ok(first.includes('<strong>加粗</strong>') && first.includes('<strong>bold</strong>'))
    assert.ok(first.includes('href="/concepts/alpha.html"'), 'concept link')
    assert.ok(first.includes('href="/blogs/second/"'), 'next/prev link')
    const second = readFileSync(join(out, 'blogs/second/index.html'), 'utf8')
    assert.ok(second.includes('This post is in Chinese only'))
    const idx = readFileSync(join(out, 'concepts/index.html'), 'utf8')
    assert.ok(idx.includes('data-src="alpha.html?preview=1"'), 'live preview src')
    assert.ok(!idx.includes('data-src="beta.html'), 'non-live concept has no preview src')
    assert.ok(idx.indexOf('甲概念') < idx.indexOf('乙概念'), 'final group before lab group')
    // idempotent
    const r2 = run(['--root', FIX, '--out', out]); assert.equal(r2.status, 0)
    assert.equal(readFileSync(join(out, 'blogs/first/index.html'), 'utf8'), first)
  } finally { rmSync(out, { recursive: true, force: true }) }
})

test('--check rejects bad front matter and names the file', () => {
  const r = run(['--root', BAD, '--check'])
  assert.equal(r.status, 1)
  assert.match(r.stderr, /bad\/zh\.md/)
  assert.match(r.stderr, /date/); assert.match(r.stderr, /tags/); assert.match(r.stderr, /concept/)
})

test('--check rejects a concept whose file is missing', () => {
  const out = mkdtempSync(join(tmpdir(), 'fb-site-'))
  try {
    const r = run(['--root', FIX, '--out', out, '--check'])
    assert.equal(r.status, 0, r.stderr)
  } finally { rmSync(out, { recursive: true, force: true }) }
  const r2 = spawnSync('python3', ['-c', `
import json,sys,subprocess,tempfile,shutil,os
src=${JSON.stringify(FIX)}; d=tempfile.mkdtemp(); shutil.copytree(src, d, dirs_exist_ok=True)
os.remove(os.path.join(d,'concepts','beta.html'))
sys.exit(subprocess.run(['python3', ${JSON.stringify(SCRIPT)}, '--root', d, '--check']).returncode)`], { encoding: 'utf8' })
  assert.equal(r2.status, 1)
})
```

- [ ] **Step 3: Run tests, expect failure**

Run: `node --test tests/build-site.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → `# fail 3` (script missing).

- [ ] **Step 4: Write `scripts/build-site.py`**

```python
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
import argparse, html, json, re, shutil, sys
from pathlib import Path
import markdown

TAGS = {'concept', 'tech'}
STATUS = ['final', 'lab', 'early']
MD = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc', 'attr_list'])
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')

T = {  # UI strings of the generated pages
    'zh': {'blog': 'Blog', 'lede': '概念背后的想法，和我们怎么把技术做出来。', 'all': '全部', 'concept': '概念', 'tech': '技术',
           'home': '首页', 'sandbox': 'UX Sandbox', 'back': '← 全部文章', 'prev': '上一篇', 'next': '下一篇', 'open': '打开实验 →',
           'zhOnly': '', 'sbLede': '交互与质感的实验场。全部是单文件、示例数据，可拖、可点。',
           'final': '定稿', 'lab': '实验台', 'early': '早期对照', 'openC': '打开 →', 'phone': '手机上点开看完整演示', 'foot': '概念稿只用示例数据，不连任何真实服务'},
    'en': {'blog': 'Blog', 'lede': 'The thinking behind the concepts, and how we build the technology.', 'all': 'All', 'concept': 'Concept', 'tech': 'Tech',
           'home': 'Home', 'sandbox': 'UX Sandbox', 'back': '← All posts', 'prev': 'Previous', 'next': 'Next', 'open': 'Open the experiment →',
           'zhOnly': 'This post is in Chinese only.', 'sbLede': 'A playground for interaction and material. Single files, sample data; drag, click, explore.',
           'final': 'Final', 'lab': 'Lab', 'early': 'Early', 'openC': 'Open →', 'phone': 'Open on a phone to see the full demo', 'foot': 'Concepts use sample data only and talk to no real service'},
}
E = html.escape


class BuildError(Exception):
    pass


def parse_post(path: Path):
    text = path.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', text, re.S)
    if not m:
        raise BuildError(f'{path}: missing front matter')
    meta = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if ':' not in line:
            raise BuildError(f'{path}: bad front matter line {line!r}')
        k, v = line.split(':', 1)
        meta[k.strip()] = v.split('#')[0].strip() if k.strip() != 'title' and k.strip() != 'summary' else v.strip()
    body = m.group(2)
    return meta, body


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
        en_meta, body_en = (parse_post(en_path) if en_path.exists() else ({}, None))
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
def shell(title, desc, canonical, body, site, depth):
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
  <span class="site"><span lang="zh-CN">{E(T['zh'][site])}</span><span lang="en">{E(T['en'][site])}</span></span>
  <nav class="links">
    <a href="/blogs/"><span lang="zh-CN">Blog</span><span lang="en">Blog</span></a>
    <a href="/concepts/"><span lang="zh-CN">UX Sandbox</span><span lang="en">UX Sandbox</span></a>
    <button id="langBtn" type="button" aria-label="Switch language"><span lang="zh-CN">EN</span><span lang="en">中文</span></button>
  </nav>
</header>
<main class="wrap">
{body}
</main>
<footer class="foot"><span lang="zh-CN">Fortbrain · {E(T['zh']['foot'])}</span><span lang="en">Fortbrain · {E(T['en']['foot'])}</span> · <a href="/">fortbrain.ai</a></footer>
<script type="module" src="/js/sub.js"></script>
</body>
</html>
'''


def both(zh, en):
    return f'<span lang="zh-CN">{zh}</span><span lang="en">{en}</span>'


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
<div class="filters" role="tablist">
  <button class="on" data-filter="">{both(T['zh']['all'], T['en']['all'])}</button>
  <button data-filter="concept">{both(T['zh']['concept'], T['en']['concept'])}</button>
  <button data-filter="tech">{both(T['zh']['tech'], T['en']['tech'])}</button>
</div>
<section class="posts">
{items}</section>'''
    return shell('Fortbrain · Blog', T['zh']['lede'], 'https://fortbrain.ai/blogs/', body, 'blog', 1)


def blog_post(p, prev, nxt, concepts):
    zh_html = render_md(p['body']['zh'])
    en_html = render_md(p['body']['en']) if p['hasEn'] else f'<p class="note">{E(T["en"]["zhOnly"])}</p>' + render_md(p['body']['zh'])
    concept = next((c for c in concepts if c['id'] == p['concept']), None) if p['concept'] else None
    concept_html = f'''<aside class="concept-card">
  <div class="eyebrow">UX Sandbox</div>
  <b>{both(E(concept['title']['zh']), E(concept['title']['en']))}</b>
  <a class="btn" href="/concepts/{E(concept['file'])}" target="_blank" rel="noopener">{both(E(T['zh']['open']), E(T['en']['open']))}</a>
</aside>''' if concept else ''
    nav = '<nav class="pn">'
    nav += f'<a class="prev" href="/blogs/{prev["slug"]}/"><small>{both(T["zh"]["prev"], T["en"]["prev"])}</small>{both(E(prev["title"]["zh"]), E(prev["title"]["en"]))}</a>' if prev else '<span></span>'
    nav += f'<a class="next" href="/blogs/{nxt["slug"]}/"><small>{both(T["zh"]["next"], T["en"]["next"])}</small>{both(E(nxt["title"]["zh"]), E(nxt["title"]["en"]))}</a>' if nxt else '<span></span>'
    nav += '</nav>'
    body = f'''<a class="back" href="/blogs/">{both(E(T['zh']['back']), E(T['en']['back']))}</a>
<article class="article">
  <header>
    <div class="meta"><time datetime="{p['date']}">{p['date']}</time>{tag_chips(p['tags'])}</div>
    <h1>{both(E(p['title']['zh']), E(p['title']['en']))}</h1>
    <p class="lede">{both(E(p['summary']['zh']), E(p['summary']['en']))}</p>
  </header>
  <div class="body" lang="zh-CN">{zh_html}</div>
  <div class="body" lang="en">{en_html}</div>
  {concept_html}
</article>
{nav}'''
    return shell(f"{p['title']['zh']} · Fortbrain Blog", p['summary']['zh'], f'https://fortbrain.ai/blogs/{p["slug"]}/', body, 'blog', 2)


def concepts_index(concepts):
    groups = ''
    for st in STATUS:
        items = [c for c in concepts if c['status'] == st]
        if not items:
            continue
        items.sort(key=lambda c: (c['date'], c['id']), reverse=True)
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
    return shell('Fortbrain · UX Sandbox', T['zh']['sbLede'], 'https://fortbrain.ai/concepts/', body, 'sandbox', 1)


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
        prev = posts[i - 1] if i > 0 else None          # newer
        nxt = posts[i + 1] if i + 1 < len(posts) else None  # older
        (d / 'index.html').write_text(blog_post(p, prev, nxt, concepts), encoding='utf-8')
        for asset in p['dir'].iterdir():                 # images next to the post travel with it
            if asset.suffix.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'):
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
```

- [ ] **Step 5: Run tests, expect pass**

Run: `node --test tests/build-site.test.mjs 2>&1 | grep -E "^# (pass|fail)|not ok"` → `# pass 3`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-site.py tests/build-site.test.mjs tests/fixtures
git commit -m "feat(site): static generator for the blog and the concepts index, with front-matter validation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Sub-site chrome (`css/sub.css`, `js/sub.js`)

**Files:**
- Create: `css/sub.css`, `js/sub.js`

**Interfaces:**
- `js/sub.js`: on load sets `<html lang>` from `localStorage.lang` (fallback `navigator.language`), wires `#langBtn`, wires `.filters button[data-filter]` to show/hide `.post[data-tags]`.
- CSS classes used by the generator: `.topbar .brand .site .links`, `.wrap .hero .eyebrow .lede`, `.filters`, `.posts .post .meta .chip .chip-concept .chip-tech`, `.article .body .note .concept-card .btn .pn .back`, `.sect .grid .card .pv .k .chip-final .chip-lab .chip-early .go`.

- [ ] **Step 1: `js/sub.js`**

```js
/**
 * Shared behaviour of the sub-sites (blog, UX Sandbox): the language toggle, on the same
 * `localStorage.lang` key as the homepage, and the blog list's tag filter. Both languages are
 * in the HTML; CSS shows the one matching <html lang>.
 */
function initial() {
  try { const s = localStorage.getItem('lang'); if (s === 'zh' || s === 'en') return s } catch { /* private mode */ }
  return String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
function apply(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  try { localStorage.setItem('lang', lang) } catch { /* fine, just not remembered */ }
}
let lang = initial()
apply(lang)
document.getElementById('langBtn')?.addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; apply(lang) })

const filters = document.querySelectorAll('.filters button[data-filter]')
for (const b of filters) b.addEventListener('click', () => {
  filters.forEach((x) => x.classList.toggle('on', x === b))
  const want = b.dataset.filter
  for (const p of document.querySelectorAll('.post[data-tags]')) p.hidden = !!want && !p.dataset.tags.split(' ').includes(want)
})
```

- [ ] **Step 2: `css/sub.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #050b18; --ink: #e3f1ff; --dim: #5f7f9e; --dim2: #9fb4cb; --acc: #a6dcff; --gold: #e8cf8f;
  --rule: rgba(120, 190, 255, .15); --glass: rgba(10, 32, 56, .45);
  --sans: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", "Segoe UI", "Microsoft YaHei", sans-serif;
  --mono: "SF Mono", Menlo, Consolas, "Roboto Mono", "Noto Sans SC", "PingFang SC", monospace;
  color-scheme: dark;
}
html { scroll-behavior: smooth; }
body.sub { background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(63, 169, 204, .10), transparent 60%), var(--bg); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; min-height: 100svh; }
/* one language at a time */
html[lang="en"] [lang="zh-CN"], html[lang="zh-CN"] [lang="en"] { display: none !important; }

.topbar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 18px; padding: 16px 24px; background: rgba(5, 11, 24, .72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--rule); }
.topbar .brand { font-family: var(--mono); font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: rgba(227, 241, 255, .6); text-decoration: none; }
.topbar .site { font-family: var(--mono); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--dim); }
.topbar .links { margin-left: auto; display: flex; align-items: center; gap: 14px; }
.topbar .links a { font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim2); text-decoration: none; }
.topbar .links a:hover { color: var(--ink); }
#langBtn { font: 500 12px/1 var(--mono); letter-spacing: .12em; color: var(--dim); background: rgba(5, 11, 24, .4); border: 1px solid var(--rule); border-radius: 999px; padding: 8px 14px; cursor: pointer; }
#langBtn:hover { color: var(--ink); border-color: rgba(166, 220, 255, .45); }

.wrap { max-width: 1120px; margin: 0 auto; padding: 56px 24px 96px; }
.hero { margin-bottom: 40px; }
.eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: var(--dim); margin-bottom: 14px; }
h1 { font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 300; letter-spacing: .02em; line-height: 1.25; }
.lede { margin-top: 14px; color: var(--dim2); font-size: 1.02rem; line-height: 1.8; max-width: 60ch; }
.foot { max-width: 1120px; margin: 0 auto; padding: 0 24px 48px; font-family: var(--mono); font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--dim); }
.foot a { color: var(--dim2); text-decoration: none; }
.chip { display: inline-block; font-family: var(--mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; padding: 3px 9px; border: 1px solid var(--rule); border-radius: 999px; color: var(--dim2); }
.chip-tech, .chip-final { color: var(--gold); border-color: rgba(232, 207, 143, .45); }
.chip-concept, .chip-lab { color: var(--acc); border-color: rgba(166, 220, 255, .4); }
time { font-family: var(--mono); font-size: 11px; letter-spacing: .12em; color: var(--dim); }

/* ── blog list ── */
.filters { display: flex; gap: 8px; margin-bottom: 28px; }
.filters button { font: 500 11px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); background: transparent; border: 1px solid var(--rule); border-radius: 999px; padding: 8px 14px; cursor: pointer; }
.filters button.on { color: var(--ink); border-color: rgba(166, 220, 255, .5); background: rgba(166, 220, 255, .08); }
.posts { max-width: 760px; }
.post { padding: 26px 0; border-top: 1px solid var(--rule); }
.post .meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post h2 { font-size: clamp(1.25rem, 2.2vw, 1.6rem); font-weight: 400; line-height: 1.4; }
.post h2 a { color: var(--ink); text-decoration: none; }
.post h2 a:hover { color: var(--acc); }
.post p { margin-top: 8px; color: var(--dim2); line-height: 1.8; }

/* ── blog article ── */
.back { display: inline-block; font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim2); text-decoration: none; margin-bottom: 28px; }
.article { max-width: 760px; }
.article header .meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.article header .lede { font-size: 1.1rem; color: #b9cde3; }
.article .body { margin-top: 40px; font-size: 1.02rem; line-height: 1.9; color: #c9d8e8; }
.article .body h2 { font-size: 1.45rem; font-weight: 400; color: var(--ink); margin: 44px 0 14px; }
.article .body h3 { font-size: 1.15rem; font-weight: 500; color: var(--ink); margin: 30px 0 10px; }
.article .body p, .article .body ul, .article .body ol { margin: 0 0 18px; }
.article .body ul, .article .body ol { padding-left: 1.4em; }
.article .body li { margin: 6px 0; }
.article .body strong { color: var(--acc); font-weight: 500; }
.article .body a { color: var(--acc); }
.article .body blockquote { border-left: 2px solid var(--gold); padding: 4px 0 4px 18px; color: var(--dim2); margin: 0 0 18px; }
.article .body code { font-family: var(--mono); font-size: .9em; background: rgba(166, 220, 255, .08); padding: 2px 6px; border-radius: 5px; }
.article .body pre { background: #040914; border: 1px solid var(--rule); border-radius: 10px; padding: 16px 18px; overflow-x: auto; margin: 0 0 18px; }
.article .body pre code { background: none; padding: 0; font-size: .88rem; line-height: 1.6; }
.article .body table { width: 100%; border-collapse: collapse; margin: 0 0 18px; font-size: .95rem; }
.article .body th, .article .body td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--rule); }
.article .body th { color: var(--dim); font-weight: 400; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.article .body img { max-width: 100%; border-radius: 12px; }
.article .body .note { color: var(--dim); font-style: italic; }
.concept-card { margin-top: 48px; padding: 22px; border: 1px solid var(--rule); border-radius: 14px; background: var(--glass); display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
.concept-card .eyebrow { margin: 0; width: 100%; }
.concept-card b { font-weight: 400; font-size: 1.1rem; flex: 1; }
.btn { font: 500 11px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--acc); border: 1px solid rgba(166, 220, 255, .4); border-radius: 999px; padding: 10px 16px; text-decoration: none; }
.btn:hover { background: rgba(166, 220, 255, .12); }
.pn { max-width: 760px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--rule); }
.pn a { color: var(--ink); text-decoration: none; line-height: 1.5; }
.pn a small { display: block; font-family: var(--mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; }
.pn .next { text-align: right; }

/* ── UX Sandbox ── */
.sect { margin: 44px 0 16px; font-family: var(--mono); font-size: 11px; letter-spacing: .32em; text-transform: uppercase; color: var(--dim); display: flex; align-items: center; gap: 14px; }
.sect::after { content: ""; flex: 1; height: 1px; background: var(--rule); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
.card { display: flex; flex-direction: column; gap: 10px; padding: 14px 14px 16px; border: 1px solid var(--rule); border-radius: 16px; background: var(--glass); backdrop-filter: blur(8px); text-decoration: none; color: inherit; transition: border-color .2s, transform .2s; }
.card:hover { border-color: var(--acc); transform: translateY(-2px); }
.card .k { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.card h2 { font-size: 1.15rem; font-weight: 400; letter-spacing: .02em; }
.card p { color: var(--dim2); font-size: .92rem; line-height: 1.7; }
.card .go { margin-top: auto; font-family: var(--mono); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--acc); }
/* live preview: an iframe rendered at 1280×800 and scaled to the card */
.pv { position: relative; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, #0a1a33, #071226 60%, #0c2240); border: 1px solid rgba(120, 190, 255, .12); }
.pv::before { content: attr(data-letter); position: absolute; inset: 0; display: grid; place-items: center; font-size: 64px; font-weight: 200; color: rgba(166, 220, 255, .18); }
.pv iframe { position: absolute; left: 0; top: 0; width: 1280px; height: 800px; border: 0; transform-origin: 0 0; pointer-events: none; opacity: 0; transition: opacity .6s; background: var(--bg); }
.pv iframe.in { opacity: 1; }

@media (max-width: 640px) {
  .topbar { padding: 12px 16px; gap: 12px; }
  .topbar .site { display: none; }
  .wrap { padding: 36px 16px 72px; }
  .pn { grid-template-columns: 1fr; }
  .pn .next { text-align: left; }
}
```

- [ ] **Step 3: Commit**

```bash
git add css/sub.css js/sub.js
git commit -m "feat(site): shared chrome for the sub-sites — language toggle, blog filter, typography

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Seed posts, concepts table, first real build, ship batch 1

**Files:**
- Create: `concepts/concepts.json`, `blogs/posts/hybrid-context/{zh,en}.md`, `blogs/posts/flowboard-cards/{zh,en}.md`
- Generated: `blogs/**`, `concepts/index.html` (the hand-written one is replaced; its sections and copy are carried into `concepts.json`)
- Modify: `README.md`

- [ ] **Step 1: `concepts/concepts.json`** (sf-tour is added in Task 5; `live` true for all — the 2D ones show their first screen)

```json
[
  { "id": "flowboard-3d", "file": "flowboard-3d.html", "date": "2026-09-30", "status": "final", "live": true,
    "title": { "zh": "产品动线牌桌（3D 卡牌）", "en": "Product flow card table (3D)" },
    "summary": { "zh": "每个项目一张牌：有问题的沿弧线摊开、正常的叠成牌堆；点牌堆在空间里摊成扇面翻牌；点牌飞上时间轴看每一步；点某一步放大成步骤页。毛玻璃牌与发光边，大屏可轮播。", "en": "One card per project: troubled ones fan out along an arc, healthy ones stack; tap a stack to fan it open in space; a card flies onto the timeline; a step zooms into its own page. Frosted glass, glowing edges, big-screen carousel." } },
  { "id": "glass-lab", "file": "glass-lab.html", "date": "2026-09-30", "status": "lab", "live": true,
    "title": { "zh": "动线玻璃实验台", "en": "Glass material lab" },
    "summary": { "zh": "同一套动线场景里的四件玻璃：透明立方体、琥珀长方体、磨砂 3D 字母、8 mm 薄玻璃。七盏灯可单独开关，四种灯光预设看玻璃在不同光下的样子。", "en": "Four pieces of glass in the flow scene: a clear cube, an amber slab, frosted 3D letters, 8 mm thin glass. Seven lights, four presets, to see how glass behaves in different light." } },
  { "id": "weather", "file": "weather.html", "date": "2026-09-30", "status": "lab", "live": true,
    "title": { "zh": "大屏天气镜头", "en": "Weather lens for the big screen" },
    "summary": { "zh": "晴、阴、雨、雪在同一张城市地图上的镜头效果，点击和拖动看细节。", "en": "Sun, overcast, rain and snow as camera moods over the same city map; click and drag for detail." } },
  { "id": "chat-button-anim", "file": "chat-button-anim.html", "date": "2026-09-30", "status": "lab", "live": true,
    "title": { "zh": "发送键思考动画", "en": "Send-button thinking animation" },
    "summary": { "zh": "聊天发送键在空闲、思考、输出三种状态下的动画，用来定助理「正在想」的手感。", "en": "The chat send button idle, thinking and streaming: the feel of an assistant that is working." } },
  { "id": "sales-rbac", "file": "sales_rbac.html", "date": "2026-09-30", "status": "lab", "live": true,
    "title": { "zh": "零售岗位与权限", "en": "Retail roles and permissions" },
    "summary": { "zh": "谁是什么岗位、管哪几家店。按组织给只对组织的直接成员生效，不往子组织传；点名用来补个例。", "en": "Who holds which role and runs which stores. Grants by organisation apply to direct members only; named grants cover the exceptions." } },
  { "id": "flowboard-cards", "file": "flowboard-cards.html", "date": "2026-09-30", "status": "early", "live": true,
    "title": { "zh": "产品动线牌桌（2D 卡牌）", "en": "Product flow card table (2D)" },
    "summary": { "zh": "卡牌想法的第一版：平面牌桌、按状态 / 步骤 / 负责人 / 更新时间分堆、点开看步骤时间线。后来因为不够 3D、牌堆交互不对而重做。", "en": "The first card version: a flat table, stacks by status / step / owner / last update, a step timeline on open. Redone because it was not spatial enough." } },
  { "id": "flowboard-concepts", "file": "flowboard-concepts.html", "date": "2026-09-30", "status": "early", "live": true,
    "title": { "zh": "产品动线三种概念", "en": "Three concepts for the product flow" },
    "summary": { "zh": "最早的三个方向：楼层 = 阶段的立体楼、流水线传送带、河流分叉。都从「看板」出发而不是从用户要做的事出发，被否掉；卡牌方案由此而来。", "en": "The three earliest directions: a building where floors are stages, a conveyor belt, a branching river. All started from the board rather than from the work; the card deck came out of rejecting them." } }
]
```

- [ ] **Step 2: Seed post `blogs/posts/hybrid-context/zh.md`**

```markdown
---
title: 端云同境：本地的留在本地，助理照样干活
date: 2026-10-02
tags: tech
summary: 员工电脑上的文件、命令、浏览器登录态，助理直接调用；内容不经服务器保存，只出站、不开端口，一个总闸随时拉。
---

企业用 AI 助理，很快会撞上一堵墙：真正有用的东西，一半在平台上（订单、库存、知识库），另一半在**员工自己的电脑上**（一份供应商 Excel、一个登录过的网站、一条只有在本机才能跑的命令）。把后者搬到云上，既不现实，也不该。

端云同境（Hybrid Context）就是为这堵墙做的：让平台上的助理能用到员工电脑上的能力，而**内容不离开那台电脑**。

## 一条只出站的通道

员工电脑上跑一个很小的常驻程序，它主动连到平台，平台永远不反向连它，电脑上也不开任何端口。助理要调一个本地工具时，请求顺着这条通道下来，结果顺着同一条通道回去，在服务器内存里过一道就转给助理，**不落库、不落盘**。

四条规矩从第一天起就是硬的：

- **只出站，不监听**。
- **服务器不留副本**。工具结果不写任何持久化存储。
- **绑定到人**。一台电脑配对到某个用户名下，只有他自己的助理能用它。
- **平台编排，本地执行**。AI 决定调什么，真正的动作发生在本地。

## 装什么、开放什么，用户自己挑

通道装好只是一条空管道。要让助理能看哪个目录、跑哪些命令，用户在页面上从目录里挑「连接器」装上：装是守护进程做的，进度推回页面；装好不等于启用，启用前先在表单里填清楚授权目录、允许的命令。**全程不用用户手打任何路径**——上一版原型就栽在这里，产品不能让人填 `/某个/venv/bin/python`。

每个连接器在页面上只有有限几种状态，而且每种状态都写明下一步：未安装、安装中、已安装未启用、在跑、起不来（把原因原文摆出来）、已停用。状态由守护进程一处算出来推上来，页面不做第二套判断。

## 三层总闸

- **本地总闸**：菜单栏或页面一按，所有调用一律拒绝，守护进程仍在线，重启后也还是关的，直到人工恢复。
- **单连接器闸**：停掉某一个，别的照常。
- **服务端闸**：撤销设备令牌。本地闸防「我现在不想让它读」，服务端闸防「这台电脑不在我手上了」。

拉闸时助理收到的是一句人话：「用户暂停了这台电脑，现在读不到任何本地内容」，并且明说不要重试。

## 它长什么样

一句话的事：「供应商列表.xlsx 里有哪些供应商，Fortbrain 里他们的采购价是多少？」助理在本机读表、在平台查价、合成一张小表回给你。表没有离开过你的电脑，价格没有离开过平台。

首页第 05 章有一个可以点的演示，走的就是这条路。
```

- [ ] **Step 3: `blogs/posts/hybrid-context/en.md`**

```markdown
---
title: Hybrid Context: local stays local, the assistant still does the work
date: 2026-10-02
tags: tech
summary: Files, commands and browser sessions on an employee's own computer, used directly by the assistant; content never stored on the server, outbound only, with a kill switch.
---

Companies that adopt AI assistants soon hit a wall: half of what is useful lives on the platform (orders, stock, knowledge bases) and the other half lives on **the employee's own computer** (a supplier spreadsheet, a website they are logged into, a command that only runs locally). Moving the second half to the cloud is neither realistic nor right.

Hybrid Context exists for that wall: the assistant on the platform can use what is on the employee's computer, and **the content never leaves that computer**.

## An outbound-only channel

A small resident program on the employee's computer dials out to the platform. The platform never connects back, and nothing listens on the computer. When the assistant calls a local tool, the request travels down that channel and the result travels back up it, passing through server memory once on its way to the assistant: **never written to a database, never written to disk**.

Four rules have been hard from day one:

- **Outbound only, nothing listens.**
- **The server keeps no copy.** Tool results never touch persistent storage.
- **Bound to a person.** A computer is paired to one user, and only that user's assistant can use it.
- **The platform orchestrates, the computer executes.** The AI decides what to call; the action happens locally.

## The user chooses what to install and what to open

A freshly installed bridge is an empty pipe. To let the assistant see a folder or run commands, the user picks "connectors" from a catalogue on the page. The daemon installs them and reports progress back; installed is not enabled, and enabling first means filling in a form: the allowed folder, the allowed commands. **The user never types a path.** The previous prototype failed exactly there: a product cannot ask people to type `/some/venv/bin/python`.

Each connector has only a handful of states on the page, and every state names the next step: not installed, installing, installed but off, running, failed (with the raw reason shown), stopped. The daemon computes the state in one place and pushes it; the page does not run a second judgement.

## Three kill switches

- **Local:** one press in the menu bar or on the page refuses every call. The daemon stays online, and the switch survives a restart until a person lifts it.
- **Per connector:** stop one, the rest keep working.
- **Server side:** revoke the device token. The local switch covers "I don't want it reading right now"; the server switch covers "that computer is no longer in my hands".

When the switch is down the assistant gets a plain sentence: "The user paused this computer; no local content can be read", with an explicit "do not retry".

## What it looks like

One sentence: "Which suppliers are in suppliers.xlsx, and what are their purchase prices in Fortbrain?" The assistant reads the sheet on your machine, looks up prices on the platform, and returns a small table. The sheet never left your computer; the prices never left the platform.

Chapter 05 on the homepage has a clickable demo that walks exactly this path.
```

- [ ] **Step 4: `blogs/posts/flowboard-cards/zh.md`**

```markdown
---
title: 产品动线牌桌：为什么是一副牌
date: 2026-10-01
tags: concept
summary: 产品动线看板从「楼层、传送带、河流」三个方向开始，被否掉之后变成了一副牌。这篇讲它是怎么一步步变成现在这张 3D 牌桌的。
concept: flowboard-3d
---

「产品动线」要回答的是一个很具体的问题：几十个项目同时在走，哪几个卡住了、卡在哪一步、谁该动。做这个看板，我们一共走了三轮。

## 第一轮：三个看起来很像看板的方向

最早的三个方向都挺好看：楼层等于阶段的立体楼，项目在楼里往上爬；一条流水线传送带，项目在带子上往前走；一条河流分叉，项目顺流而下。

它们都被否掉了，原因是同一个：**它们从「看板」出发，而不是从用户要做的事出发**。用户打开这页不是来欣赏一座楼的，是来找「我今天该管哪几个」。楼层、传送带、河流都把「正常」和「有问题」画得一样显眼。

## 第二轮：一副平面的牌

于是换了个比喻：一个项目一张牌。平面牌桌，按状态、步骤、负责人、更新时间分堆，点开一张牌看它的步骤时间线。

这一版把问题抓住了——有问题的牌和正常的牌终于长得不一样——但做出来之后又出现两个新问题：不够 3D，放在销售大屏旁边像两个产品；牌堆的交互也不对，点一摞牌弹出一个列表，和「牌」这个比喻打架。

## 第三轮：把牌桌搬进空间

现在这版（v9）是从第二版长出来的：

- **有问题的牌沿弧线摊开**，一眼能数；正常的叠成牌堆，不占注意力。
- **点牌堆，牌在空间里摊成扇面**，可以直接翻，不弹列表。
- **点一张牌，它飞上时间轴**，每一步排成一行。
- **点某一步，放大成步骤页**，图像博物馆的画框一样挂在墙上，灯一盏盏点亮。
- 牌是毛玻璃，边缘发光；飞行路径算过，不穿模；大屏模式可以轮播。

材质是在一张单独的玻璃实验台上定的：同一个场景里放四件玻璃，七盏灯可以单独开关，四种灯光预设，看磨砂和透明在不同光下的差别。

## 为什么这件事值得写

因为它是我们定交互的方法：先做三个方向比，否掉的理由要能说清楚；换比喻之后先做平面版，把「问题是什么」抓住；最后才上空间和材质。每一轮的稿子都留着，索引页上标成「早期对照」，不删。

三轮的稿子都在 UX Sandbox 里，可以拖、可以点。
```

- [ ] **Step 5: `blogs/posts/flowboard-cards/en.md`**

```markdown
---
title: The product flow card table: why a deck of cards
date: 2026-10-01
tags: concept
summary: The product flow board started as a building, a conveyor and a river, all rejected, and became a deck of cards. This is how it turned into the 3D table it is now.
---

The "product flow" board answers one concrete question: dozens of projects are moving at once, which ones are stuck, at which step, and who should act. We went through three rounds to get it right.

## Round one: three things that looked like boards

The earliest directions were all handsome: a building whose floors are stages, with projects climbing; a conveyor belt with projects moving along it; a river branching, with projects floating downstream.

All three were rejected for the same reason: **they started from the board, not from what the user came to do**. Nobody opens this page to admire a building; they open it to find "which ones do I need to handle today". The building, the belt and the river all drew "fine" and "in trouble" equally loudly.

## Round two: a flat deck

So the metaphor changed: one project, one card. A flat table, stacks by status, step, owner and last update, and a step timeline when you open a card.

That version caught the problem (troubled cards finally looked different from healthy ones) but raised two new ones. It was not spatial enough: next to the sales big screen it looked like a different product. And the stack interaction was wrong: tapping a stack popped up a list, which fought the card metaphor.

## Round three: the table moves into space

The current version (v9) grew out of the second:

- **Troubled cards fan out along an arc**, countable at a glance; healthy ones stack and stay quiet.
- **Tap a stack and the cards fan open in space**, ready to flip, no list.
- **Tap a card and it flies onto the timeline**, every step in a row.
- **Tap a step and it zooms into its own page**, images hung on a wall like museum frames, lights coming on one by one.
- Cards are frosted glass with glowing edges; flight paths are computed so nothing clips; a big-screen mode runs a carousel.

The material was settled on a separate glass lab: four pieces of glass in the same scene, seven lights that switch individually, four lighting presets, to see frosted against clear under different light.

## Why this is worth writing down

Because it is how we settle interaction: build three directions and compare, with rejection reasons that can be said out loud; after changing metaphor, build the flat version first to pin down the problem; only then add space and material. Every round's draft is kept and labelled "early" on the index, never deleted.

All three rounds are in the UX Sandbox: drag them, click them.
```

- [ ] **Step 6: Build, inspect, run the whole suite**

```bash
python3 scripts/build-site.py --check && python3 scripts/build-site.py
ls blogs blogs/hybrid-context concepts | head -20
npm test 2>&1 | grep -E "^# (pass|fail)"
```

Expected: `blogs/index.html`, `blogs/hybrid-context/index.html`, `blogs/flowboard-cards/index.html`, `blogs/posts.json`, regenerated `concepts/index.html`; all tests pass. Run the generator twice and confirm `git status` shows no further change after the second run.

- [ ] **Step 7: Browser check**

Serve with `python3 scripts/serve.py`, open `http://127.0.0.1:8931/blogs/`: two posts newest first; filter 概念 / 技术 hides the other; language button toggles the whole page without reload and the choice survives reload. Open a post: both bodies rendered, the flowboard post shows the concept card linking to `/concepts/flowboard-3d.html`, prev/next link to each other. `/concepts/` shows the three groups (previews are placeholders until Task 4).

- [ ] **Step 8: README + commit + push**

Add to README under 本地预览:

```
## 写文章 / 加概念

- 文章：`blogs/posts/<slug>/zh.md`（必须）+ `en.md`（可选），头信息 `title / date / tags(concept|tech) / summary / concept(可选, concepts.json 里的 id)`。
- 概念：往 `concepts/concepts.json` 加一条（id / file / date / status(final|lab|early) / live / title / summary），概念页末尾加 `<script src="preview.js"></script>`。
- 生成并提交：`python3 scripts/build-site.py`（`--check` 只校验）。产物 `blogs/**`、`concepts/index.html` 进仓库。
```

```bash
git add concepts/concepts.json blogs README.md concepts/index.html
git commit -m "feat(blog): two seed posts, concepts table, generated blog and sandbox index

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

## Batch 2 — live previews + sf-tour (Tasks 4–5)

### Task 4: Preview mode and loader

**Files:**
- Create: `concepts/preview.js`, `js/preview-loader.js`
- Modify: the seven `concepts/*.html` concept pages (one line before `</body>`)

**Interfaces:**
- `js/preview-loader.js` (module, side-effect on import): manages every `.pv[data-src]` on the page. Exported for the homepage: `initPreviews(root = document, { max } = {})` returning `{ dispose() }`; default export runs `initPreviews(document)` when loaded as a page script. Cap: 3 on desktop, 0 when `(pointer: coarse)`, width < 768 or `prefers-reduced-motion: reduce`.

- [ ] **Step 1: `concepts/preview.js`**

```js
/* Preview mode for the UX Sandbox index and the homepage tile: `?preview=1` hides each page's
 * chrome (bars, panels, hints, back links…) and stops the page from taking pointer events.
 * Nothing else about the page changes. */
(function () {
  if (!/(^|[?&])preview=1(&|$)/.test(location.search)) return
  document.documentElement.classList.add('fb-preview')
  var s = document.createElement('style')
  s.textContent = '.fb-preview .bar,.fb-preview .panel,.fb-preview .hud,.fb-preview .controls,.fb-preview .legend,' +
    '.fb-preview #hint,.fb-preview #back,.fb-preview #status,.fb-preview #tour,.fb-preview #frame,.fb-preview #brand,' +
    '.fb-preview #credit,.fb-preview #toast,.fb-preview #inst,.fb-preview #stats,.fb-preview #detail,.fb-preview #guide,' +
    '.fb-preview #list,.fb-preview #left,.fb-preview #right,.fb-preview #feed,.fb-preview #chips,.fb-preview #focus,' +
    '.fb-preview #presets,.fb-preview #lights,.fb-preview #readout,.fb-preview #wxDetail,.fb-preview #wxToggle{display:none!important}' +
    '.fb-preview body{pointer-events:none}'
  document.head.appendChild(s)
})()
```

- [ ] **Step 2: Add the script to the seven concept pages**

```bash
cd concepts && for f in flowboard-3d flowboard-cards flowboard-concepts glass-lab weather chat-button-anim sales_rbac; do
  grep -q 'preview.js' $f.html || perl -0pi -e 's#</body>#<script src="preview.js"></script>\n</body>#' $f.html; done
grep -c 'preview.js' *.html
```

Expected: each of the seven prints `1` (index.html prints 0; it is generated).

- [ ] **Step 3: `js/preview-loader.js`**

```js
/**
 * Live scaled-down previews. Each `.pv[data-src]` gets an iframe rendered at 1280×800 and scaled to
 * the box width, only while the box is near the viewport, and never more than `max` at once.
 * Leaving the viewport removes the iframe (frees the GPU). Phones, coarse pointers and reduced
 * motion get the static placeholder only.
 */
const W = 1280, H = 800
const phone = () => matchMedia('(pointer: coarse), (max-width: 767px)').matches
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function initPreviews(root = document, { max } = {}) {
  const cap = max ?? (phone() || reduced() ? 0 : 3)
  const boxes = [...root.querySelectorAll('.pv[data-src]')]
  if (!cap || !boxes.length) return { dispose() {} }
  const live = new Set()
  const fit = (box, f) => { f.style.transform = `scale(${(box.clientWidth / W).toFixed(4)})`; f.style.height = `${Math.round(box.clientWidth * H / W)}px` }
  const mount = (box) => {
    if (live.has(box) || live.size >= cap) return
    const f = document.createElement('iframe')
    f.title = box.closest('.card, .tile')?.querySelector('h2, h3, b')?.textContent || 'preview'
    f.setAttribute('aria-hidden', 'true'); f.loading = 'eager'
    f.addEventListener('load', () => f.classList.add('in'))
    fit(box, f); f.src = box.dataset.src; box.appendChild(f); live.add(box)
  }
  const unmount = (box) => { box.querySelector('iframe')?.remove(); live.delete(box) }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? mount(e.target) : unmount(e.target)
    // a box that waited because the cap was full gets its turn when another leaves
    for (const b of boxes) if (b.getBoundingClientRect().bottom > -120 && b.getBoundingClientRect().top < innerHeight + 120) mount(b)
  }, { rootMargin: '120px' })
  boxes.forEach((b) => io.observe(b))
  const onResize = () => { for (const b of live) fit(b, b.querySelector('iframe')) }
  addEventListener('resize', onResize)
  return { dispose() { io.disconnect(); removeEventListener('resize', onResize); boxes.forEach(unmount) } }
}

if (document.currentScript === null && !document.body.classList.contains('home')) initPreviews(document)
```

Note: the last line runs the loader automatically on the generated sub-site pages (module scripts have `currentScript === null`); the homepage imports `initPreviews` explicitly and carries `class="home"` on `<body>` (Task 7).

- [ ] **Step 4: Browser check**

Serve, open `/concepts/`: at desktop width up to three `.pv iframe` elements exist at a time (`document.querySelectorAll('.pv iframe').length ≤ 3` while scrolling), each preview shows the page without its chrome, scrolling the index is not captured by the iframes, clicking a card opens the page in a new tab. Open `flowboard-3d.html?preview=1` directly: no bars/hints, scene still animates. Open `flowboard-3d.html`: unchanged.

- [ ] **Step 5: Commit**

```bash
git add concepts/preview.js js/preview-loader.js concepts/*.html
git commit -m "feat(sandbox): preview mode for concept pages and a capped lazy iframe loader

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Move sf-tour, keep the old URL

**Files:**
- Move: `sf-tour.html` → `concepts/sf-tour.html` (+ preview script line)
- Create: `sf-tour.html` (redirect)
- Modify: `concepts/concepts.json` (add entry), regenerate `concepts/index.html`

- [ ] **Step 1: Move and add the preview line**

```bash
git mv sf-tour.html concepts/sf-tour.html
perl -0pi -e 's#</body>#<script src="preview.js"></script>\n</body>#' concepts/sf-tour.html
grep -c preview.js concepts/sf-tour.html
```

- [ ] **Step 2: Redirect page at the old path**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/concepts/sf-tour.html">
<link rel="canonical" href="https://fortbrain.ai/concepts/sf-tour.html">
<meta name="robots" content="noindex">
<title>旧金山一日地形路线</title>
<script>location.replace('/concepts/sf-tour.html' + location.search + location.hash)</script>
</head>
<body style="background:#05080f;color:#e9eef5;font-family:sans-serif;padding:24px">
<p>已搬到 <a href="/concepts/sf-tour.html" style="color:#a6dcff">/concepts/sf-tour.html</a></p>
</body>
</html>
```

- [ ] **Step 3: Register in `concepts.json`** (insert after `glass-lab`)

```json
  { "id": "sf-tour", "file": "sf-tour.html", "date": "2026-09-28", "status": "lab", "live": true,
    "title": { "zh": "旧金山一日地形路线", "en": "San Francisco in a day, on terrain" },
    "summary": { "zh": "一天的路线铺在真实地形上：站点、海拔剖面、时间轴与故事卡，桌面四角 HUD，手机底部抽屉。", "en": "A one-day route laid over real terrain: stops, elevation profile, timeline and story cards; corner HUD on desktop, bottom sheet on phones." } },
```

- [ ] **Step 4: Rebuild, test, browser check**

```bash
python3 scripts/build-site.py && npm test 2>&1 | grep -E "^# (pass|fail)"
```

Browser: `http://127.0.0.1:8931/sf-tour.html?x=1#y` lands on `/concepts/sf-tour.html?x=1#y`; the page works; `/concepts/` shows the sf-tour card in 实验台 with a live preview.

- [ ] **Step 5: Commit + push**

```bash
git add -A sf-tour.html concepts
git commit -m "feat(sandbox): sf-tour moves under concepts/ with a redirect at the old URL

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

## Batch 3 — homepage tail + Blog link (Tasks 6–8)

### Task 6: Stage table — finale becomes three screens

**Files:**
- Modify: `js/story.js:16`, `tests/story.test.mjs`, `css/site.css:106` area

- [ ] **Step 1: Update the tests**

In `tests/story.test.mjs`: `STAGES` deep-equals `[1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 3]`, sum `18`, scrollable comment `// 17 screens`; finale assertions become:

```js
  // finale: its top reaches the viewport at 15 screens, and the two remaining screens are u 0→1
  const s9 = at(15); assert.equal(s9.k, 9); assert.ok(Math.abs(s9.u) < 1e-9)
  const m9 = at(16); assert.equal(m9.k, 9); assert.ok(Math.abs(m9.u - 0.5) < 1e-9)
```

- [ ] **Step 2: Run, expect failure; then change `STAGES`**

`export const STAGES = [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 3]` and extend the comment: `Finale: three screens — two of pinned travel; the tail panel (Task 7) slides up over the second one.`

- [ ] **Step 3: CSS**

After `.s-end .copy { max-width: 860px; }` add `section.s-end { min-height: 300svh; }`.

- [ ] **Step 4: Run tests → pass; commit**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"
git add js/story.js tests/story.test.mjs css/site.css
git commit -m "feat(story): finale pinned for two screens to make room for the tail panel

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Tail panel and Blog link

**Files:**
- Create: `js/tail.js`
- Modify: `index.html` (body class, `#blogLink`, `.s-tail` section), `css/site.css`, `js/i18n.js` (`tail.*`), `js/main.js`

**Interfaces:**
- Consumes `initPreviews` from `js/preview-loader.js` (Task 4), `TEXTS` from `i18n.js`.
- `initTail({ getLang })` → `{ refresh() }`; `main.js` calls `refresh()` from `setLang`.

- [ ] **Step 1: i18n keys** (both tables, after `demoUi`)

```js
    tail: { latest: '最新', blog: 'Blog', sandbox: 'UX Sandbox', allPosts: '全部文章 →', allConcepts: '全部实验 →', none: '—', zhOnly: '' },
```
```js
    tail: { latest: 'Latest', blog: 'Blog', sandbox: 'UX Sandbox', allPosts: 'All posts →', allConcepts: 'All experiments →', none: '—', zhOnly: 'Chinese only' },
```

- [ ] **Step 2: `index.html`**

`<body>` → `<body class="home">`. After `#langBtn` add:

```html
<a id="blogLink" href="blogs/" target="_blank" rel="noopener">Blog</a>
```

After the `.s-end` section, before `</main>`:

```html
  <section class="s-tail" aria-label="Latest">
    <div class="tail-panel">
      <div class="tail-head"><span class="label" data-i18n="tail.latest"></span></div>
      <div class="tiles">
        <a class="tile tile-blog" href="blogs/" target="_blank" rel="noopener">
          <div class="eyebrow" data-i18n="tail.blog"></div>
          <div class="meta"><span class="chip"></span><time></time></div>
          <h3></h3><p></p>
          <div class="go" data-i18n="tail.allPosts"></div>
        </a>
        <a class="tile tile-sandbox" href="concepts/" target="_blank" rel="noopener">
          <div class="eyebrow" data-i18n="tail.sandbox"></div>
          <div class="pv" data-letter=""></div>
          <h3></h3><p></p>
          <div class="go" data-i18n="tail.allConcepts"></div>
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: `css/site.css`** (append before the mobile block)

```css
/* ── top-right Blog link: visible only at the very top ── */
#blogLink {
  position: fixed; top: 22px; right: 96px; z-index: 6;
  font: 500 12px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; text-decoration: none;
  color: var(--dim); background: rgba(5, 11, 24, .4); border: 1px solid var(--rule); border-radius: 999px; padding: 8px 14px;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: color .3s, border-color .3s, opacity .35s;
}
#blogLink:hover { color: var(--ink); border-color: rgba(166, 220, 255, .45); }
#blogLink.hide { opacity: 0; pointer-events: none; }

/* ── tail: slides up over the pinned finale ── */
section.s-tail { min-height: 100svh; margin-top: -100svh; z-index: 3; display: flex; align-items: flex-end; pointer-events: none; }
.tail-panel {
  pointer-events: auto; width: 100%; max-width: 1180px; margin: 0 auto; padding: 28px 28px 36px;
  background: rgba(5, 11, 24, .82); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(166, 220, 255, .16); border-bottom: 0; border-radius: 22px 22px 0 0;
  box-shadow: 0 -30px 80px rgba(0, 0, 0, .45);
}
.tail-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.tail-head .label { margin: 0; }
.tail-head::after { content: ""; flex: 1; height: 1px; background: var(--rule); }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.tile { display: flex; flex-direction: column; gap: 10px; padding: 18px; border: 1px solid var(--rule); border-radius: 16px; background: rgba(10, 32, 56, .45); color: inherit; text-decoration: none; transition: border-color .2s, transform .2s; min-height: 220px; }
.tile:hover { border-color: var(--acc); transform: translateY(-2px); }
.tile .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: var(--dim); }
.tile .meta { display: flex; align-items: center; gap: 10px; }
.tile .chip { font-family: var(--mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; padding: 3px 9px; border: 1px solid rgba(232, 207, 143, .45); border-radius: 999px; color: var(--gold); }
.tile .chip:empty { display: none; }
.tile time { font-family: var(--mono); font-size: 11px; letter-spacing: .12em; color: var(--dim); }
.tile h3 { font-size: clamp(1.1rem, 1.6vw, 1.35rem); font-weight: 400; line-height: 1.4; color: var(--ink); }
.tile p { color: #9fb4cb; font-size: .95rem; line-height: 1.7; }
.tile .go { margin-top: auto; font-family: var(--mono); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--acc); }
.tile .pv { position: relative; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, #0a1a33, #071226 60%, #0c2240); border: 1px solid rgba(120, 190, 255, .12); }
.tile .pv::before { content: attr(data-letter); position: absolute; inset: 0; display: grid; place-items: center; font-size: 56px; font-weight: 200; color: rgba(166, 220, 255, .18); }
.tile .pv iframe { position: absolute; left: 0; top: 0; width: 1280px; height: 800px; border: 0; transform-origin: 0 0; pointer-events: none; opacity: 0; transition: opacity .6s; background: var(--bg); }
.tile .pv iframe.in { opacity: 1; }
```

In the existing mobile media block add: `#blogLink { top: 14px; right: 84px; } .tiles { grid-template-columns: 1fr; } .tail-panel { padding: 20px 16px 28px; border-radius: 18px 18px 0 0; }`.

- [ ] **Step 4: `js/tail.js`**

```js
/**
 * Homepage tail: the "latest" panel after the finale (latest blog post + latest UX concept, read
 * from the two JSON files the generator and the concepts table produce) and the top-right Blog
 * link that hides as soon as the page scrolls. A failed fetch leaves a dash in that tile and is
 * reported in window.__fb.errors; the rest of the page is unaffected.
 */
import { TEXTS } from './i18n.js'
import { initPreviews } from './preview-loader.js'

export function initTail({ getLang }) {
  const link = document.getElementById('blogLink')
  const onScroll = () => link.classList.toggle('hide', window.scrollY > 40)
  addEventListener('scroll', onScroll, { passive: true }); onScroll()

  const blog = document.querySelector('.tile-blog'), sb = document.querySelector('.tile-sandbox')
  let post = null, concept = null, previews = null
  const L = () => getLang()
  function paint() {
    const t = TEXTS[L()].tail
    if (post) {
      blog.querySelector('.chip').textContent = post.tags.map((x) => TEXTS[L()][x === 'tech' ? 'c6' : 'c1'] ? (L() === 'zh' ? (x === 'tech' ? '技术' : '概念') : x) : x).join(' ')
      blog.querySelector('time').textContent = post.date; blog.querySelector('time').dateTime = post.date
      blog.querySelector('h3').textContent = post.title[L()] || post.title.zh
      blog.querySelector('p').textContent = (post.summary[L()] || post.summary.zh) + (L() === 'en' && !post.hasEn ? ` (${t.zhOnly})` : '')
      blog.href = 'blogs/'
    } else { blog.querySelector('h3').textContent = t.none; blog.querySelector('p').textContent = '' }
    if (concept) {
      sb.querySelector('h3').textContent = concept.title[L()] || concept.title.zh
      sb.querySelector('p').textContent = concept.summary[L()] || concept.summary.zh
      const pv = sb.querySelector('.pv'); pv.dataset.letter = concept.title.zh.slice(0, 1)
      if (concept.live && !pv.dataset.src) { pv.dataset.src = `concepts/${concept.file}?preview=1`; previews = initPreviews(sb, { max: undefined }) }
    } else { sb.querySelector('h3').textContent = t.none; sb.querySelector('p').textContent = '' }
  }
  const load = async (url) => { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(`${url} ${r.status}`); return r.json() }
  load('blogs/posts.json').then((list) => { post = list[0] || null }).catch((e) => window.__fb.errors.push(String(e))).then(paint)
  load('concepts/concepts.json').then((list) => { concept = [...list].sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null }).catch((e) => window.__fb.errors.push(String(e))).then(paint)
  paint()
  return { refresh: paint, dispose() { previews?.dispose() } }
}
```

Simplify the chip line to exactly:

```js
      blog.querySelector('.chip').textContent = post.tags.map((x) => L() === 'zh' ? (x === 'tech' ? '技术' : '概念') : (x === 'tech' ? 'Tech' : 'Concept')).join(' · ')
```

- [ ] **Step 5: `js/main.js`**

```js
import { initTail } from './tail.js'
```
In `setLang` add `window.__fb.tail?.refresh()`. At the end of `boot()` after `window.__fb.demos = demos`:
```js
  window.__fb.tail = initTail({ getLang: () => lang })
```

- [ ] **Step 6: Browser check**

Serve; open `/?lang=zh`. Checks: `document.documentElement.scrollHeight / innerHeight` ≈ 18; `#blogLink` visible at top, `.hide` after scrolling 50px, back when scrolled to 0; scroll to the bottom: the tail panel sits over the finale, finale copy and aurora unchanged behind it; blog tile shows 端云同境 post (date 2026-10-02, chip 技术); sandbox tile shows the newest concept with a live preview at desktop width; switch language → tiles re-paint; click tiles → new tabs to `/blogs/` and `/concepts/`. Simulate failure: `fetch` of a missing file → tile shows `—` and `__fb.errors` has one entry (open `/?lang=zh` with `blogs/posts.json` temporarily renamed, then restore).

- [ ] **Step 7: Commit, VERSION, push**

```bash
sed -i '' "s/const VERSION = '2026-09-21d'/const VERSION = '2026-10-02a'/" js/main.js
sed -i '' 's/main.js?v=2026-09-21d/main.js?v=2026-10-02a/' index.html
npm test 2>&1 | grep -E "^# (pass|fail)"
git add index.html css/site.css js/tail.js js/main.js js/i18n.js
git commit -m "feat(home): tail panel with the latest post and concept; top-right Blog link that hides on scroll

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

### Task 8: README and memory

- [ ] **Step 1: README file table** — add rows for `scripts/build-site.py`, `css/sub.css` / `js/sub.js`, `js/preview-loader.js` / `concepts/preview.js`, `js/tail.js`, `blogs/`, `concepts/concepts.json`; note that `sf-tour.html` at the root is a redirect.
- [ ] **Step 2: Commit + push**

```bash
git add README.md
git commit -m "docs: README for the blog pipeline, sandbox previews and the homepage tail

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```
