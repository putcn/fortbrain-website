# Fortbrain 官网

一页视差滚动站：3D 徐州地图做背景，开场提问，六个特点各特写一个方块，结尾回到全景并有极光倾泻，中英双语，手机可用。
纯静态，无构建步骤，GitHub Pages 部署（`CNAME` → fortbrain.ai）。

- 设计：`docs/superpowers/specs/2026-09-15-scroll-story-site-design.md`
- 计划：`docs/superpowers/plans/2026-09-15-scroll-story-site.md`

## 本地预览

```bash
python3 -m http.server 8931 --bind 127.0.0.1     # 任意静态服务器都行；直接双击 index.html 不行（ES module 需要 http）
open http://127.0.0.1:8931/
```

调试参数：`?lang=zh|en` 强制语言；`?nogl=1` 强制走 canvas 2D 极光降级层。控制台 `window.__fb` 有 view / story / errors。

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
| `js/layers.js` | 界面拆解段的 CSS 3D 飞入 / 停留 / 飞出 |
| `js/story.js` | 滚动进度 → 段号与段内进度；段落淡入 |
| `js/i18n.js` | 中英文案表 |
| `js/geo.js` | 投影、落位、特写方块挑选（纯函数，有测试） |
| `js/fallback.js` | WebGL 不可用时的 canvas 2D 极光幕 |
