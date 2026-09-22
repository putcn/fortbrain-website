# Six Chapters + Front-end Demos + Hybrid Context — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the scroll story from 12 stages / 24 screens to 10 stages / 17 screens with six chapters (incl. the new Hybrid Context chapter and its cube animation), then add a pure-front-end demo overlay with the first demo (hybrid).

**Architecture:** The page stays a static scroll story: `story.js` maps scroll → (stage k, u), `scene.js` drives the Three.js camera and per-cube animations, `i18n.js` holds all copy. Demos are a fixed overlay (`#demo`) driven by a small pure step machine (`js/demo-steps.js`, unit-tested) and per-demo DOM modules under `js/demos/`. The render loop pauses while a demo is open.

**Tech Stack:** Vanilla ES modules, Three.js 0.160 (vendored), CSS `svh` units, `node --test`. No build step. Deployed on GitHub Pages by pushing `main`.

**Spec:** `docs/superpowers/specs/2026-09-21-chapters-and-demos-design.md`

## Global Constraints

- Copy for both languages lives only in `js/i18n.js`; zh and en tables must have identical keys (existing test enforces it).
- No customer names anywhere (existing test enforces a banned-word list).
- Bump `VERSION` in `js/main.js` and the `?v=` on the `<script>` tag in `index.html` on every deploy.
- Every new stage table change needs `tests/story.test.mjs` updated; `npm test` must pass before each commit.
- Stage heights in `js/story.js` must equal the sections' `min-height` in `css/site.css` (in screens).
- Demo styling uses `fbd-` prefixed classes and the dark product tokens listed in spec §5.2; no hex colours inside demo modules (tokens only).
- Commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## Batch 1 — restructure (Tasks 1–4)

### Task 1: Stage table → 10 stages, 17 screens

**Files:**
- Modify: `js/story.js:12-16` (STAGES comment + array)
- Test: `tests/story.test.mjs`

**Interfaces:**
- Produces: `STAGES = [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2]`, `LAYERS_STAGE = 2` unchanged, `HOLD` unchanged (0.2 for k=0, 0.5 otherwise). Later tasks index camera keyframes 0..9 against this.

- [ ] **Step 1: Rewrite the stage tests for the new table**

Replace the first two tests in `tests/story.test.mjs` with:

```js
test('there are 10 stages: hero 1 screen, thesis 2, layers 3, six chapters 1.5 each, finale 2', () => {
  assert.equal(STAGES.length, 10)
  assert.deepEqual(STAGES, [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2])
  assert.equal(STAGES[LAYERS_STAGE], 3)
  assert.equal(STAGES.reduce((a, b) => a + b, 0), 17)
})

test('progressToStage follows the DOM: p spans (total − 1) screens of scroll', () => {
  assert.deepEqual(progressToStage(0), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(1), { k: 9, u: 1 })
  const scrollable = STAGES.reduce((a, b) => a + b, 0) - 1   // 16 screens
  const at = (screens) => progressToStage(screens / scrollable)
  // section tops: 0, 1, 3, 6, 7.5, 9, 10.5, 12, 13.5, 15 screens
  const h0 = at(0.5); assert.equal(h0.k, 0); assert.ok(Math.abs(h0.u - 0.5) < 1e-9)
  const s1 = at(1); assert.equal(s1.k, 1); assert.ok(Math.abs(s1.u) < 1e-9)
  const s2 = at(3); assert.equal(s2.k, 2); assert.ok(Math.abs(s2.u) < 1e-9)
  const m2 = at(4.5); assert.equal(m2.k, 2); assert.ok(Math.abs(m2.u - 0.5) < 1e-9)
  const s3 = at(6 + 1e-9); assert.equal(s3.k, 3)
  const h3 = at(6.75); assert.equal(h3.k, 3); assert.ok(Math.abs(h3.u - 0.5) < 1e-9)   // half of a 1.5-screen chapter
  const s7 = at(12); assert.equal(s7.k, 7); assert.ok(Math.abs(s7.u) < 1e-9)           // hybrid chapter
  const s8 = at(13.5); assert.equal(s8.k, 8); assert.ok(Math.abs(s8.u) < 1e-9)
  // finale: its top reaches the viewport at 15 screens, and the one remaining screen is u 0→1
  const s9 = at(15); assert.equal(s9.k, 9); assert.ok(Math.abs(s9.u) < 1e-9)
  const m9 = at(15.5); assert.equal(m9.k, 9); assert.ok(Math.abs(m9.u - 0.5) < 1e-9)
  assert.deepEqual(progressToStage(-1), { k: 0, u: 0 })
  assert.deepEqual(progressToStage(2), { k: 9, u: 1 })
})
```

In the `blend` test change `assert.deepEqual(blend(11, 0.9), { a: 11, b: 11, t: 1 })` to `blend(9, 0.9), { a: 9, b: 9, t: 1 }`.

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test 2>&1 | grep -E "^# (pass|fail)|not ok"`
Expected: `not ok` on the two stage tests (STAGES still has 12 entries).

- [ ] **Step 3: Update STAGES and its comment in `js/story.js`**

```js
/**
 * Screen-heights per stage (must match the sections' min-height in CSS).
 * Hero: one unpinned screen (the first scroll already moves the title; the camera leaves early, see HOLD).
 * Thesis: two screens (pinned one). Layers: three. Six chapters: 1.5 each — the sticky copy holds half a
 * screen, then scrolls out while the camera flies on; depth lives in the demos, not in the scroll.
 * The page can only scroll until the last section's top reaches the viewport top, so the finale's
 * second screen is the one screen of travel it actually has.
 */
export const LAYERS_STAGE = 2
export const STAGES = [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2]
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test 2>&1 | grep -E "^# (pass|fail)"`
Expected: `# pass 14`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/story.js tests/story.test.mjs
git commit -m "feat(story): ten stages — six 1.5-screen chapters between layers and finale

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Six-chapter copy, sections and CSS

**Files:**
- Modify: `js/i18n.js` (replace `p2/p3/insight/p4/p1/p5/p6/p7` in both tables with `c1..c6`; add `demoBtn`, `demoSoon`)
- Modify: `index.html:99-162` (sections 3..11 → 3..9)
- Modify: `css/site.css:49-50` (add `.s-chapter`)

**Interfaces:**
- Produces: i18n keys `c1..c6` each `{ label, title, body }`, plus `demoBtn`, `demoSoon`. Section classes `s-chapter`; `data-stage` 3..9; finale `data-stage="9"`.

- [ ] **Step 1: Replace the chapter keys in the zh table**

In `js/i18n.js`, delete the zh entries `p2`, `p3`, `insight`, `p4`, `p1`, `p5`, `p6`, `p7` (lines 20–59) and insert in their place:

```js
    c1: {
      label: '01 · 数据自己进来，AI 自己盯',
      title: '不出户，知天下',
      body: '每一笔成交、每一次采集都是一个事件，自己流进来；报表到点自己写好，推到你手上。AI 7×24 盯着每一家店、每一个 SKU，异常第一时间找到该知道的人。',
    },
    c2: {
      label: '02 · 该补多少，引擎算',
      title: '人算不如天算，天算不如 Fortbrain 算',
      body: '预测引擎看到每一个 SKU、每一家店，给出最直接、最不绕弯子的决定：调多少货、什么时候补、补多少，每一个动作都瞄准实操层面的精准高效。',
    },
    c3: {
      label: '03 · 人只做决定',
      title: '运筹帷幄之中，决胜千里之外',
      body: '业务事件先分诊，助理把决定送到你面前。一句「同意」，调拨单、日历、系统写回，它自己去办。打扰有预算，助理不会变成噪音；越用越懂你。',
    },
    c4: {
      label: '04 · 助理之间自己问',
      title: '不召而至，不谋而合',
      body: '你的助理可以主动和其他部门的助理讨论，委托子任务，直接查另一个部门的知识库。少开一个会，少跑一趟腿。四道防风暴机制，只办正事，不聊闲篇。',
    },
    c5: {
      label: '05 · 端云同境',
      title: '各守其界，各通其心',
      body: '企业数据不出企业，个人数据不出你的电脑；端云同境让两个次元融合协作。从你本机找个供应商列表的 Excel，再查 Fortbrain 里他们的采购价格——没问题，一句话的事。',
    },
    c6: {
      label: '06 · 值得企业信赖',
      title: '万象各归其位，来处去向皆有迹可循',
      body: '每一次调用、每一笔 token 都记录在案，可查、可审、可回放，授权到人，撤销即失效。POS、爬虫、外部系统按 Addon 协议接入，核心零改动、不停业。出了问题它自己查文档、翻日志、自己修，不解决不罢休，IT 只需要盯真正难的事。',
    },
    demoBtn: '查看演示',
    demoSoon: '演示即将上线',
```

- [ ] **Step 2: Replace the chapter keys in the en table**

Delete the en entries `p2`…`p7` (lines 101–140) and insert:

```js
    c1: {
      label: '01 · Data comes in by itself; the AI keeps watch',
      title: 'Know the whole world without stepping out the door',
      body: 'Every sale and every collection run is an event that flows in on its own; reports write themselves on schedule and land in your hands. The AI watches every store and every SKU around the clock, and the moment something is off it reaches the person who needs to know.',
    },
    c2: {
      label: '02 · How much to reorder: the engine works it out',
      title: 'People guess, fate decides, Fortbrain calculates.',
      body: 'The forecast engine sees down to every SKU and every store and gives the most direct, no-detour decision: how much to move, when to reorder, how much to order. Every action aims at precision and efficiency on the shop floor.',
    },
    c3: {
      label: '03 · People only decide',
      title: 'Decide at your desk; win a thousand miles away',
      body: 'Business events are triaged first, and the assistant brings the decision to you. Say “approve” and the transfer, the calendar entry and the system write-back get done on their own. Interruptions have a budget, so it never becomes noise, and it knows you better the more you use it.',
    },
    c4: {
      label: '04 · Assistants ask each other',
      title: 'They come uncalled and agree unplanned',
      body: 'Your assistant can open a discussion with another department’s assistant, delegate a subtask, and query that department’s knowledge base directly. One meeting fewer, one errand fewer. Four storm guards keep them on real work, not idle chatter.',
    },
    c5: {
      label: '05 · Hybrid Context',
      title: 'Each keeps its bounds; each knows the other’s mind',
      body: 'Company data never leaves the company; personal data never leaves your own computer. Hybrid Context lets the two worlds work as one. Find a supplier list in an Excel file on your machine, then look up their purchase prices inside Fortbrain: no problem, one sentence does it.',
    },
    c6: {
      label: '06 · Worthy of a company’s trust',
      title: 'Everything in its place, every trail on record',
      body: 'Every call and every token spent is on record: searchable, auditable, replayable, granted per person and gone the moment it is revoked. POS, crawlers and external systems attach through the Addon protocol with zero changes to the core and no downtime. When something breaks it reads the docs, digs through the logs and repairs itself, and doesn’t let go until it’s solved. IT only has to look at the genuinely hard problems.',
    },
    demoBtn: 'See it in action',
    demoSoon: 'Demo coming soon',
```

- [ ] **Step 3: Run the i18n tests**

Run: `npm test 2>&1 | grep -E "^# (pass|fail)|not ok"`
Expected: pass (key parity holds; `applyLang` test uses `p1.title` — change that test's node to `getAttribute: () => 'c3.title'` and its assertion to `TEXTS.en.c3.title`).

- [ ] **Step 4: Rewrite sections 3..11 in `index.html`**

Replace everything from `<section data-stage="3">` through the finale section with:

```html
  <section data-stage="3" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c1.label"></div>
      <h2 data-i18n="c1.title"></h2>
      <p data-i18n="c1.body"></p>
    </div>
  </section>
  <section data-stage="4" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c2.label"></div>
      <h2 data-i18n="c2.title"></h2>
      <p data-i18n="c2.body"></p>
    </div>
  </section>
  <section data-stage="5" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c3.label"></div>
      <h2 data-i18n="c3.title"></h2>
      <p data-i18n="c3.body"></p>
    </div>
  </section>
  <section data-stage="6" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c4.label"></div>
      <h2 data-i18n="c4.title"></h2>
      <p data-i18n="c4.body"></p>
    </div>
  </section>
  <section data-stage="7" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c5.label"></div>
      <h2 data-i18n="c5.title"></h2>
      <p data-i18n="c5.body"></p>
    </div>
  </section>
  <section data-stage="8" class="s-chapter">
    <div class="copy">
      <div class="label" data-i18n="c6.label"></div>
      <h2 data-i18n="c6.title"></h2>
      <p data-i18n="c6.body"></p>
    </div>
  </section>

  <section data-stage="9" class="s-end">
    <div class="copy">
      <p class="result" data-i18n="result"></p>
      <h2 class="answer" data-i18n="answer"></h2>
      <p class="answer-sub" data-i18n="answerSub"></p>
      <p class="contact"><span data-i18n="contactPre"></span> <a id="mail" href="#"></a></p>
    </div>
  </section>
```

- [ ] **Step 5: Chapter height in `css/site.css`**

After `section.s-layers { min-height: 300svh; }` add:

```css
/* chapters: 1.5 screens — the copy holds half a screen, then scrolls out while the camera flies on */
section.s-chapter { min-height: 150svh; }
```

- [ ] **Step 6: Run tests and a static sanity check**

Run: `npm test 2>&1 | grep -E "^# (pass|fail)"` → `# pass 14`
Run: `grep -c "<section" index.html` → `10`
Run: `grep -o 'data-i18n="[a-z0-9]*\.' index.html | sort -u` → only `c1..c6`, `layers`, `thesis` prefixes (no `p1..p7`, no `insight`).

- [ ] **Step 7: Commit**

```bash
git add js/i18n.js index.html css/site.css tests/i18n.test.mjs
git commit -m "feat: six chapters — copy (zh/en), sections and 1.5-screen chapter height

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Scene — cube K (hybrid context) and reordered keyframes

**Files:**
- Modify: `js/scene.js` — featured list (`:202-206`), replace the `heal` block (`:394-401`), keyframes (`:456-467`), per-frame J cycle (`:507-522`), store-loop J branches (`:534`, `:539`), scan-ring block (`:559-568`)

**Interfaces:**
- Consumes: `STAGES` from `story.js` (10 entries; finale index 9).
- Produces: `KEYS` with exactly 10 entries in stage order `[hero, thesis, layers, B, H, A, mid(E/F), K, D, finale]`.

- [ ] **Step 1: Rename J → K in the featured list**

```js
  // ── featured cubes for the chapters: B (01), H (02), A (03), E/F (04), K (05), D (06).
  // C, G are kept as ambient animations the camera no longer visits.
  const featured = pickFeatured(stores, 8)
  const [A, B, C, D, E, G, H, K] = featured
  const F = stores.filter((s) => !featured.includes(s)).sort((a, b) => Math.hypot(a.x - E.x, a.z - E.z) - Math.hypot(b.x - E.x, b.z - E.z))[0] || featured[1]
  const isFixed = (s) => [B, C, D, H, K].includes(s)
```

- [ ] **Step 2: Replace the `heal` builder with the `hybrid` builder**

Delete from the comment `// J: self-diagnosis / self-healing` through the end of the `heal = (() => { ... })()` block and insert:

```js
  // K: hybrid context — a glowing slab (the employee's computer) sits beside the cube and light points
  // flow ONE way, computer → cube (outbound only, the server never dials in). Every 9 s the kill
  // switch trips: the beam greys out and the dots freeze; a green ripple, and the flow resumes.
  const K_AZ = 1.4
  const hybrid = (() => {
    K._tint = new THREE.Color(TIER.ok); K._noGold = true
    const dx = Math.cos(K_AZ), dz = -Math.sin(K_AZ)                    // screen-right for the K keyframe
    const slab = new THREE.Group(); slab.rotation.y = K_AZ
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(SQ * 1.4, 0.12, SQ * 0.9)), track(new THREE.MeshStandardMaterial({ color: 0x16283f, emissive: T.acc, emissiveIntensity: 0.25, roughness: 0.35, metalness: 0.6 })))
    body.position.y = 0.16
    const edge = new THREE.LineSegments(track(new THREE.EdgesGeometry(body.geometry)), track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.8 })))
    edge.position.y = 0.16
    const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(SQ * 1.2, SQ * 0.7)), track(new THREE.MeshBasicMaterial({ color: 0x5ee0ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })))
    screen.rotation.x = -Math.PI / 2; screen.position.y = 0.23
    slab.add(body, edge, screen); scene.add(slab)
    // the arc's three control points are rewritten every frame (they depend on the distance scale `sc`)
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
    const lineGeo = track(new THREE.BufferGeometry().setFromPoints(new Array(61).fill(0).map(() => new THREE.Vector3())))
    const line = new THREE.Line(lineGeo, track(new THREE.LineBasicMaterial({ color: T.acc, transparent: true, opacity: 0.2 })))
    scene.add(line)
    const dotGeo = track(new THREE.SphereGeometry(0.36, 12, 10)), dots = []
    for (let i = 0; i < 6; i++) {
      const d = new THREE.Mesh(dotGeo, track(new THREE.MeshBasicMaterial({ color: 0x5ee0ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })))
      scene.add(d); dots.push({ m: d, u: i / 6 })
    }
    const acc = new THREE.Color(T.acc), ok = new THREE.Color(TIER.ok), grey = new THREE.Color(0x4f6784), col = new THREE.Color(TIER.ok)
    return { dir: [dx, dz], slab, body, edge, screen, curve, line, dots, acc, ok, grey, col, level: 0.5, em: 0.12, off: 0, lastPh: 0 }
  })()
```

- [ ] **Step 3: Reorder the keyframes to 10 entries**

Replace the `KEYS` array with:

```js
  const KEYS = [
    { target: new THREE.Vector3(0, 0, 0), dist: 300, pol: 0.95, az: 0, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 230, pol: 0.85, az: 0.8, spin: 0.045, dim: 0, closeup: true, off: 0.7 },
    { target: new THREE.Vector3(0, 0, 0), dist: 480, pol: 0.55, az: 1.6, spin: 0.045, dim: 0.5, closeup: false, off: 0 },
    { target: at(B).add(new THREE.Vector3(0, 3, 0)), dist: 30, pol: 1.1, az: -0.6, spin: 0, dim: 0, closeup: true, off: 1 },                 // 01 · B
    { target: new THREE.Vector3(H.x + Math.cos(H_AZ) * 3.2, HOVER * 0.6, H.z - Math.sin(H_AZ) * 3.2), dist: 26, pol: 1.02, az: H_AZ, spin: 0, dim: 0, closeup: true, off: 1 },  // 02 · H
    { target: at(A).add(new THREE.Vector3(0, 0.8, 0)), dist: 24, pol: 1.05, az: A_AZ, spin: 0, dim: 0, closeup: true, off: 1 },             // 03 · A
    { target: mid, dist: Math.max(34, dEF * 1.3), pol: 1.08, az: 0.3, spin: 0, dim: 0, closeup: true, off: 1 },                            // 04 · E/F
    { target: at(K).add(new THREE.Vector3(0, 0.8, 0)), dist: 25, pol: 1.05, az: K_AZ, spin: 0, dim: 0, closeup: true, off: 1 },             // 05 · K
    { target: new THREE.Vector3(D.x + Math.cos(D_AZ) * 2.6, HOVER * 0.7, D.z - Math.sin(D_AZ) * 2.6), dist: 26, pol: 1.05, az: D_AZ, spin: 0, dim: 0, closeup: true, off: 1 },  // 06 · D
    { target: new THREE.Vector3(0, 0, 0), dist: 340, pol: 0.95, az: 0.25, spin: 0.02, dim: 0, closeup: true, off: 0.45 },
  ]
  if (KEYS.length !== STAGES.length) throw new Error(`scene: ${KEYS.length} keyframes for ${STAGES.length} stages`)
```

- [ ] **Step 4: Replace the per-frame J cycle with the K cycle**

Replace the block starting `// ── J cycle:` (through `heal._scanT = scanT` and its closing brace) with:

```js
    // ── K cycle: 0–.6 flowing · .6–.8 kill switch down (grey, dots frozen) · .8–1 restored
    {
      const ph = reduced ? 0.2 : (el / 9) % 1
      const off = smooth((ph - 0.6) / 0.05) * (1 - smooth((ph - 0.8) / 0.05))
      hybrid.off = off
      hybrid.col.copy(hybrid.ok).lerp(hybrid.grey, off)
      hybrid.level = 0.5 - 0.3 * off
      hybrid.em = 0.12 + 0.04 * Math.sin(el * 2) - 0.08 * off
      hybrid.line.material.opacity = 0.2 - 0.12 * off
      hybrid.edge.material.color.copy(hybrid.acc).lerp(hybrid.grey, off)
      hybrid.body.material.emissiveIntensity = 0.25 * (1 - off * 0.7)
      hybrid.screen.material.opacity = 0.18 * (1 - off * 0.8)
      if (!reduced && ph >= 0.8 && hybrid.lastPh < 0.8) ripple(K.x, K.z, TIER.ok, 0.6)
      hybrid.lastPh = ph
    }
```

- [ ] **Step 5: Store-loop branches J → K**

Change `else if (s === J) lv = heal.level` to `else if (s === K) lv = hybrid.level`, and the `if (s === J) {...}` line to:

```js
      if (s === K) { s._edges.material.color.copy(hybrid.col); s._shell.material.emissive.copy(hybrid.col); s._core.material.uniforms.uTint.value.copy(hybrid.col); s._emBase = hybrid.em }
```

- [ ] **Step 6: Replace the scan-ring block with the slab + beam placement**

Replace the block starting `// J: the amber scan ring` (through its closing brace) with:

```js
    // K: the computer slab sits screen-right of the cube; the arc and its outbound-only dots follow
    // the same distance scale as the cubes; everything freezes while the kill switch is down
    {
      const [kdx, kdz] = hybrid.dir
      const px = K.x + kdx * SQ * 2.6 * sc, pz = K.z + kdz * SQ * 2.6 * sc
      hybrid.slab.position.set(px, 0, pz); hybrid.slab.scale.setScalar(Math.max(0.5, sc))
      const p = hybrid.curve.points
      p[0].set(px, 0.4 * sc, pz); p[2].set(K.x, (HOVER + SQ * 0.2) * sc, K.z)
      p[1].copy(p[0]).add(p[2]).multiplyScalar(0.5); p[1].y = (HOVER + SQ * 1.2) * sc
      const pos = hybrid.line.geometry.attributes.position
      for (let i = 0; i <= 60; i++) { hybrid.curve.getPoint(i / 60, tmpT); pos.setXYZ(i, tmpT.x, tmpT.y, tmpT.z) }
      pos.needsUpdate = true
      for (const d of hybrid.dots) {
        if (!reduced) d.u = (d.u + dt * 0.22 * (1 - hybrid.off)) % 1
        hybrid.curve.getPoint(d.u, d.m.position); d.m.scale.setScalar(Math.max(0.5, sc))
        d.m.material.opacity = (0.35 + 0.6 * Math.sin(d.u * Math.PI)) * (1 - hybrid.off * 0.85)
      }
    }
```

- [ ] **Step 7: Remove the last J references and check syntax**

Run: `grep -n "\bJ\b\|heal\b\|J_AZ" js/scene.js` → no output.
Run: `node --check js/scene.js && npm test 2>&1 | grep -E "^# (pass|fail)"` → syntax ok, `# pass 14`.

- [ ] **Step 8: Browser smoke test**

Start `python3 scripts/serve.py` (port 8931), open `http://127.0.0.1:8931/?lang=zh`, and in the console:

```js
const fb = window.__fb; const secs = document.querySelectorAll('main > section')
window.scrollTo(0, secs[7].offsetTop + innerHeight * 0.3); fb.story.refresh()
for (let i = 0; i < 40; i++) fb.view.tick(performance.now() + i * 16)
({ errors: fb.errors, sections: secs.length, scrollScreens: document.documentElement.scrollHeight / innerHeight })
```

Expected: `errors: []`, `sections: 10`, `scrollScreens` ≈ 17. Take a screenshot at stage 7 (the K cube with the slab and arc should be in view).

- [ ] **Step 9: Commit**

```bash
git add js/scene.js
git commit -m "feat(scene): cube K for Hybrid Context (computer slab, outbound-only beam, kill switch); keyframes for ten stages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Ship batch 1

**Files:**
- Modify: `js/main.js:7` (VERSION), `index.html` (script `?v=`), `README.md` (stage list in the file table is fine; update the one-liner if it mentions 六个特点)

- [ ] **Step 1: Bump versions**

`VERSION = '2026-09-21a'` in `js/main.js`; `src="js/main.js?v=2026-09-21a"` in `index.html`.

- [ ] **Step 2: Full test + push**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"
git add js/main.js index.html README.md
git commit -m "chore: VERSION 2026-09-21a — six-chapter restructure

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

## Batch 2 — demo framework + hybrid demo (Tasks 5–9)

### Task 5: Pure step machine

**Files:**
- Create: `js/demo-steps.js`
- Test: `tests/demo-steps.test.mjs`

**Interfaces:**
- Produces: `createStepper({ count, onGo, onAutoChange, dwell, timer, clear, autoplay })` returning `{ go(i), next(), prev(), play(), pause(), index, auto, dispose() }`.
  - `onGo(i)` fires on every move (including the first `go(0)` the caller makes).
  - Any user move (`go/next/prev`) stops autoplay; `play()` resumes; `pause()` stops.
  - `dwell(i)` → ms to wait after step i before auto-advancing; no auto-advance past the last step.

- [ ] **Step 1: Write the failing tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createStepper } from '../js/demo-steps.js'

// deterministic fake timers
function fakeTimers() {
  const q = []
  return {
    timer: (fn, ms) => { const h = { fn, ms }; q.push(h); return h },
    clear: (h) => { const i = q.indexOf(h); if (i >= 0) q.splice(i, 1) },
    fire: () => { const h = q.shift(); h?.fn() },
    pending: () => q.length,
  }
}

test('go clamps, reports each move, and autoplay advances after dwell', () => {
  const ft = fakeTimers(), seen = []
  const s = createStepper({ count: 3, onGo: (i) => seen.push(i), dwell: () => 100, timer: ft.timer, clear: ft.clear })
  s.play(); s.go(0, 'auto')
  assert.deepEqual(seen, [0]); assert.equal(ft.pending(), 1)
  ft.fire(); assert.deepEqual(seen, [0, 1])
  ft.fire(); assert.deepEqual(seen, [0, 1, 2])
  assert.equal(ft.pending(), 0)                       // nothing armed past the last step
  s.go(9); assert.equal(s.index, 2)                   // clamped
  s.go(-4); assert.equal(s.index, 0)
})

test('a user move stops autoplay; play resumes it; pause stops it', () => {
  const ft = fakeTimers(), autos = []
  const s = createStepper({ count: 4, onGo: () => {}, onAutoChange: (a) => autos.push(a), dwell: () => 50, timer: ft.timer, clear: ft.clear })
  s.play(); s.go(0, 'auto'); assert.equal(s.auto, true)
  s.next(); assert.equal(s.auto, false); assert.equal(ft.pending(), 0); assert.equal(s.index, 1)
  s.play(); assert.equal(s.auto, true); assert.equal(ft.pending(), 1)
  s.pause(); assert.equal(s.auto, false); assert.equal(ft.pending(), 0)
  assert.deepEqual(autos, [true, false, true, false])
})

test('prev/next move by one; dispose clears the pending timer', () => {
  const ft = fakeTimers()
  const s = createStepper({ count: 3, onGo: () => {}, dwell: () => 10, timer: ft.timer, clear: ft.clear })
  s.go(1); s.next(); assert.equal(s.index, 2); s.prev(); assert.equal(s.index, 1)
  s.play(); assert.equal(ft.pending(), 1); s.dispose(); assert.equal(ft.pending(), 0)
})
```

- [ ] **Step 2: Run, expect failure**

Run: `node --test tests/demo-steps.test.mjs 2>&1 | tail -3` → fails (module not found).

- [ ] **Step 3: Implement `js/demo-steps.js`**

```js
/**
 * Step machine for the demos (no DOM). `go(i)` moves to step i and reports it through `onGo`;
 * with autoplay on, a timer advances one step after `dwell(i)` ms. Any user move turns autoplay
 * off (the user took the wheel); `play()` hands it back. Timers are injectable for tests.
 */
export function createStepper({ count, onGo, onAutoChange = () => {}, dwell = () => 2600, timer = setTimeout, clear = clearTimeout }) {
  let i = -1, auto = false, handle = null
  const disarm = () => { if (handle != null) clear(handle); handle = null }
  const arm = () => { disarm(); if (auto && i < count - 1) handle = timer(() => { handle = null; go(i + 1, 'auto') }, dwell(i)) }
  const setAuto = (v) => { if (v === auto) return; auto = v; onAutoChange(v) }
  function go(n, by = 'user') {
    if (by !== 'auto') setAuto(false)
    i = Math.max(0, Math.min(count - 1, n)); onGo(i); arm()
  }
  return {
    go, next: () => go(i + 1), prev: () => go(i - 1),
    play() { setAuto(true); arm() }, pause() { setAuto(false); disarm() },
    get index() { return i }, get auto() { return auto },
    dispose() { disarm() },
  }
}
```

- [ ] **Step 4: Run, expect pass**

Run: `node --test tests/demo-steps.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → `# pass 3`.

- [ ] **Step 5: Commit**

```bash
git add js/demo-steps.js tests/demo-steps.test.mjs
git commit -m "feat(demo): pure step machine with injectable timers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Demo overlay shell, styles and page wiring

**Files:**
- Create: `js/demo.js`, `css/demo.css`
- Modify: `index.html` (link `css/demo.css`; add `#demo` shell before `</body>`; add a button in each chapter's `.copy`)
- Modify: `css/site.css` (`.demo-btn`, `body.demo-open`)
- Modify: `js/main.js` (pause flag in the loop, `initDemos`)
- Modify: `js/i18n.js` (`demoUi` strings in both tables)

**Interfaces:**
- Consumes: `createStepper` (Task 5); `TEXTS[lang]` from i18n.
- Produces: `initDemos({ root, getLang, onOpen, onClose, version })` → `{ open(name), close(), refresh() }`.
  Demo modules must export `{ steps: [{ id, dwell?, run(ctx) }], mount(root, t) }` where `t = TEXTS[lang].demos[name]` and `ctx = { root, t, go(i), index }`. `mount` renders from scratch; `run(ctx)` for step i must be idempotent when replayed 0..i.

- [ ] **Step 1: i18n strings for the shell**

Add to both tables (after `demoSoon`):

```js
    demoUi: { close: '关闭', prev: '上一步', next: '下一步', play: '自动播放', pause: '暂停', step: '第 {i} / {n} 步' },
```
```js
    demoUi: { close: 'Close', prev: 'Back', next: 'Next', play: 'Auto-play', pause: 'Pause', step: 'Step {i} / {n}' },
```

- [ ] **Step 2: `css/demo.css`**

```css
/* ── demo overlay: dark product tokens (subset of ~/Fortbrain ui-standard, html.dark values) ── */
#demo {
  --fbd-bg: #14171c; --fbd-bg-2: #0f1115;
  --fbd-ink: #f3f4f6; --fbd-ink-2: #d1d5db; --fbd-ink-3: #9ca3af; --fbd-ink-4: #6b7280;
  --fbd-line: rgba(255, 255, 255, .06); --fbd-card: rgba(255, 255, 255, .07); --fbd-edge: rgba(255, 255, 255, .09);
  --fbd-field: rgba(255, 255, 255, .05); --fbd-field-edge: rgba(255, 255, 255, .16);
  --fbd-live: #4ade80; --fbd-live-ink: #86efac; --fbd-bad: #f87171; --fbd-warn: #fbbf24;
  --fbd-glow: rgba(74, 222, 128, .22); --fbd-bubble-me: #0a84ff;
  --fbd-t: 320ms cubic-bezier(.2, .7, .2, 1);
  position: fixed; inset: 0; z-index: 20; display: grid; place-items: center;
  background: rgba(5, 11, 24, .72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  opacity: 0; transition: opacity .3s;
}
#demo[hidden] { display: none; }
#demo.show { opacity: 1; }
.fbd-panel {
  width: min(1100px, calc(100vw - 32px)); height: min(720px, calc(100svh - 32px));
  display: grid; grid-template-rows: auto 1fr auto;
  background: var(--fbd-bg); color: var(--fbd-ink-2); border: 1px solid var(--fbd-edge); border-radius: 18px;
  box-shadow: 0 40px 90px rgba(0, 0, 0, .6); overflow: hidden;
  font: 13px/1.5 var(--sans); transform: translateY(12px) scale(.985); transition: transform var(--fbd-t);
}
#demo.show .fbd-panel { transform: none; }
.fbd-top, .fbd-bottom { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--fbd-line); }
.fbd-bottom { border-bottom: 0; border-top: 1px solid var(--fbd-line); justify-content: flex-end; }
.fbd-top b { font-weight: 500; color: var(--fbd-ink); }
.fbd-top .fbd-step { margin-left: auto; color: var(--fbd-ink-4); font-family: var(--mono); font-size: 11px; letter-spacing: .08em; }
.fbd-x { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--fbd-edge); background: transparent; color: var(--fbd-ink-3); cursor: pointer; font-size: 16px; line-height: 1; }
.fbd-x:hover { color: var(--fbd-ink); }
.fbd-stage { position: relative; overflow: auto; }
.fbd-btn { font: 500 12px/1 var(--sans); padding: 9px 14px; border-radius: 9px; border: 1px solid var(--fbd-field-edge); background: var(--fbd-field); color: var(--fbd-ink-2); cursor: pointer; transition: background var(--fbd-t), color var(--fbd-t); }
.fbd-btn:hover { background: var(--fbd-card); color: var(--fbd-ink); }
.fbd-btn.pri { background: var(--fbd-ink); color: var(--fbd-bg); border-color: transparent; }
.fbd-btn:disabled { opacity: .4; cursor: default; }
.fbd-caption { position: absolute; left: 16px; bottom: 12px; right: 16px; pointer-events: none; color: var(--fbd-ink-3); font-size: 12px; }
.fbd-caption span { display: inline-block; background: rgba(15, 17, 21, .85); border: 1px solid var(--fbd-edge); border-radius: 999px; padding: 6px 12px; }

/* shared mock components */
.fbd-cols { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; padding: 14px; min-height: 100%; }
.fbd-page, .fbd-chat { background: var(--fbd-bg-2); border: 1px solid var(--fbd-edge); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.fbd-h { display: flex; align-items: center; gap: 8px; color: var(--fbd-ink); font-weight: 500; }
.fbd-h small { color: var(--fbd-ink-4); font-weight: 400; }
.fbd-card { background: var(--fbd-card); border: 1px solid var(--fbd-edge); border-radius: 12px; padding: 12px; transition: box-shadow var(--fbd-t), border-color var(--fbd-t); }
.fbd-card.hot { box-shadow: 0 0 0 3px var(--fbd-glow); border-color: var(--fbd-live); }
.fbd-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--fbd-ink-4); box-shadow: 0 0 0 3px rgba(255,255,255,.04); transition: background var(--fbd-t), box-shadow var(--fbd-t); }
.fbd-dot.on { background: var(--fbd-live); box-shadow: 0 0 10px var(--fbd-live); }
.fbd-dot.warn { background: var(--fbd-warn); }
.fbd-tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--fbd-edge); color: var(--fbd-ink-3); }
.fbd-tag.live { color: var(--fbd-live-ink); border-color: rgba(74, 222, 128, .35); }
.fbd-tag.warn { color: var(--fbd-warn); border-color: rgba(251, 191, 36, .35); }
.fbd-tag.bad { color: var(--fbd-bad); border-color: rgba(248, 113, 113, .35); }
.fbd-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--fbd-line); }
.fbd-row b { font-weight: 500; color: var(--fbd-ink); }
.fbd-row .grow { flex: 1; min-width: 0; }
.fbd-row small { color: var(--fbd-ink-4); display: block; }
.fbd-bar { height: 5px; border-radius: 999px; background: var(--fbd-field); overflow: hidden; }
.fbd-bar i { display: block; height: 100%; width: 0; background: var(--fbd-live); transition: width 1.2s linear; }
.fbd-cmd { font-family: var(--mono); font-size: 11px; background: var(--fbd-field); border: 1px solid var(--fbd-field-edge); border-radius: 8px; padding: 8px 10px; color: var(--fbd-ink-2); overflow-x: auto; white-space: nowrap; }
.fbd-form { display: grid; grid-template-columns: auto 1fr auto; gap: 8px 10px; align-items: center; font-size: 12px; }
.fbd-form label { color: var(--fbd-ink-3); }
.fbd-field { background: var(--fbd-field); border: 1px solid var(--fbd-field-edge); border-radius: 8px; padding: 6px 9px; font-family: var(--mono); font-size: 11px; color: var(--fbd-ink); min-height: 28px; }
.fbd-hint { grid-column: 2 / 4; color: var(--fbd-ink-4); font-size: 11px; }
.fbd-msgs { display: flex; flex-direction: column; gap: 8px; }
.fbd-msg { max-width: 88%; opacity: 0; transform: translateY(6px); transition: opacity var(--fbd-t), transform var(--fbd-t); }
.fbd-msg.in { opacity: 1; transform: none; }
.fbd-msg.me { align-self: flex-end; background: var(--fbd-bubble-me); color: #fff; padding: 7px 12px; border-radius: 14px 14px 4px 14px; }
.fbd-msg.bot { align-self: flex-start; background: rgba(120, 120, 128, .28); padding: 7px 12px; border-radius: 14px 14px 14px 4px; }
.fbd-msg.tool { align-self: flex-start; font-family: var(--mono); font-size: 11px; color: var(--fbd-ink-3); padding: 4px 10px; border-left: 2px solid var(--fbd-live); }
.fbd-msg.tool.local { border-left-color: #5ee0ff; }
.fbd-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.fbd-table th { text-align: left; color: var(--fbd-ink-4); font-weight: 400; padding: 4px 6px; border-bottom: 1px solid var(--fbd-line); }
.fbd-table td { padding: 5px 6px; border-bottom: 1px solid var(--fbd-line); color: var(--fbd-ink-2); }
.fbd-table td.num { font-family: var(--mono); text-align: right; }
.fbd-switch { width: 40px; height: 22px; border-radius: 999px; background: var(--fbd-live); position: relative; cursor: pointer; border: 0; transition: background var(--fbd-t); }
.fbd-switch::after { content: ""; position: absolute; top: 3px; left: 21px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left var(--fbd-t); }
.fbd-switch.off { background: var(--fbd-ink-4); }
.fbd-switch.off::after { left: 3px; }
.fbd-menubar { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--fbd-ink-4); opacity: 0; transition: opacity var(--fbd-t); }
.fbd-menubar.in { opacity: 1; }
.fbd-hide { display: none !important; }

@media (max-width: 767px), (pointer: coarse) and (max-width: 1024px) {
  .fbd-panel { width: 100vw; height: 100svh; border-radius: 0; border: 0; }
  .fbd-cols { grid-template-columns: 1fr; }
  .fbd-caption { position: static; padding: 0 14px 10px; }
}
@media (prefers-reduced-motion: reduce) { #demo, .fbd-panel, .fbd-msg, .fbd-card, .fbd-bar i { transition: none; } }
```

- [ ] **Step 3: Site-side styles in `css/site.css`**

After the `.copy p strong` rule add:

```css
.demo-btn {
  margin-top: 26px; align-self: flex-start;
  font: 500 12px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase;
  color: var(--acc); background: rgba(166, 220, 255, .06); border: 1px solid rgba(166, 220, 255, .35); border-radius: 999px;
  padding: 11px 18px; cursor: pointer; transition: background .3s, border-color .3s;
}
.demo-btn:hover { background: rgba(166, 220, 255, .14); border-color: var(--acc); }
.demo-btn[disabled] { color: var(--dim); border-color: var(--rule); background: transparent; cursor: default; }
body.demo-open { overflow: hidden; }
```

- [ ] **Step 4: `index.html` — stylesheet, buttons, shell**

In `<head>` after `site.css`: `<link rel="stylesheet" href="css/demo.css">`.

In each chapter's `.copy`, after the `<p>`, add a button. Only `c5` is live in this batch:

```html
      <button class="demo-btn" type="button" data-demo="data" disabled data-i18n="demoSoon"></button>       <!-- c1 -->
      <button class="demo-btn" type="button" data-demo="forecast" disabled data-i18n="demoSoon"></button>   <!-- c2 -->
      <button class="demo-btn" type="button" data-demo="decide" disabled data-i18n="demoSoon"></button>     <!-- c3 -->
      <button class="demo-btn" type="button" data-demo="agents" disabled data-i18n="demoSoon"></button>     <!-- c4 -->
      <button class="demo-btn" type="button" data-demo="hybrid" data-i18n="demoBtn"></button>               <!-- c5 -->
      <button class="demo-btn" type="button" data-demo="trust" disabled data-i18n="demoSoon"></button>      <!-- c6 -->
```

Before `<script type="module" ...>`:

```html
<div id="demo" hidden role="dialog" aria-modal="true">
  <div class="fbd-panel">
    <div class="fbd-top"><b class="fbd-title"></b><span class="fbd-step"></span><button class="fbd-x" type="button" aria-label="Close">×</button></div>
    <div class="fbd-stage"></div>
    <div class="fbd-bottom">
      <button class="fbd-btn fbd-prev" type="button"></button>
      <button class="fbd-btn fbd-play" type="button"></button>
      <button class="fbd-btn pri fbd-next" type="button"></button>
    </div>
  </div>
</div>
```

- [ ] **Step 5: `js/demo.js`**

```js
/**
 * Demo overlay: one fixed panel, a step machine, one demo module at a time. Opening locks page
 * scroll and pauses the scene (onOpen/onClose); `#demo=<name>` in the URL opens on load and the
 * browser Back button closes. Changing language re-mounts the same demo at the same step.
 */
import { createStepper } from './demo-steps.js'
import { TEXTS } from './i18n.js'

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function initDemos({ root, getLang, onOpen = () => {}, onClose = () => {}, version = '' }) {
  const stage = root.querySelector('.fbd-stage'), title = root.querySelector('.fbd-title'), stepEl = root.querySelector('.fbd-step')
  const prev = root.querySelector('.fbd-prev'), next = root.querySelector('.fbd-next'), play = root.querySelector('.fbd-play')
  let cur = null          // { name, mod, stepper }
  let savedY = 0

  const ui = () => TEXTS[getLang()].demoUi
  const texts = (name) => TEXTS[getLang()].demos[name]

  function paint() {
    if (!cur) return
    const u = ui(), i = cur.stepper.index, n = cur.mod.steps.length
    title.textContent = texts(cur.name).title
    stepEl.textContent = u.step.replace('{i}', i + 1).replace('{n}', n)
    prev.textContent = u.prev; next.textContent = u.next; play.textContent = cur.stepper.auto ? u.pause : u.play
    prev.disabled = i <= 0; next.disabled = i >= n - 1
  }
  // render from scratch and replay steps 0..i (each step is idempotent, so no undo logic)
  function render(i) {
    const t = texts(cur.name)
    stage.innerHTML = ''
    cur.mod.mount(stage, t)
    const ctx = { root: stage, t, go: (k) => cur.stepper.go(k), index: i }
    for (let k = 0; k <= i; k++) { ctx.index = k; cur.mod.steps[k].run(ctx) }
    paint()
  }

  async function open(name) {
    if (cur?.name === name) return
    if (cur) teardown()
    const mod = await import(`./demos/${name}.js?v=${version}`)
    cur = { name, mod, stepper: null }
    cur.stepper = createStepper({
      count: mod.steps.length,
      onGo: (i) => { render(i) },
      onAutoChange: paint,
      dwell: (i) => mod.steps[i].dwell ?? 2800,
    })
    savedY = window.scrollY
    document.body.classList.add('demo-open')
    root.hidden = false; requestAnimationFrame(() => root.classList.add('show'))
    if (location.hash !== `#demo=${name}`) history.pushState({ demo: name }, '', `#demo=${name}`)
    onOpen()
    if (!reduced) cur.stepper.play()
    cur.stepper.go(0, 'auto')
  }
  function teardown() {
    cur?.stepper.dispose(); cur = null
    stage.innerHTML = ''
    root.classList.remove('show'); root.hidden = true
    document.body.classList.remove('demo-open')
    window.scrollTo(0, savedY)
    onClose()
  }
  function close() {
    if (!cur) return
    teardown()
    if (location.hash.startsWith('#demo=')) history.replaceState(null, '', location.pathname + location.search)
  }

  root.querySelector('.fbd-x').addEventListener('click', close)
  root.addEventListener('click', (e) => { if (e.target === root) close() })
  prev.addEventListener('click', () => cur?.stepper.prev())
  next.addEventListener('click', () => cur?.stepper.next())
  play.addEventListener('click', () => { if (!cur) return; cur.stepper.auto ? cur.stepper.pause() : cur.stepper.play() })
  window.addEventListener('keydown', (e) => {
    if (!cur) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight') cur.stepper.next()
    else if (e.key === 'ArrowLeft') cur.stepper.prev()
  })
  window.addEventListener('popstate', () => { if (cur && !location.hash.startsWith('#demo=')) teardown() })
  for (const b of document.querySelectorAll('.demo-btn[data-demo]')) b.addEventListener('click', () => { if (!b.disabled) open(b.dataset.demo) })

  const fromHash = () => { const m = location.hash.match(/^#demo=([a-z]+)$/); if (m && document.querySelector(`.demo-btn[data-demo="${m[1]}"]:not([disabled])`)) open(m[1]) }
  fromHash()

  return { open, close, refresh: () => { if (cur) render(cur.stepper.index) } }
}
```

- [ ] **Step 6: Wire `js/main.js`**

Import `initDemos` and add a pause flag:

```js
import { initDemos } from './demo.js'
```

Replace the loop and add init at the end of `boot()`:

```js
  let paused = false
  const loop = (now) => {
    if (!document.hidden && !paused) { story.poll(); view.tick(now); layers.tick(now) }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  const demos = initDemos({
    root: document.getElementById('demo'), getLang: () => lang, version: VERSION,
    onOpen: () => { paused = true }, onClose: () => { paused = false; story.refresh() },
  })
  window.__fb.demos = demos
```

And make language switching re-render an open demo: in `setLang` add `window.__fb.demos?.refresh()` after `applyLang`.

- [ ] **Step 7: Placeholder demo so the shell can be exercised**

Create `js/demos/hybrid.js` minimal (Task 8 replaces it):

```js
export const steps = [{ id: 'one', run() {} }, { id: 'two', run({ root }) { root.querySelector('.fbd-card').classList.add('hot') } }]
export function mount(root, t) { root.innerHTML = `<div class="fbd-cols"><div class="fbd-page"><div class="fbd-card">${t.title}</div></div></div>` }
```

Add to both i18n tables: `demos: { hybrid: { title: '端云同境 · 演示' } }` / `demos: { hybrid: { title: 'Hybrid Context · demo' } }`.

- [ ] **Step 8: Browser check**

Open `http://127.0.0.1:8931/?lang=zh#demo=hybrid`: overlay opens on load, title shows, step 1/2 → 2/2 auto-advances and the card gets the glow, Esc closes and the hash is cleared, page scroll position restored, `window.__fb.errors` is `[]`. Click the c5 button: opens again. The five disabled buttons show 「演示即将上线」.

- [ ] **Step 9: Test + commit**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"
git add index.html css/site.css css/demo.css js/demo.js js/demos/hybrid.js js/main.js js/i18n.js
git commit -m "feat(demo): overlay shell, product-dark tokens, chapter buttons, hash deep link, scene pause

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Hybrid demo copy (zh/en)

**Files:**
- Modify: `js/i18n.js` (`demos.hybrid` in both tables)

**Interfaces:**
- Produces the `t` object consumed by `js/demos/hybrid.js` (Task 8). Keys below are the contract.

- [ ] **Step 1: zh**

```js
    demos: {
      hybrid: {
        title: '端云同境 · 本地桥接',
        page: { crumb: '端云同境 → 本地桥接', channel: '通道', none: '还没有配对的电脑', install: '在你的 Mac 上跑这一条，浏览器会自动打开确认配对：', cmd: 'curl -fsSL https://demo.fortbrain.ai/hb/install.sh | sh', pair: '确认配对', device: '开发机', ver: '桥接 0.1.0', online: '在线 · 助理现在能用这台电脑上开放的工具', paused: '已暂停：助理读不到这台电脑上的任何东西', menubar: '菜单栏 · 同境', killLabel: '总闸', installed: '已装的连接器', addable: '可以添加', shellName: '本地命令', shellSum: '让助理在你指定的目录里跑受限命令、看目录、读文本文件。', danger: '中等', btnInstall: '安装', installing: '安装中', installedNot: '已安装 · 未启用', btnEnable: '启用', running: '在跑 · 4 个工具', noPath: '全程没有让你填过任何路径', cfgRoot: '授权目录', cfgAllow: '允许的命令', browse: '浏览', save: '保存配置', hintRoot: '助理只能在这个目录里面看和跑；选得越小越安全', picked: '~/Desktop', allow: 'ls, cat, head, grep, find, wc' },
        chat: { title: '私人助理', q1: '我桌面上有什么？', tool1: 'shell.list_dir  ~/Desktop', a1: '桌面上有 3 个文件：供应商列表.xlsx、Q3 采购计划.pdf、门店照片/。', q2: '把 /etc/hosts 读出来', a2: '这台电脑只对助理开放了 ~/Desktop，/etc/hosts 不在授权目录里，我不会去读。需要的话可以在「本地桥接」页里调整授权目录。', q3: '再看看桌面', a3: '你暂停了这台电脑，现在读不到任何本地内容。恢复之后再问我。', q4: '供应商列表.xlsx 里有哪些供应商，Fortbrain 里他们的采购价是多少？', tool4a: 'shell.read_file  ~/Desktop/供应商列表.xlsx', tool4b: 'retail.purchase_prices  供应商 × 3', a4: '表里 3 家供应商，Fortbrain 里的最新采购价：', th: ['供应商', 'SKU 数', '最新采购价'], rows: [['华东日化', '12', '¥ 18.40'], ['金穗食品', '27', '¥ 6.90'], ['蓝海饮品', '9', '¥ 3.25']], local: '本机', cloud: '平台' },
        cap: ['没配对时页面只做一件事：把桥接装到你的电脑上。', '配对完成：绿点亮起，菜单栏出现图标。', '装连接器是守护进程做的，进度推回页面。', '配置是表单，不是自由文本；路径由本机弹框选。', '助理调用本机工具，结果只在内存里过一道，服务器不留副本。', '不在授权目录里的，它如实说，而且不重试。', '总闸一拉，助理立刻读不到本地任何东西。', '本机的 Excel + 平台的采购价：两个次元，一句话。'],
      },
    },
```

- [ ] **Step 2: en**

```js
    demos: {
      hybrid: {
        title: 'Hybrid Context · Local bridge',
        page: { crumb: 'Hybrid Context → Local bridge', channel: 'Channel', none: 'No computer paired yet', install: 'Run this on your Mac; the browser opens to confirm pairing:', cmd: 'curl -fsSL https://demo.fortbrain.ai/hb/install.sh | sh', pair: 'Confirm pairing', device: 'Dev Mac', ver: 'bridge 0.1.0', online: 'Online · the assistant can use the tools you open on this computer', paused: 'Paused: the assistant cannot read anything on this computer', menubar: 'Menu bar · Hybrid', killLabel: 'Kill switch', installed: 'Installed connectors', addable: 'Available to add', shellName: 'Local commands', shellSum: 'Lets the assistant run restricted commands, list folders and read text files inside a folder you choose.', danger: 'medium', btnInstall: 'Install', installing: 'Installing', installedNot: 'Installed · not enabled', btnEnable: 'Enable', running: 'Running · 4 tools', noPath: 'You never typed a single path', cfgRoot: 'Allowed folder', cfgAllow: 'Allowed commands', browse: 'Browse', save: 'Save config', hintRoot: 'The assistant can only look and run inside this folder; smaller is safer', picked: '~/Desktop', allow: 'ls, cat, head, grep, find, wc' },
        chat: { title: 'Assistant', q1: 'What is on my desktop?', tool1: 'shell.list_dir  ~/Desktop', a1: '3 items on the desktop: suppliers.xlsx, Q3-purchasing-plan.pdf, store-photos/.', q2: 'Read /etc/hosts for me', a2: 'This computer only opens ~/Desktop to me. /etc/hosts is outside the allowed folder, so I will not read it. You can change the folder on the Local bridge page.', q3: 'Check the desktop again', a3: 'You paused this computer, so I cannot read any local content right now. Ask me again once it is resumed.', q4: 'Which suppliers are in suppliers.xlsx, and what are their purchase prices in Fortbrain?', tool4a: 'shell.read_file  ~/Desktop/suppliers.xlsx', tool4b: 'retail.purchase_prices  suppliers × 3', a4: '3 suppliers in the sheet; latest purchase prices in Fortbrain:', th: ['Supplier', 'SKUs', 'Latest price'], rows: [['East Coast Chem', '12', '¥ 18.40'], ['Golden Ear Foods', '27', '¥ 6.90'], ['Blue Sea Drinks', '9', '¥ 3.25']], local: 'local', cloud: 'platform' },
        cap: ['With nothing paired, the page does one thing: get the bridge onto your computer.', 'Paired: the dot turns green and the menu-bar icon appears.', 'The daemon installs the connector; progress flows back to the page.', 'Configuration is a form, not free text; the folder is picked by a dialog on your own machine.', 'The assistant calls a local tool; the result passes through memory only, the server keeps no copy.', 'Outside the allowed folder it says so plainly, and does not retry.', 'Pull the kill switch and the assistant instantly loses all local access.', 'A local Excel file plus platform prices: two worlds, one sentence.'],
      },
    },
```

- [ ] **Step 3: Run tests (key parity incl. nested arrays) and commit**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"
git add js/i18n.js
git commit -m "copy: hybrid demo strings (zh/en)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Hybrid demo module

**Files:**
- Create (replace placeholder): `js/demos/hybrid.js`

**Interfaces:**
- Consumes: `t = TEXTS[lang].demos.hybrid` (Task 7), `.fbd-*` classes (Task 6), `ctx.go(i)` from the shell.
- Exports: `steps` (8 entries, ids `install, pair, connector, config, ask, deny, kill, both`), `mount(root, t)`.

- [ ] **Step 1: Write the module**

```js
/**
 * Hybrid Context demo: left is the "Hybrid Context → Local bridge" page, right is the assistant.
 * Eight steps, each idempotent: the shell re-mounts and replays 0..i when moving backwards or
 * switching language. Clickable page controls jump to the step they belong to.
 */
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild }
const q = (root, sel) => root.querySelector(sel)
const show = (n) => n.classList.remove('fbd-hide')
const hide = (n) => n.classList.add('fbd-hide')

function bubble(root, cls, text) {
  const m = el(`<div class="fbd-msg ${cls}">${text}</div>`)
  q(root, '.fbd-msgs').appendChild(m)
  requestAnimationFrame(() => m.classList.add('in'))
  return m
}
function caption(root, t, i) { q(root, '.fbd-caption span').textContent = t.cap[i] }

export function mount(root, t) {
  const p = t.page, c = t.chat
  root.innerHTML = `
  <div class="fbd-cols">
    <div class="fbd-page">
      <div class="fbd-h">${p.crumb} <span class="fbd-menubar"><span class="fbd-dot"></span>${p.menubar}</span></div>
      <div class="fbd-card ch">
        <div class="fbd-h"><span class="fbd-dot chdot"></span><span class="chtitle">${p.channel} · ${p.none}</span>
          <span class="grow"></span><span class="killwrap fbd-hide"><small>${p.killLabel}</small> <button class="fbd-switch kill" type="button" aria-label="${p.killLabel}"></button></span></div>
        <div class="setup"><p>${p.install}</p><div class="fbd-cmd">${p.cmd}</div><p><button class="fbd-btn pri pair" type="button">${p.pair}</button></p></div>
        <div class="dev fbd-hide"><div class="fbd-row"><b>${p.device}</b><span class="fbd-tag">${p.ver}</span><span class="grow"></span><small class="say">${p.online}</small></div></div>
      </div>
      <div class="fbd-card inst fbd-hide">
        <div class="fbd-h">${p.installed}</div>
        <div class="fbd-row"><div class="grow"><b>${p.shellName}</b><small class="state">${p.installedNot}</small></div><span class="fbd-tag st">${p.installedNot}</span><button class="fbd-btn enable" type="button">${p.btnEnable}</button></div>
        <div class="cfg fbd-hide">
          <div class="fbd-form">
            <label>${p.cfgRoot}</label><div class="fbd-field root">~/</div><button class="fbd-btn browse" type="button">${p.browse}</button>
            <span class="fbd-hint">${p.hintRoot}</span>
            <label>${p.cfgAllow}</label><div class="fbd-field">${p.allow}</div><button class="fbd-btn save" type="button">${p.save}</button>
          </div>
        </div>
      </div>
      <div class="fbd-card add">
        <div class="fbd-h">${p.addable}</div>
        <div class="fbd-row"><div class="grow"><b>${p.shellName}</b><small>${p.shellSum}</small></div><span class="fbd-tag warn">${p.danger}</span><button class="fbd-btn install" type="button">${p.btnInstall}</button></div>
        <div class="fbd-bar prog fbd-hide"><i></i></div>
      </div>
      <div class="nopath fbd-tag live fbd-hide">${p.noPath}</div>
    </div>
    <div class="fbd-chat">
      <div class="fbd-h"><span class="fbd-dot on"></span>${c.title}</div>
      <div class="fbd-msgs"></div>
    </div>
  </div>
  <div class="fbd-caption"><span></span></div>`
  // clickable controls jump to their step (the shell replays 0..i, so each is safe from any state)
  q(root, '.pair').addEventListener('click', () => root._go?.(1))
  q(root, '.install').addEventListener('click', () => root._go?.(2))
  q(root, '.enable').addEventListener('click', () => root._go?.(3))
  q(root, '.kill').addEventListener('click', () => root._go?.(q(root, '.kill').classList.contains('off') ? 7 : 6))
}

export const steps = [
  { id: 'install', dwell: 3000, run({ root, t, go }) { root._go = go; caption(root, t, 0); q(root, '.ch').classList.add('hot') } },
  { id: 'pair', dwell: 2800, run({ root, t }) {
    caption(root, t, 1)
    hide(q(root, '.setup')); show(q(root, '.dev')); show(q(root, '.killwrap'))
    q(root, '.chdot').classList.add('on'); q(root, '.chtitle').textContent = t.page.channel
    q(root, '.fbd-menubar').classList.add('in'); q(root, '.fbd-menubar .fbd-dot').classList.add('on')
  } },
  { id: 'connector', dwell: 3600, run({ root, t }) {
    caption(root, t, 2)
    q(root, '.ch').classList.remove('hot'); q(root, '.add').classList.add('hot')
    q(root, '.install').disabled = true; q(root, '.install').textContent = t.page.installing
    const bar = q(root, '.prog'); show(bar); requestAnimationFrame(() => { bar.querySelector('i').style.width = '100%' })
    show(q(root, '.inst')); show(q(root, '.nopath'))
  } },
  { id: 'config', dwell: 3600, run({ root, t }) {
    caption(root, t, 3)
    q(root, '.add').classList.remove('hot'); hide(q(root, '.add')); q(root, '.inst').classList.add('hot')
    show(q(root, '.cfg')); q(root, '.root').textContent = t.page.picked
    q(root, '.st').textContent = t.page.running; q(root, '.st').classList.add('live'); q(root, '.state').textContent = t.page.running
    q(root, '.enable').disabled = true
  } },
  { id: 'ask', dwell: 3600, run({ root, t }) {
    caption(root, t, 4); q(root, '.inst').classList.remove('hot')
    bubble(root, 'me', t.chat.q1); bubble(root, 'tool local', `${t.chat.tool1} · ${t.chat.local}`); bubble(root, 'bot', t.chat.a1)
  } },
  { id: 'deny', dwell: 3600, run({ root, t }) {
    caption(root, t, 5)
    bubble(root, 'me', t.chat.q2); bubble(root, 'bot', t.chat.a2)
  } },
  { id: 'kill', dwell: 3600, run({ root, t }) {
    caption(root, t, 6)
    q(root, '.kill').classList.add('off'); q(root, '.chdot').classList.remove('on'); q(root, '.say').textContent = t.page.paused
    q(root, '.fbd-menubar .fbd-dot').classList.remove('on'); q(root, '.ch').classList.add('hot')
    bubble(root, 'me', t.chat.q3); bubble(root, 'bot', t.chat.a3)
  } },
  { id: 'both', dwell: 6000, run({ root, t }) {
    caption(root, t, 7)
    q(root, '.kill').classList.remove('off'); q(root, '.chdot').classList.add('on'); q(root, '.say').textContent = t.page.online
    q(root, '.fbd-menubar .fbd-dot').classList.add('on'); q(root, '.ch').classList.remove('hot')
    bubble(root, 'me', t.chat.q4)
    bubble(root, 'tool local', `${t.chat.tool4a} · ${t.chat.local}`); bubble(root, 'tool', `${t.chat.tool4b} · ${t.chat.cloud}`)
    const a = bubble(root, 'bot', t.chat.a4)
    const rows = t.chat.rows.map((r) => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')
    a.appendChild(el(`<table class="fbd-table"><thead><tr>${t.chat.th.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`))
  } },
]
```

- [ ] **Step 2: Browser walkthrough**

Open `http://127.0.0.1:8931/?lang=zh#demo=hybrid` and let it autoplay all eight steps (≈30 s). Check:
- step 2: green dot + menubar chip appear; step 3: progress bar fills, connector row appears with 「已安装 · 未启用」 and the 「全程没有让你填过任何路径」 tag; step 4: form shows `~/Desktop`, tag becomes 「在跑 · 4 个工具」; steps 5–8: bubbles appear in order; step 7: switch off, dot grey, channel text 「已暂停」; step 8: switch back on, table with three rows.
- Press ← twice: state rewinds correctly (no leftover bubbles). Click the switch at step 8: jumps to step 7.
- Switch language with the top-right button while open: same step, English text.
- `window.__fb.errors` is `[]`. Repeat once at 390 px width (columns stack, panel full-screen).

- [ ] **Step 3: Commit**

```bash
git add js/demos/hybrid.js
git commit -m "feat(demo): hybrid context walkthrough — pair, install, configure, ask, deny, kill switch, local+cloud

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Ship batch 2

**Files:**
- Modify: `js/main.js` (VERSION `2026-09-21b`), `index.html` (`?v=2026-09-21b`), `README.md` (file table: add `js/demo.js`, `js/demo-steps.js`, `js/demos/`, `css/demo.css`; debug param `#demo=hybrid`)

- [ ] **Step 1: Update README file table**

Add rows:

```
| `js/demo.js` / `js/demo-steps.js` / `js/demos/*.js` | 演示浮层壳、步骤机（纯逻辑，有测试）、每章一个前端 mock 演示；`#demo=hybrid` 直达 |
| `css/demo.css` | 演示浮层与产品暗色令牌（`fbd-` 前缀） |
```

- [ ] **Step 2: Test, bump, push**

```bash
npm test 2>&1 | grep -E "^# (pass|fail)"
git add js/main.js index.html README.md
git commit -m "chore: VERSION 2026-09-21b — demo overlay and hybrid demo live

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

---

## Batch 3 (separate plan)

The remaining five demos (`data`, `forecast`, `decide`, `agents`, `trust`) follow the Task 7 + Task 8 pattern each: copy in `demos.<name>` (both tables) → `js/demos/<name>.js` with `mount` + idempotent `steps` → enable the chapter button (remove `disabled`, change `data-i18n` to `demoBtn`) → walkthrough → VERSION → push. They get their own plan once the hybrid demo has been reviewed on the live site.
