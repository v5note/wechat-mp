# 主题与风格（styles / theme）

> 主题只决定**视觉令牌**（底/面/字/强调/纹理）；风格 = 主题 + 版面骨架 + 语气，见 [style-catalog](style-catalog.md)。

当前内置 **15 套主题**（`assets/tokens.css`）：基础两套 + 12 套扩展。要加新主题，**只改令牌，不改组件**。

## 主题清单

| 主题 | 气质 | bg | accent | 样张 |
|---|---|---|---|---|
| dark | 深色科技（基线 V1） | `#0B1020` | `#4F8CFF` | [sheet-dark.png](../assets/style-specimens/sheet-dark.png) |
| light | 浅色清新（基线 V2） | `#FFFFFF` | `#2563EB` | [sheet-light.png](../assets/style-specimens/sheet-light.png) |
| magazine | 杂志米色 | `#F7F3EC` | `#B4472F` | [sheet-magazine.png](../assets/style-specimens/sheet-magazine.png) |
| guofeng | 国风墨朱 | `#1B1712` | `#B23A2E` | [sheet-guofeng.png](../assets/style-specimens/sheet-guofeng.png) |
| mono | 极简黑白 | `#FFFFFF` | `#111111` | [sheet-mono.png](../assets/style-specimens/sheet-mono.png) |
| night-cyan | 深底青 | `#0A0F14` | `#2FD6C4` | [sheet-night-cyan.png](../assets/style-specimens/sheet-night-cyan.png) |
| aurora | 浅蓝工具推荐 | `#EAF2FF` | `#3D5BF5` | [sheet-aurora.png](../assets/style-specimens/sheet-aurora.png) |
| forest | 深绿开源项目 | `#0A2620` | `#34D399` | [sheet-forest.png](../assets/style-specimens/sheet-forest.png) |
| ocean | 深蓝工具发布 | `#081B36` | `#38BDF8` | [sheet-ocean.png](../assets/style-specimens/sheet-ocean.png) |
| cream | 米色架构图解 | `#F7F1E3` | `#C0472F` | [sheet-cream.png](../assets/style-specimens/sheet-cream.png) |
| cyber | 暗黑霓虹合集 | `#05080F` | `#2DE2E6` | [sheet-cyber.png](../assets/style-specimens/sheet-cyber.png) |
| sky | 亮蓝清单干货 | `#E8F2FF` | `#1B6BFF` | [sheet-sky.png](../assets/style-specimens/sheet-sky.png) |
| rose | 浅红新开源 | `#FBECEE` | `#E11D48` | [sheet-rose.png](../assets/style-specimens/sheet-rose.png) |
| midnight | 深紫夜 | `#12102E` | `#8B7CFF` | [sheet-midnight.png](../assets/style-specimens/sheet-midnight.png) |
| baize | 白泽品牌紫 | `#F4F2FF` | `#6255D7` | [sheet-baize.png](../assets/style-specimens/sheet-baize.png) |

![主题样张总览](../assets/style-specimens/overview.png)

样张由 `node scripts/gen-specimens.mjs` 用真实渲染管线生成，不是色块示意。

## 加一套主题

1. 在 [../assets/tokens.css](../assets/tokens.css) 增加 `.t-<name>{ --bg1/--bg2/--bg3/--surface/--border/--text/--text-2/--text-3/--accent/--accent-2/... }`。
2. 需要专属纹理时补 `.t-<name> .card .bg{...}`；浅色主题补 mock 覆盖。
3. 在 [../scripts/gen-specimens.mjs](../scripts/gen-specimens.mjs) 的 `themes` 里加一行，跑 `node scripts/gen-specimens.mjs`。
4. 在 [style-catalog](style-catalog.md) 与上表登记。

## 规矩

- 正文对比度 ≥4.5:1，标签 ≥3:1。
- 一个方向只用一套强调色；别把两套主题的色混在一个版里。
- 加主题不是换皮：风格仍要求**结构不同**（见 [style-catalog](style-catalog.md) 与 [directions](directions.md)）。
