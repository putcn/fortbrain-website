---
title: ThreeDUI 开源：让业务界面真正进入 3D 空间
date: 2026-10-21
tags: concept, tech
summary: 从可输入的玻璃注册表单，到六视图业务工作空间：ThreeDUI 用 Vue 组件组织真实的 3D 界面，让图表、地图和仓储场景与日常操作共享空间。
concept: glassui-spatial
---

我们已经把 [ThreeDUI 开源](https://github.com/putcn/ThreeDUI)。它要解决的问题并不是把仓库做成尽可能逼真的数字孪生，而是让开发者像写 Vue 界面一样，把常用的控件、表单和业务视图放进三维空间。新增的深度应该帮助人理解数据之间的关系、找到当前操作的位置，而不只是给平面卡片加一点透视。

从[双语演示导航](/concepts/glassui-demos/)可以进入[可输入的注册表单](/concepts/glassui-signup/)、[六视图综合演示](/concepts/glassui-spatial/)和[组件 Gallery](/concepts/glassui-gallery/)。注册表单和 Gallery 都支持左键拖动平移、右键拖动旋转、滚轮缩放；点击输入框可以打字。Gallery 底部固定的分区导航会把相机重新对准对应的 Vue 控件组。六视图演示从已预填的示例登录开始，进入后可平移、旋转和缩放由订单、Dashboard、网络地图、仓储孪生、库存和设置组成的空间工作区。导航页与 Gallery 可切换中英文，语言会随链接保留。所有演示都使用示例数据，不连接线上业务服务。

## 为什么需要第三个维度

传统网页擅长排版，却常常要把位置、层级和关联压成标签页与弹窗。ThreeDUI 的 `Space` 与 `Block` 让视图占据可理解的位置；聚焦一个视图时，镜头移动、邻近视图与场景内容仍然保留上下文。在仓储演示里，列表、路线、地图和库位模型是连续的工作流程，而不是六张互不相干的 2D 页面。

这也给玻璃材质一个合理的用途。控件有真实几何、光照和投影；玻璃的透明度与层叠关系可以表达可操作对象与背景数据之间的距离。注册表单是这个设计语言的基础样张，综合演示则检验它能否承载实际业务密度。

## 开发者如何使用

仓库提供 Vue 组件、布局与事件系统、文字输入和输入法支持、组件示例、完整演示、[文档](https://github.com/putcn/ThreeDUI/tree/main/docs)以及供 coding agent 参考的 [skill](https://github.com/putcn/ThreeDUI/blob/main/.agents/skills/build-glassui/SKILL.md)。`Surface` 定义界面所在层，`Space` 管理空间工作区，`Block` 组织可聚焦的业务视图。现阶段是仓库内的 pnpm workspace 包，尚未发布 npm 正式版本；可以克隆仓库运行演示，并在 workspace 中试用组件。

我们会继续打磨性能、交互与视觉一致性。真正的检验标准不是某一张截图，而是开发者能否快速搭建、用户能否在有深度的界面里完成日常工作。
