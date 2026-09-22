# 六章重组 + 前端 mock 演示 + 端云同境 · 设计

- 日期：2026-09-21
- 状态：待用户评审
- 上位设计：`2026-09-15-scroll-story-site-design.md`（滚动叙事站）
- 参考：`~/Fortbrain/docs/superpowers/specs/2026-09-20-hybrid-context-suite-design.md`（端云同境套件）、
  `~/Fortbrain/docs/design/ui-standard.md`（产品 UI 标准，demo 配色取其暗色令牌）

> 一句话：页面从 12 段 24 屏缩成 10 段 17 屏；八个点合并成六章，新增「端云同境」一章；
> 每章一个「查看演示」按钮，打开纯前端 mock 的产品演示（不是视频，不是截图）。

---

## 1. 目标与非目标

### 目标

1. **短**：首屏之后不再有「滚很久没变化」的段落。每章 1.5 屏，只留一句标题、一两句正文、一个按钮。
2. **深**：细节进 demo。每个 demo 是可播放、可点的 HTML 状态机，看起来就是 Fortbrain 本身。
3. **新**：讲清端云同境——本地的留在本地，助理照样干活。
4. 中英双语、手机可用、纯静态、部署方式不变，这些都不变。

### 非目标

- demo 不接真实后端，不出现客户名，不做自由输入（输入框是演示用的固定文本）。
- 不做多页；demo 是本页上的浮层，关掉回到原位。
- 被合并的三个方块动画（库存罐 C、拼装 G、自愈 J）不删，留作地图上的氛围。

---

## 2. 已定决策（与用户确认，2026-09-21）

| 决策 | 结论 |
|---|---|
| 段落 | 八个点合并成六章（§3），新增端云同境为第 05 章 |
| 每章高度 | 1.5 屏；开场 1、目标 2、工作台 3、结尾 2；合计 17 屏 |
| demo 交互 | 自动播放 + 上一步 / 下一步 + 可直接点界面元素推进；不做完全自由操作 |
| demo 配色 | 产品 UI 标准的**暗色**令牌，融进官网的深色底 |
| 同境的 3D 方块 | 新方块 K：旁边一块发光小板（员工电脑），单向光点电脑 → 方块（只出站），周期性变灰再恢复（总闸） |
| 文案 | §4，用户逐条改定 |

---

## 3. 段落结构

| # | 段 | 屏 | 镜头 | 方块 / 画面 |
|---|---|---|---|---|
| 0 | 开场提问 | 1 | 全景，az 0（手机 +π/2） | — |
| 1 | 目标 | 2 | 全景稍低 | — |
| 2 | 一个工作台 | 3 | 拉远压暗 | HTML 三层拆解（不变） |
| 3 | 01 数据自己进来，AI 自己盯 | 1.5 | B 特写 | 金色销量方块 + 涟漪（原 01） |
| 4 | 02 该补多少，引擎算 | 1.5 | H 特写 | 预测幽灵方块（原 03） |
| 5 | 03 人只做决定 | 1.5 | A 特写 | 决定卡片循环（原 05） |
| 6 | 04 助理之间自己问 | 1.5 | E / F 中点 | 双方块光点（原 06） |
| 7 | 05 端云同境 | 1.5 | K 特写 | **新**：电脑小板 + 单向光束 + 拉闸变灰 |
| 8 | 06 值得企业信赖 | 1.5 | D 特写 | 记账台（原 04） |
| 9 | 结尾 | 2 | 升空 + 极光 | 不变 |

- `story.js`：`STAGES = [1, 2, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2]`，`HOLD` 首屏 0.2，其余 0.5 不变。
  1.5 屏的段：sticky 文案钉 0.5 屏后随页面滚出，镜头在段内过半开始飞向下一章。
- CSS：新增 `section.s-chapter { min-height: 150svh }`；开场 100、工作台 300、其余 200 不变。
- `pickFeatured(stores, 8)` 不变，第 8 个方块从 J 改名 K 并换动画（§6）；C、G 的动画代码保留不动，J 的自愈动画删除（被 K 取代）。
- 手机端开场与结尾方位角 +π/2 的规则不变。

---

## 4. 文案（以 `js/i18n.js` 为准；这里是评审稿）

开场、目标、「谈笑间灰飞烟灭」、结尾四段**不变**。

### 中文

| 章 | 标签 | 标题 | 正文 |
|---|---|---|---|
| 01 | 01 · 数据自己进来，AI 自己盯 | 不出户，知天下 | 每一笔成交、每一次采集都是一个事件，自己流进来；报表到点自己写好，推到你手上。AI 7×24 盯着每一家店、每一个 SKU，异常第一时间找到该知道的人。 |
| 02 | 02 · 该补多少，引擎算 | 人算不如天算，天算不如 Fortbrain 算 | 预测引擎看到每一个 SKU、每一家店，给出最直接、最不绕弯子的决定：调多少货、什么时候补、补多少，每一个动作都瞄准实操层面的精准高效。 |
| 03 | 03 · 人只做决定 | 运筹帷幄之中，决胜千里之外 | 业务事件先分诊，助理把决定送到你面前。一句「同意」，调拨单、日历、系统写回，它自己去办。打扰有预算，助理不会变成噪音；越用越懂你。 |
| 04 | 04 · 助理之间自己问 | 不召而至，不谋而合 | 你的助理可以主动和其他部门的助理讨论，委托子任务，直接查另一个部门的知识库。少开一个会，少跑一趟腿。四道防风暴机制，只办正事，不聊闲篇。 |
| 05 | 05 · 端云同境 | 各守其界，各通其心 | 企业数据不出企业，个人数据不出你的电脑；端云同境让两个次元融合协作。从你本机找个供应商列表的 Excel，再查 Fortbrain 里他们的采购价格——没问题，一句话的事。 |
| 06 | 06 · 值得企业信赖 | 万象各归其位，来处去向皆有迹可循 | 每一次调用、每一笔 token 都记录在案，可查、可审、可回放，授权到人，撤销即失效。POS、爬虫、外部系统按 Addon 协议接入，核心零改动、不停业。出了问题它自己查文档、翻日志、自己修，不解决不罢休，IT 只需要盯真正难的事。 |

每章按钮：「查看演示」。

### English

| Ch. | Label | Title | Body |
|---|---|---|---|
| 01 | 01 · Data comes in by itself; the AI keeps watch | Know the whole world without stepping out the door | Every sale and every collection run is an event that flows in on its own; reports write themselves on schedule and land in your hands. The AI watches every store and every SKU around the clock, and the moment something is off it reaches the person who needs to know. |
| 02 | 02 · How much to reorder: the engine works it out | People guess, fate decides, Fortbrain calculates. | The forecast engine sees down to every SKU and every store and gives the most direct, no-detour decision: how much to move, when to reorder, how much to order. Every action aims at precision and efficiency on the shop floor. |
| 03 | 03 · People only decide | Decide at your desk; win a thousand miles away | Business events are triaged first, and the assistant brings the decision to you. Say “approve” and the transfer, the calendar entry and the system write-back get done on their own. Interruptions have a budget, so it never becomes noise, and it knows you better the more you use it. |
| 04 | 04 · Assistants ask each other | They come uncalled and agree unplanned | Your assistant can open a discussion with another department’s assistant, delegate a subtask, and query that department’s knowledge base directly. One meeting fewer, one errand fewer. Four storm guards keep them on real work, not idle chatter. |
| 05 | 05 · Hybrid Context | Each keeps its bounds; each knows the other’s mind | Company data never leaves the company; personal data never leaves your own computer. Hybrid Context lets the two worlds work as one. Find a supplier list in an Excel file on your machine, then look up their purchase prices inside Fortbrain: no problem, one sentence does it. |
| 06 | 06 · Worthy of a company’s trust | Everything in its place, every trail on record | Every call and every token spent is on record: searchable, auditable, replayable, granted per person and gone the moment it is revoked. POS, crawlers and external systems attach through the Addon protocol with zero changes to the core and no downtime. When something breaks it reads the docs, digs through the logs and repairs itself, and doesn’t let go until it’s solved. IT only has to look at the genuinely hard problems. |

Button: “See it in action”.

---

## 5. Demo 框架

### 5.1 形状

```
index.html        每章 .copy 里一个 <button class="demo-btn" data-demo="hybrid">
                  页尾一个 <div id="demo" hidden> 浮层壳：顶栏（标题 · 步骤 x/n · ×）、舞台、底栏（上一步 · 播放/暂停 · 下一步）
css/demo.css      浮层 + 产品暗色令牌（--fb-* 子集）+ 六个 demo 共用的组件类（卡、行、标、按钮、气泡、表单、进度）
js/demo.js        浮层控制 + 步骤机；对外 open(name, lang) / close()
js/demos/<name>.js 每个 demo 一个模块：export { title, steps, mount(root, t) }；纯 DOM，无框架
js/i18n.js        demo 文案挂在 TEXTS.<lang>.demos.<name>，同一张表，同一个 applyLang
```

- **打开**：按钮 click → `demo.open(name)`：动态 `import('./demos/<name>.js?v=VERSION')`，`mount()` 渲染舞台，
  `location.hash = '#demo=<name>'`，`document.body.classList.add('demo-open')`（锁滚动：`overflow: hidden`，
  记下 scrollY），场景 `view.pause()`（停 rAF 内的 tick，画布留最后一帧）。
- **关闭**：× / Esc / 点遮罩 / 浏览器后退（`hashchange` 到空）→ 卸载舞台、恢复 scrollY、`view.resume()`、清 hash。
- **直达**：加载时 hash 是 `#demo=<name>` 就直接打开（分享链接用）。
- **步骤机**：`steps` 是数组，每项 `{ id, run(ctx), dwell }`。`run` 改 DOM（加类、换文字、插入气泡），
  `dwell` 是自动播放停留毫秒。自动播放默认开，用户点了任何一步就停自动，按「播放」再续。
  `ctx` 提供 `t`（当前语言文案）、`root`、`go(i)`；界面上可点的元素（安装、启用、总闸…）直接调 `go()` 跳到对应步骤。
  往回走 = 从第 0 步重新 mount 再快进到第 i 步（每步幂等，不必写逆操作）。
- **语言切换**：浮层打开时切语言 → 同样重新 mount 并快进到当前步骤。
- **降噪**：`prefers-reduced-motion` 下过渡时长 0，自动播放关。

### 5.2 视觉

- 浮层：全屏遮罩 `rgba(5,11,24,.72)` + `backdrop-filter: blur(14px)`；舞台是一块玻璃卡，
  桌面最大 1100 × 720，居中；手机全屏，顶栏底栏固定，舞台内部纵向滚动。
- 舞台内部用产品 UI 标准的暗色令牌（只取用到的：`--fb-bg #14171c`、`--fb-ink #f3f4f6`、`--fb-ink-3 #9ca3af`、
  `--fb-line rgba(255,255,255,.06)`、`--fb-live #4ade80`、`--fb-bad #f87171`、`--fb-warn #fbbf24`、
  `--fb-card rgba(255,255,255,.07)`、`--fb-bubble-me #0a84ff`），命名加 `fbd-` 前缀避免和站内样式撞。
- 状态变化一律 250–400ms 缓动；正在发生的一步用 `--fb-glow` 光晕点一下，让人知道看哪里。
- 桌面上舞台按需分左右两栏（页面 / 助理对话），手机上下堆叠。

### 5.3 六个 demo 的脚本

按上线顺序。第一批只做 **hybrid**，其余按钮先显示「演示即将上线」并禁用。

**hybrid · 端云同境**（照套件设计 §13 验收单缩编；左栏是「端云同境 → 本地桥接」页，右栏是私人助理）

1. 页面：通道卡灰点「还没有配对的电脑」，一条复制即用的安装命令。
2. 「确认配对」→ 绿点，设备名「开发机 · 桥接 0.1.0」，菜单栏图标出现（顶栏画一个小 🔷）。
3. 「可以添加」里的「本地命令」点安装 → 进度 0→100% → 「已安装 · 未启用」。旁注：全程没填过路径。
4. 展开配置表单，「授权目录」点浏览 → 选 ~/Desktop（本机弹框示意）→ 保存 → 「启用」→ 「在跑 · 4 个工具」。
5. 右栏：问「我桌面上有什么」→ 显示一行工具调用 `shell.list_dir` → 助理列出三个文件名（演示数据）。
6. 问「把 /etc/hosts 读出来」→ 助理：只能在授权目录里，没有重试。
7. 左栏按总闸 → 通道卡变灰「已暂停」→ 右栏再问 → 「用户暂停了这台电脑，现在读不到任何本地内容」。
8. 恢复 → 再问「供应商列表.xlsx 里有哪些供应商，Fortbrain 里他们的采购价是多少」→ 两行工具调用
   （`shell.read_file` 本机 + `retail.purchase_prices` 平台）→ 一张三行小表。这一步对应本章正文那句话。

**data · 01 数据自己进来，AI 自己盯**：事件流一条条进来（POS 成交、采集完成）→ 「日报已生成」推送卡 →
一条库存异常告警找到「门店 07 店长」。

**forecast · 02 该补多少**：一个 SKU 的近 14 天销量小条图 → 预测段生长 → 建议卡「从总仓调拨 120 件，今晚发出」。

**decide · 03 人只做决定**：复用工作台那段对话：决定卡 → 点「同意」→ 三个结果依次亮起（调拨单 / 日历 / 系统写回）。

**agents · 04 助理之间自己问**：两个助理头像，一问一答三轮，第四轮触发防风暴「已到本轮预算，交回给人」。

**trust · 06 值得企业信赖**：审计表逐行出现（时间 · 工具 · 毫秒 · token）→ Addon 接入示意（三个外部系统卡插进核心）→
自诊断对话「XX 模块不工作」→ 查文档 → 翻日志 → 修好。

---

## 6. 场景改动（`js/scene.js`）

- 方块 K（原 J 的位置）：删除自愈动画（ring、颜色循环），新建：
  - 一块 `SQ*1.4 × 0.12 × SQ*0.9` 的发光薄板（员工电脑）放在 K 的 `K_AZ` 屏幕右侧约 `SQ*2.6` 处，
    边线青色，顶面一层淡光；
  - 一条从薄板到方块的弧线（复用 E↔F 的 `QuadraticBezierCurve3` 做法），6 个光点**只从薄板流向方块**；
  - 周期 9 秒：0–0.6 正常（绿边，光点流动）；0.6–0.8 拉闸（边线变灰，光点停住淡出，方块微暗）；
    0.8–1 恢复（一圈绿色涟漪，光点重新流动）。
- 镜头关键帧按 §3 重排为 10 项；K 的关键帧 `dist 25, pol 1.05, az K_AZ`。
- `view.pause() / resume()`：`main.js` 的 rAF 循环里加一个标志；暂停时不调 `tick`。

---

## 7. 文件

| 文件 | 改动 |
|---|---|
| `index.html` | 段落重排为 10 段；每章加按钮；页尾加 `#demo` 壳；引入 `css/demo.css` |
| `css/site.css` | `.s-chapter` 150svh；`.demo-btn` 样式；`body.demo-open` 锁滚动 |
| `css/demo.css` | 新增 |
| `js/story.js` | `STAGES` 10 项 |
| `js/i18n.js` | 六章文案中英；`demos.hybrid` 文案中英；按钮文案 |
| `js/scene.js` | 关键帧重排；J → K 动画 |
| `js/demo.js`、`js/demos/hybrid.js` | 新增 |
| `js/main.js` | 绑按钮、hash 直达、pause/resume；VERSION |
| `tests/story.test.mjs` | 10 段、新的段起点 |
| `tests/demo.test.mjs` | 新增：步骤机纯逻辑（前进 / 后退 / 快进 / 自动播放停止） |
| `tests/i18n.test.mjs` | 键对齐测试自动覆盖 demos |

---

## 8. 验证

- `npm test`：段表、步骤机、文案键对齐。
- 本地预览：桌面 1440 宽与手机 390 宽各走一遍：17 屏总高；每章按钮可点；hybrid 八步自动播完；
  Esc 关闭回到原滚动位置；`#demo=hybrid` 直达；切语言不丢步骤。
- 手机上打开 demo 时 3D 停渲染（`view.pause()` 生效）。

## 9. 分批上线

1. 段落重组 + 文案 + 方块 K + 镜头（无 demo，按钮先隐藏）。
2. demo 框架 + hybrid demo，按钮上线（其余五章「即将上线」）。
3. 其余五个 demo，按 01 → 06 顺序，每做完一个推一次。
