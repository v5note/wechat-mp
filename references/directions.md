# 方向提案（可选增强 · directions）

> 这是**可选增强**，不改变核心交付：`SKILL.md` 的 7 步流程不跑本文件也能产出两版四样例。只有在需要先让用户选风格时才用。

目标：**不要只换色。** 三个方向要落在**版式结构、图文关系、语气**上，而不是同一套骨架换主题色。

## 什么时候走

任何新主题、新项目的第一次视觉产出前，100% 走。用户明说「跳过方向，直接出两版」才可豁免，并写进 `方向确认.md`。
同一项目选定方向后的迭代、纯机械改字，不重复走。

## 轻量做法（公众号场景）

不用 huashu-design 的六候选三完整版，用**三个方向卡 + 三张缩略图**：

1. **方向 A · 最佳设计师**：如果预算无限，最适合这个题材的设计师/媒体会怎么做？用他的思维定一版骨架。
2. **方向 B · 现实参照**：找一个同题材、设计出色的真实公众号/杂志/信息图，截图看它的栏目结构、标题字号比、图文关系，拆成规则。
3. **方向 C · 结构反差**：刻意换一种结构（如「一图流」「问答体」「数据卡」「长图叙事」），和前两版拉开。

每个方向交：
- 1 张缩略图（封面或首卡，真标题、真配色）；
- 一句定位（读者、语气、结构）；
- 明确说「这三版不是换色：A 是清单体、B 是图解体、C 是问答体」。

**摆出来就停**，等用户选。不要在没看到视觉前问「你想选哪个」。

## 半自动模式（最推荐）

给一个主题，直接生成 3 套候选配置并渲染：

    node scripts/directions.mjs --topic "Atlas 开源架构图" --project "Atlas" \
      --points "痛点,方法,案例,结论" --out design-demos

它会（主题名单见 [style-catalog](style-catalog.md) 与 [styles](styles.md)）：
1. 从 [scripts/theme-registry.mjs](../scripts/theme-registry.mjs)（读 `assets/tokens.css`，并检查 `assets/style-specimens/` 是否有样张）里挑 3 种结构：清单体（深色 tiles）/ 图解体（浅色 flow）/ 杂志叙事（优先从有样张的 magazine / guofeng / mono / night-cyan 中按题材选）；
2. 生成 `design-demos/directions.json`（可手改后再跑）；
3. 渲染 `A.png / B.png / C.png`、`directions.png`、`方向确认.md`。

可用参数：`--project` / `--brand` / `--logo` / `--column` / `--site` / `--title "第一行,第二行"` / `--sub` / `--points "点1,点2,点3,点4"` / `--themes "dark,light,guofeng"`（强制指定三方向主题）。
这只负责“给候选”，最终选哪个仍由用户决定——半自动，不替用户拍板。

只想生成配置、暂不渲染：`node scripts/directions-plan.mjs --topic "主题" --project "名称" --out directions.json`。

半自动示例产出：[examples/demo/directions-auto/](../examples/demo/directions-auto/)（主题「公众号排版」→ A/B/C 三方向）。

## 脚本化（手动配置）

需要精确控制时，手写配置再渲染：

    node scripts/directions.mjs --config directions.json --out design-demos

`directions.json` 结构：

```json
{
  "project": "Atlas",
  "brand": { "name": "Atlas", "logo": "A", "column": "开源精选" },
  "directions": [
    { "id": "A", "name": "清单体 · 深色科技", "note": "封面→要点→结尾", "theme": "dark",
      "title": ["把仓库","画成一张图"], "accentWord": "一张图", "sub": "一句话读懂项目",
      "hero": { "type": "tiles", "items": [{ "icon": "layers", "t": "分层架构" }] } },
    { "id": "B", "name": "图解体 · 浅色", "theme": "light", "title": ["三分钟","看懂一个项目"],
      "hero": { "type": "flow", "nodes": [{ "num": "1", "t": "粘贴地址" }] } },
    { "id": "C", "name": "杂志叙事", "theme": "magazine", "title": ["一张图","改变交接"],
      "hero": { "type": "browser", "url": "atlas.dev", "ui": "list" } }
  ]
}
```

会生成 `A.png / B.png / C.png`、对照图 `directions.png` 和 `方向确认.md`。完整示例：[examples/demo/directions.json](../examples/demo/directions.json)，产出见 [examples/demo/directions/](../examples/demo/directions/)。

## 方向确认.md（gate 文件）

```md
# 方向确认 · <项目名>

- 方向 A：<一句话> 缩略图：design-demos/A.png
- 方向 B：<一句话> 缩略图：design-demos/B.png
- 方向 C：<一句话> 缩略图：design-demos/C.png
- 用户选择：「<用户原话>」（2026-11-16）
- 选定后产出：V1 / V2 的骨架都基于此方向
```

## 两版怎么拉开

选定方向后，两版可以是：
- 同一方向的深浅两种气质（默认，最省力）；或
- 方向 A + 方向 C 的两种结构（更推荐，避免「只换皮」）。

但**卡片序列不能只是配色不同**：至少一版的卡片顺序/主视觉类型/文体不同。
