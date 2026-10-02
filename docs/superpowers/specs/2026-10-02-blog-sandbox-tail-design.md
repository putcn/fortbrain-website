# Blog + UX Sandbox + 首页尾部 · 设计

- 日期：2026-10-02
- 状态：待用户评审
- 上位设计：`2026-09-15-scroll-story-site-design.md`（滚动叙事站）、`2026-09-21-chapters-and-demos-design.md`（六章与演示）

> 一句话：官网多出两个子站——**Blog**（`/blogs/`，Markdown 写、脚本生成、中英双语）和 **UX Sandbox**（`/concepts/`，重做索引页，每条概念带实时缩略 3D 演示）；
> 首页结尾段之后再往下滚，一块面板从底部滑上来，露出最新的一篇 Blog 和最新的一个 UX 实验；右上角多一个 Blog 链接，一滚动就隐藏。

---

## 1. 目标与非目标

### 目标

1. 写文章只需要写 Markdown：一条命令生成页面，提交即上线。中英各一份。
2. Concepts 索引专业、一致：统一卡片、状态分组、每张卡上方是**活的**缩小版演示，不是截图。
3. 首页结尾不变；多滚一屏，两个 tile 从底部升上来，各自新页打开 `/blogs/` 与 `/concepts/`。
4. `sf-tour.html` 并入 concepts；旧 URL `/sf-tour.html` 永久有效，自动跳到新地址。
5. 仍是纯静态站，GitHub Pages 部署方式不变；生成产物提交进仓库。

### 非目标

- 不做评论、搜索、RSS、分页（文章量到几十篇再说）。
- 不改七个概念页和 sf-tour 的内部逻辑；只加一行预览脚本、改一处路径。
- 概念页本身仍是中文；双语只到索引页和 Blog。
- 不接后端，不做 CMS。

---

## 2. 已定决策（与用户确认，2026-10-02）

| 决策 | 结论 |
|---|---|
| Blog 管线 | Markdown + `scripts/build-site.py` 生成静态页（python-markdown 3.10，本机已装） |
| 缩略演示 | 懒加载的实时 iframe，桌面最多 3 个同时跑，手机用占位图 |
| Blog 语言 | 中英双语，每篇两份 md，页面内切换，和首页共用 `localStorage.lang` |
| 种子文章 | 两篇：端云同境（技术）、产品动线牌桌（概念） |
| sf-tour | 移入 `concepts/sf-tour.html`，`/sf-tour.html` 留跳转页 |
| Blog URL | `/blogs/<slug>/`（目录式） |
| tile 跳转 | 新标签页打开索引页（`/blogs/`、`/concepts/`），不是单篇 |

---

## 3. 内容模型

### 3.1 文章：`blogs/posts/<slug>/zh.md` + `en.md`

头信息（简单的 `key: value` 行，`---` 包围；不引入 YAML 库）：

```markdown
---
title: 端云同境：本地的留在本地，助理照样干活
date: 2026-10-02
tags: tech
summary: 员工电脑上的文件、命令、浏览器登录态，助理直接调用；内容不经服务器保存。
concept: flowboard-3d        # 可选：关联的概念 id，详情页出「打开实验」按钮
---

正文（Markdown：标题、列表、代码块、表格、图片、引用）
```

- `tags` 只认两个值：`concept`、`tech`；多个用逗号。
- 两种语言的 `date`、`tags`、`concept` 以 `zh.md` 为准；`en.md` 缺失则该篇只出中文（页面上切英文时显示「This post is in Chinese only」）。
- 图片放 `blogs/posts/<slug>/` 同目录，生成时原样拷到 `blogs/<slug>/`。

### 3.2 概念：`concepts/concepts.json`

```jsonc
[
  { "id": "flowboard-3d", "file": "flowboard-3d.html", "date": "2026-09-30", "status": "final", "live": true,
    "title": { "zh": "产品动线牌桌（3D 卡牌）", "en": "Product flow card table (3D)" },
    "summary": { "zh": "每个项目一张牌……", "en": "One card per project…" } },
  { "id": "sf-tour", "file": "sf-tour.html", "date": "2026-09-28", "status": "lab", "live": true, "title": {…}, "summary": {…} },
  …
]
```

- `status`：`final`（定稿）/ `lab`（实验台）/ `early`（早期对照）。索引页按这个分组，组内按日期倒序。
- `live`：true 表示索引页给它跑实时 iframe；false（纯 2D 的页也可以 true，缩略图一样是活的）。
- 「最新」= 全表按日期倒序第一条（首页 tile 用）。

### 3.3 生成产物（提交进仓库）

| 产物 | 内容 |
|---|---|
| `blogs/index.html` | 列表页，双语 |
| `blogs/<slug>/index.html` | 详情页，双语，含上一篇 / 下一篇 |
| `blogs/posts.json` | `[{ slug, date, tags, title:{zh,en}, summary:{zh,en}, url, hasEn }]`，日期倒序 |
| `concepts/index.html` | UX Sandbox 索引，双语 |

首页只读 `blogs/posts.json` 和 `concepts/concepts.json`。

---

## 4. 生成脚本 `scripts/build-site.py`

- 无第三方依赖除 `markdown`（扩展：`fenced_code`、`tables`、`toc`、`attr_list`）。
- 模板是脚本里的 Python 函数（f-string），不引入 Jinja。
- 入口：`python3 scripts/build-site.py`（全量生成到仓库）；`--out <dir>` 把产物写到别处（测试用）；`--check` 只校验头信息与 JSON，不写文件，非法时退出码 1 并指出文件与原因。
- 校验：缺 `title/date`、`tags` 不在白名单、`concept` 在 `concepts.json` 里不存在、`concepts.json` 里 `file` 不存在、日期格式不是 `YYYY-MM-DD` —— 都算错误。
- 双语页面结构：每段内容渲染两份，`<div lang="zh-CN">…</div><div lang="en">…</div>`；CSS 按 `html[lang="en"] [lang="zh-CN"] { display: none }` 隐藏另一种。
- HTML 转义：头信息里的文本全部转义；正文由 markdown 生成（文章是我们自己写的，不做消毒）。

---

## 5. 页面设计

### 5.1 共用：`css/sub.css` + `js/sub.js`

- 色板、字体与首页同（`--bg #050b18`、`--ink`、`--dim`、`--acc`、`--gold`、`--rule`），背景纯色 + 顶部一点径向冷光，**不要**网格线。
- 顶栏（固定）：左 `Fortbrain`（回首页），中间当前子站名，右侧「中 / EN」按钮。
- `js/sub.js`：读 `localStorage.lang`（没有则按 `navigator.language`），设 `<html lang>`，按钮切换并存回；和首页 `i18n.js` 的规则一致但不 import 它（子站不需要整张文案表）。
- 响应式：内容列最大 760px（文章）/ 1120px（卡片网格），手机 16px 边距。

### 5.2 Blog 列表 `/blogs/`

- 标题「Blog」+ 一句话（zh：「概念背后的想法，和我们怎么把技术做出来。」en：「The thinking behind the concepts, and how we build the technology.」）。
- 筛选：全部 / 概念 / 技术（纯前端，按 `data-tags` 显隐）。
- 每条：日期（等宽小字）、标签 chip、标题（链接）、摘要。按日期倒序。

### 5.3 Blog 详情 `/blogs/<slug>/`

- 顶部：标签、日期、标题（大字细体）、摘要（作为导语）。
- 正文排版：h2/h3、段落 1.9 行高、代码块等宽深底、表格细线、图片圆角 100% 宽、引用左侧金线。
- 有 `concept` 时：正文后一块卡「打开实验 →」指向 `/concepts/<file>`，新标签页。
- 底部：上一篇 / 下一篇（按日期），回到列表。
- `<head>`：`description` 取摘要；`og:title`、`og:description`；`<link rel="canonical">`。

### 5.4 UX Sandbox 索引 `/concepts/`

- 标题「UX Sandbox」+ eyebrow「Fortbrain · Concepts」+ 一句话（zh：「交互与质感的实验场。全部是单文件、示例数据，可拖、可点。」）。
- 三组：定稿 / 实验台 / 早期对照。每组一个网格，卡片 `minmax(320px, 1fr)`。
- 卡片：上方 16:10 的预览区，下方状态 chip + 日期、标题、摘要、「打开 →」。整卡是 `<a target="_blank">`。
- 预览区（§6）：桌面实时 iframe，手机渐变占位 + 标题首字。
- 页脚：回到首页、Blog。
- `<meta name="robots" content="noindex">` 去掉（现在要对外）。

### 5.5 首页尾部与顶栏

- 结尾段 `.s-end` 由 200svh 改 300svh，`.copy` 仍 sticky 钉住两屏。
- 新段 `<section class="s-tail">`：`min-height: 100svh; margin-top: -100svh; position: relative; z-index: 3`。内部 `.tail-panel` 贴底：玻璃面板（`rgba(5,11,24,.82)` + blur + 1px 高光边），上缘圆角，标题行「最新 · Latest」。
- 两块 tile 并排（手机上下堆叠）：
  - **Blog**：eyebrow「Blog」、标签 chip、日期、标题、摘要、「全部文章 →」。
  - **UX Sandbox**：eyebrow「UX Sandbox」、预览区（桌面实时 iframe，面板可见度 ≥ 50% 才加载，滚回去就卸掉；手机占位）、标题、摘要、「全部实验 →」。
  - 整块 tile 是 `<a target="_blank" rel="noopener">`，分别到 `/blogs/` 与 `/concepts/`。
- 数据：`js/tail.js` 在 `boot()` 之后 `fetch` 两个 JSON，各取第一条；任一失败则该 tile 显示「—」并把错误记进 `window.__fb.errors`，不影响页面其它部分。文案（eyebrow、按钮）走 `i18n.js` 的 `tail.*` 键；标题摘要按当前语言从 JSON 取，切语言时重绘。
- 顶栏「Blog」链接：`<a id="blogLink" href="blogs/" target="_blank">`，位置在 lang 按钮左侧，同样式；`scrollY > 40` 加 `.hide`（透明 + 不可点），回到 ≤ 40 恢复。由 `tail.js` 在 `story.poll` 的同一帧判断（监听 `scroll` 事件即可，被动）。
- `STAGES` 结尾 2 → 3：总 18 屏，可滚 17 屏；结尾段的两屏旅程 u 0→1；极光仍按 `stageU/0.6` 淡入，面板滑入前已到位。`KEYS` 仍 10 项。

---

## 6. 实时缩略演示（`concepts/preview.js` + 索引/尾部的加载器）

### 6.1 概念页一侧

每个概念页和 sf-tour 在 `</body>` 前加 `<script src="preview.js"></script>`。脚本只在 `location.search` 含 `preview=1` 时生效：

```js
// 注入样式：隐藏操作面板、提示、返回、品牌等 chrome；整页不响应指针
document.documentElement.classList.add('fb-preview')
style: .fb-preview .bar, .fb-preview .panel, .fb-preview .hud, .fb-preview .controls, .fb-preview .legend,
       .fb-preview #hint, .fb-preview #back, .fb-preview #status, .fb-preview #tour, .fb-preview #frame,
       .fb-preview #brand, .fb-preview #credit, .fb-preview #toast { display: none !important }
       .fb-preview body { pointer-events: none }
```

不改任何页面的 JS。场景本来就在动的（flowboard-3d、glass-lab、weather、sf-tour、chat-button-anim）缩略图就是活的；静态的（flowboard-cards、sales_rbac）缩略图是它的首屏。

### 6.2 索引页 / 首页一侧（`js/preview-loader.js`，两处共用）

- 预览区 `<div class="pv" data-src="flowboard-3d.html?preview=1">`，内部 iframe 固定 `width=1280 height=800`，`transform: scale(k)`，`k = 容器宽 / 1280`，`transform-origin: 0 0`；`pointer-events: none`；`loading="lazy"` 不够（它不会卸载），所以自己管。
- `IntersectionObserver`（`rootMargin: 120px`）：进入 → 若在跑的数 < 上限则设 `src`；离开 → 置 `src=''` 并移除 iframe。上限：桌面 3，`(pointer: coarse)` 或宽 < 768 → 0（永远占位）。
- `prefers-reduced-motion: reduce` → 上限 0。
- 占位：`.pv::before` 渐变 + 中央标题首字（CSS `attr(data-letter)`），iframe `load` 后淡入盖住。
- 同源 iframe，不需要 `sandbox` 属性；加 `title` 给读屏。

---

## 7. sf-tour 迁移

- `git mv sf-tour.html concepts/sf-tour.html`；页内无相对资源（地形数据内嵌、Three 走 CDN），不需要改路径。
- 新建根目录 `sf-tour.html`：

```html
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/concepts/sf-tour.html">
<link rel="canonical" href="https://fortbrain.ai/concepts/sf-tour.html">
<script>location.replace('/concepts/sf-tour.html' + location.search + location.hash)</script>
<title>旧金山一日地形路线</title></head>
<body><p>已搬到 <a href="/concepts/sf-tour.html">/concepts/sf-tour.html</a></p></body></html>
```

- `concepts.json` 加一条 `sf-tour`（`lab`，日期取其 git 提交日 2026-09-28，`live: true`）。

---

## 8. 种子文章（评审稿，正文在 `blogs/posts/` 里写全）

| slug | tags | 中文标题 | 英文标题 | 来源 |
|---|---|---|---|---|
| `hybrid-context` | tech | 端云同境：本地的留在本地，助理照样干活 | Hybrid Context: local stays local, the assistant still does the work | 套件设计文档 §1–§4、§10；面向外部读者，不写内部表名与接口 |
| `flowboard-cards` | concept，`concept: flowboard-3d` | 产品动线牌桌：为什么是一副牌 | The product flow card table: why a deck of cards | concepts 索引里 v1 → 三选一 → v9 的演进说明 |

每篇 600–900 字（中文），英文对应翻译；配 1–2 张小节标题，不配图（没有现成图）。

---

## 9. 文件

| 文件 | 改动 |
|---|---|
| `scripts/build-site.py` | 新增：生成器 |
| `blogs/posts/hybrid-context/{zh,en}.md`、`blogs/posts/flowboard-cards/{zh,en}.md` | 新增：种子文章 |
| `blogs/index.html`、`blogs/<slug>/index.html`、`blogs/posts.json` | 产物 |
| `concepts/concepts.json` | 新增：概念表（8 条） |
| `concepts/index.html` | 产物（替换现有手写页） |
| `concepts/preview.js` | 新增 |
| `concepts/*.html`（7 个）+ `concepts/sf-tour.html` | 各加一行 `<script src="preview.js">` |
| `sf-tour.html` | 替换为跳转页 |
| `css/sub.css`、`js/sub.js`、`js/preview-loader.js` | 新增：子站共用 |
| `js/tail.js` | 新增：首页尾部面板 + 顶栏 Blog 链接 |
| `index.html`、`css/site.css`、`js/story.js`、`js/main.js`、`js/i18n.js` | 尾部段、顶栏链接、`STAGES`、`tail.*` 文案 |
| `tests/story.test.mjs` | 结尾 3 屏、总 18 屏 |
| `tests/build-site.test.mjs` | 新增：对 fixture 跑脚本到临时目录，断言产物、双语、posts.json 顺序；坏头信息时 `--check` 退出码 1 |
| `README.md` | 写文章 / 加概念 / 生成的三步 |

---

## 10. 验证

- `npm test`：段表、生成器（含失败路径）、现有测试。
- `python3 scripts/build-site.py --check` 通过；`git status` 里产物与源一致（生成是幂等的：同一输入产物逐字节相同）。
- 本地预览：`/blogs/` 列表与两篇详情，中英切换不刷新；`/concepts/` 三组卡片，桌面上滚动时最多 3 个 iframe 在跑（`document.querySelectorAll('.pv iframe').length ≤ 3`）；`/sf-tour.html` 跳到 `/concepts/sf-tour.html`。
- 首页：总高 18 屏；滚到底，面板从底部滑上，结尾文案不动；两 tile 内容来自 JSON；顶栏 Blog 链接滚动 40px 后消失。
- 手机宽度：面板上下堆叠、预览区为占位。

## 11. 分批上线

1. 生成脚本 + Blog 两类页面 + 两篇种子文章 + `sub.css/sub.js`。
2. `concepts.json` + 预览脚本 + 索引页重做 + sf-tour 迁移与跳转。
3. 首页尾部面板 + 顶栏 Blog 链接 + `STAGES` 与测试。
