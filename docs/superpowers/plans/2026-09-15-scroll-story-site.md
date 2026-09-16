# Fortbrain 滚动叙事官网 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把官网重做成一页视差滚动站：3D 徐州地图做背景，开场提问，六个特点各特写一个方块，结尾升空看极光并落联系方式，中英双语，手机可用。

**Architecture:** 纯静态页。固定的 WebGL 画布在底层（`scene.js`），DOM 文字段落在上层滚动；`story.js` 把滚动进度换算成「段号 + 段内进度」喂给场景；`i18n.js` 只管文字。WebGL 不可用时 `fallback.js` 画 canvas 2D 极光幕。

**Tech Stack:** 原生 HTML/CSS/ES modules，Three.js 0.160（jsdelivr importmap），node 内置 test runner，Python 3 脚本生成底图。

**Spec:** `docs/superpowers/specs/2026-09-15-scroll-story-site-design.md`

## Global Constraints

- 不出现任何客户名称、地址；门店名牌只写「门店 · NN」/「Store · NN」。
- 联系邮箱 putcncx@gmail.com 在 DOM 里拆成 user/domain 两段运行时拼接。
- 不劫持滚动：不监听 wheel 做 preventDefault；段高用 `100svh`。
- 底图 `data/xuzhou.json` < 300KB；结构与大屏 `320300.json` 一致（center/districts/roads/water）。
- Three.js 版本锁 0.160.0；importmap 指向 `https://cdn.jsdelivr.net/npm/three@0.160.0/`。
- 手机：DPR 1、关 transmission、只 motorway、~14 个方块、镜头距离 ×1.35。
- `prefers-reduced-motion`：关自转和呼吸，镜头段切换直接跳。
- 文案总纲：「我们的目标是实际地为企业降人力成本、增加单位人效，让 AI 成为企业不知疲倦的成长动力。」

---

### Task 1: 底图生成脚本

**Files:**
- Create: `scripts/build-geo.py`
- Create: `data/xuzhou.json`（脚本产物）

**Interfaces:**
- Produces: `data/xuzhou.json` = `{center:[lng,lat], districts:[{name, center, rings:[[ [lng,lat],... ]]}], roads:[{cls, pts}], water:[{kind:'area', ring}|{kind:'line', pts}]}`

- [x] **Step 1: 写脚本**：读 `~/Fortbrain/packs/mxipos/app/geo/320300.json`；Douglas-Peucker（自实现，容差 0.0025°）简化所有环和折线；roads 只留 `motorway`/`trunk`；water 面按鞋带公式面积 < 2e-4 平方度丢掉；坐标保留 4 位小数；输出紧凑 JSON。
- [x] **Step 2: 跑脚本**：`python3 scripts/build-geo.py`，检查 `ls -la data/xuzhou.json` < 300KB，`python3 -c` 确认 districts 数为 10。
- [x] **Step 3: Commit** `feat: build simplified Xuzhou basemap`

### Task 2: 地理算术 + 测试

**Files:**
- Create: `js/geo.js`
- Create: `tests/geo.test.mjs`

**Interfaces:**
- Produces: `makeProjector(center)->{P(lon,lat)->[x,z]}`, `spread(center,f)`, `pointInRing(x,z,ring)`, `placeStores(stores,{onMap,cellW,cellH,rows,cols,rnd})`（写回 x/z）, `lcg(seed)`, `pickFeatured(stores, n)->stores[]`（贪心最远点，从中心最近的一个起）, `segmentPositions(polylines,y)`, `ringArea(ring)`

- [x] **Step 1: 写失败测试**：投影中心为原点；`placeStores` 20 个点两两距离 ≥ cellH×0.8；`pickFeatured` 返回 n 个、两两距离大于随机取 n 个的平均。
- [x] **Step 2: `node --test tests/`** 失败。
- [x] **Step 3: 从大屏 `ui/src/display/geo.js` 移植并加 `pickFeatured`**。
- [x] **Step 4: 测试通过。**
- [x] **Step 5: Commit** `feat: geo math with featured-store picking`

### Task 3: 文案与 i18n

**Files:**
- Create: `js/i18n.js`
- Create: `tests/i18n.test.mjs`

**Interfaces:**
- Produces: `TEXTS = {zh:{...}, en:{...}}`（key：`q`, `thesis`, `p1..p6` 各含 `label/title/body`, `answer`, `contactPre`, `hint`, `lang`）；`detectLang()`, `applyLang(lang, root=document)`（改 `[data-i18n]` 的 innerHTML、`html[lang]`、写 localStorage）。
- [x] **Step 1: 测试** zh/en 两表 key 集合完全一致；`detectLang` 在 `zh-CN` 返回 `zh`，`en-US` 返回 `en`。
- [x] **Step 2: 失败 → 实现 → 通过。**
- [x] **Step 3: Commit** `feat: bilingual copy table`

### Task 4: 滚动进度 → 段与镜头进度（纯函数）

**Files:**
- Create: `js/story.js`
- Create: `tests/story.test.mjs`

**Interfaces:**
- Produces: `STAGES`（每段权重，段 2 占 2 屏）；`progressToStage(p)->{k, u}`（按权重换算）；`blend(k,u)->{a:k, b:min(k+1,n-1), t}`（u<0.5→t=0，u≥0.5→t=smoothstep((u-.5)*2)）；`initStory({onProgress})`（绑定 scroll/resize，rAF 节流，IntersectionObserver 给 `section` 加 `.on`）。
- [x] **Step 1: 测试** p=0→k0 u0；p=1→k9 u1；权重段边界正确；blend 单调。
- [x] **Step 2: 失败 → 实现 → 通过。**
- [x] **Step 3: Commit** `feat: scroll-to-stage mapping`

### Task 5: 页面骨架 + 样式 + 语言切换 + 降级极光

**Files:**
- Create: `index.html`（重写）, `css/site.css`, `js/main.js`, `js/fallback.js`

**Interfaces:**
- `main.js`：检测 WebGL → `import('./scene.js')` 或 `import('./fallback.js')`；两者都暴露 `create(canvas, opts)->{setProgress(k,u,p), tick(), resize(), dispose()}`；`main.js` 跑 rAF 循环（`document.hidden` 停）。
- `fallback.js`：按 spec §8.1 画极光幕；`setProgress` 用全局 p 控制带数与亮度。
- [x] **Step 1: index.html**：`<canvas id="gl">` 固定；`<main>` 下 9 个 `<section data-stage=N>`，每段 `100svh`，内部 `.copy`（label/title/body 带 `data-i18n`）；右上 `#langBtn`；结尾段 `#contact`。
- [x] **Step 2: site.css**：深蓝底 `#050b18`、字体栈、`.copy` 左栏 max 560 / 手机全宽底对齐 + 渐变底；`.on` 时淡入上移；reduced-motion 关过渡。
- [x] **Step 3: fallback.js** 按 §8.1 实现（离屏 0.5×、3–4 条带、竖向光丝、两层噪声、lighter 叠加）。
- [x] **Step 4: 用 `?nogl=1` 强制走降级，在浏览器走查九段与语言切换。**
- [x] **Step 5: Commit** `feat: page skeleton, copy, language toggle, 2D aurora fallback`

### Task 5b: 界面拆解层（spec §5.2）

**Files:**
- Create: `js/layers.js`；Modify: `index.html`（段 2 加 `#layers` 舞台与三层 HTML）、`css/site.css`

- [x] **Step 1: HTML 三层**（导航 / 列表 / 主内容），文字 data-i18n。
- [x] **Step 2: CSS 等距舞台**：perspective 1600、rotateX 58 / rotateZ −45、三层 translateZ 0/60/120、玻璃面板样式、手机缩放 0.55。
- [x] **Step 3: layers.js** `create()->{setProgress(k,u)}`：u 分三段（飞入 / 停留 / 飞出）写 transform 与 opacity。
- [x] **Step 4: 走查桌面 + 手机。Commit** `feat: exploded UI layers section`

### Task 6: 3D 场景 · 底图 + 陪衬方块 + 全景镜头

**Files:**
- Create: `js/scene.js`

**Interfaces:**
- `create(canvas, {geo, mobile, reduced})`；内部：渲染器、灯光、地面、区县挤出、道路/水系 LineSegments（照大屏），22/14 个方块（共用玻璃壳 + 流体核 shader），高度随噪声呼吸；镜头 `view {target, dist, az, tilt}`；`KEYS[9]` 关键帧；`setProgress(k,u)` 用 Task 4 的 `blend` 在关键帧间插值并指数平滑。
- [x] **Step 1: 场景 + 底图 + 方块 + 段 0/1/2 全景慢转（段 2 拉远并 `setDim`）。** 走查桌面。
- [x] **Step 2: 手机参数分支**（DPR、materials、道路、数量、距离 ×1.35、target 偏移）。用 Chrome 设备模拟走查。
- [x] **Step 3: Commit** `feat: 3D basemap scene with breathing store cubes`

### Task 7: 六个特写方块

**Files:**
- Modify: `js/scene.js`

- [x] **Step 1: `pickFeatured` 选 7 个方块 A–G，分配到段 3–8（段 7 用 E+F）。** 每段关键帧 target = 方块位置，dist 45。
- [x] **Step 2: 各材质/状态**：A 内核 uBoost 周期自亮 + 涟漪；B 金色、高度随时间长高；C 开口玻璃罐 + 液体 + 液面 + 两条到邻居的 TubeGeometry 货道带 drawRange 流动脉冲（照仓储大屏）；D 颜色在 `#63d9a0/#e0a33e/#e2706b` 循环，红时涟漪；E↔F 弧线光点往返；G 线框→按面拼装→实体循环。
- [x] **Step 3: 走查每段桌面 + 手机。**
- [x] **Step 4: Commit** `feat: six featured cube states`

### Task 8: 结尾升空 + 极光

**Files:**
- Modify: `js/scene.js`

- [x] **Step 1: 段 9 关键帧 dist 600、tilt 接近垂直；极光 ShaderMaterial 平面 y=120，AdditiveBlending，fbm 三条色带，段 7→8 间 uOpacity 淡入。**
- [x] **Step 2: 走查。Commit** `feat: finale ascent with aurora`

### Task 9: 收尾

- [x] **Step 1: 删掉旧站残留；`README` 一段说明如何本地预览（`python3 -m http.server`）与重生成底图。**
- [x] **Step 2: 全流程走查：桌面 Chrome/Safari、iOS Safari 模拟、断网底图失败、reduced-motion、`?nogl=1`。**
- [x] **Step 3: Commit** `chore: finalize scroll-story site`
