---
title: ThreeDUI is open source: everyday interfaces in real 3D
date: 2026-10-21
tags: concept, tech
summary: From an editable glass sign-up form to a six-view workspace, ThreeDUI uses Vue components to put everyday controls, charts, maps and warehouse content in one 3D scene.
concept: glassui-spatial
---

[ThreeDUI is now open source](https://github.com/putcn/ThreeDUI). Our goal is not the most photorealistic warehouse twin. It is to let developers build everyday interfaces in three-dimensional space with a workflow that feels like writing Vue. Depth should make relationships between data and actions easier to understand, rather than merely tilt a collection of flat cards.

The [bilingual demo index](/concepts/glassui-demos/) leads to an [editable sign-up form](/concepts/glassui-signup/), a [six-view application](/concepts/glassui-spatial/) and the [component gallery](/concepts/glassui-gallery/). In the form and gallery, left-drag to pan, right-drag to rotate, and scroll to zoom; click a field to type. The gallery's section buttons reframe the camera around each group of live Vue controls. The application brings orders, dashboard, network map, warehouse twin, inventory and settings into one workspace. Move from the overview into a view while charts, maps and scene content keep their spatial context. The index and gallery switch between Chinese and English, and carry the choice through their links. All examples use sample data and connect to no live business service.

## What the third dimension adds

Conventional web pages are excellent at layout, but often squeeze position, hierarchy and relationships into tabs and modal dialogs. ThreeDUI's `Space` and `Block` give views understandable positions. When a view receives focus, the camera moves while its neighbours and the shared scene preserve context. In the warehouse example, lists, routes, maps and locations form a connected workflow rather than six unrelated pages.

Glass also has a job to do here. Controls have real geometry, lighting and shadows. Transparency and layering can express the distance between an actionable surface and the data behind it. The sign-up form establishes the visual language; the full application tests whether it can carry realistic business density.

## Building with it

The repository includes Vue components, layout and events, text entry and IME support, component examples, a complete demo, [documentation](https://github.com/putcn/ThreeDUI/tree/main/docs), and an [agent skill](https://github.com/putcn/ThreeDUI/blob/main/.agents/skills/build-glassui/SKILL.md). `Surface` places an interface layer, `Space` manages a workspace, and `Block` groups a focusable view. These are currently pnpm workspace packages in the repository; no stable npm release has been published yet. Clone the repository to run the demos and try the components within the workspace.

We will keep refining performance, interaction and visual consistency. The real test is whether developers can build quickly and people can finish ordinary tasks in an interface with depth.
