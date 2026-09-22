# Fortbrain 官网

一页视差滚动站：3D 徐州地图做背景，开场提问，六章各特写一个方块（每章一个前端 mock 演示），结尾回到全景并有极光倾泻，中英双语，手机可用。
纯静态，无构建步骤，GitHub Pages 部署（`CNAME` → fortbrain.ai）。Three.js 0.160 自托管在 `vendor/three/`（国内访问不依赖 CDN）。

- 设计：`docs/superpowers/specs/2026-09-15-scroll-story-site-design.md`
- 计划：`docs/superpowers/plans/2026-09-15-scroll-story-site.md`

## 本地预览

```bash
python3 scripts/serve.py        # 127.0.0.1:8931，带 no-store 头（普通 http.server 会让浏览器缓存旧的 scene.js）
open http://127.0.0.1:8931/
```

直接双击 `index.html` 不行（ES module 需要 http）。每次部署前把 `js/main.js` 里的 `VERSION` 改一下，场景模块按版本号缓存。

调试参数：`?lang=zh|en` 强制语言；`?nogl=1` 强制走 canvas 2D 极光降级层。`#demo=hybrid` 直接打开某个演示。控制台 `window.__fb` 有 view / story / demos / errors。

## 测试

```bash
npm test        # node --test tests/*.test.mjs（地理算术、滚动分段、文案表）
```

## 重生成底图

底图来自 Fortbrain 大屏的徐州 GeoJSON（区县 + 主干道 + 水系），简化后打包在 `data/xuzhou.json`：

```bash
python3 scripts/build-geo.py     # 读 ~/Fortbrain/packs/mxipos/app/geo/320300.json，可用 FB_GEO 环境变量改路径
```

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` / `css/site.css` | 页面骨架、十段文字、界面拆解三层的 HTML、响应式 |
| `js/main.js` | 启动：语言、联系邮箱拼接、WebGL 检测、渲染循环 |
| `js/scene.js` | Three.js 场景：底图、方块、七个特写状态、极光、滚动驱动的镜头 |
| `js/demo.js` / `js/demo-steps.js` / `js/demos/*.js` | 演示浮层壳、步骤机（纯逻辑，有测试）、每章一个前端 mock 演示；`#demo=hybrid` 直达 |
| `css/demo.css` | 演示浮层与产品暗色令牌（`fbd-` 前缀） |
| `js/layers.js` | 界面拆解段的 CSS 3D 飞入 / 停留 / 飞出 |
| `js/story.js` | 滚动进度 → 段号与段内进度；段落淡入 |
| `js/i18n.js` | 中英文案表 |
| `js/geo.js` | 投影、落位、特写方块挑选（纯函数，有测试） |
| `js/fallback.js` | WebGL 不可用时的 canvas 2D 极光幕 |
