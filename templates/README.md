# templates · 模板说明

五个模板都用同一套 [../assets/tokens.css](../assets/tokens.css) 与 [../assets/icons.svg](../assets/icons.svg)（渲染时由脚本自动注入）。

| 文件 | 用途 | 画布 |
|---|---|---|
| card.html | 贴图单卡外壳（品牌头 / 正文区 / 页脚） | 1080×1440（3:4） |
| article-cover.html | 文章封面 banner | 1080×460（2.35:1） |
| article-cover-square.html | 文章封面 1:1 方版 | 1080×1080 |
| diagram.html | 文章正文配图（架构图 / 流程图 / 对比等） | 宽 1080，高自定 |
| article-body.html | 微信文章内联样式**配方参考**（由 scripts/gen-article-body.mjs 生成） | 流式 |

## card.html 占位符

- BASE_CSS / ICON_SPRITE —— 由脚本注入，不要手改。
- THEME —— t-dark 或 t-light。
- LOGO / BRAND / COLUMN —— 品牌字母块、品牌名、栏目名。
- BADGE —— 右上角徽章 HTML（留空则不显示）。
- MAIN —— 卡片正文区，用 scripts/visuals.mjs 的 buildCard() 生成；也可手写。
- FOOTER_LEFT / PAGE —— 页脚左文案与页码。

## 卡片 variant 与数据（喂给 build.mjs 的 spec.cards[]）

- cover：kicker / title[两行] / accent(高亮词) / sub / hero / tags[] / badge
- point：num / label / title / body / hero
- diagram：kicker / title / accent / hero / caption
- compare：title / left{title,items[]} / right{title,items[]} / caption
- ending：title / points[] / cta / ctaKicker / qr

## hero 视觉类型（hero.type）

- browser：url + ui（dashboard | list | board）
- code：file + lines（字符串或 {text, cls: cm|ck|cs|cv}）
- flow：nodes[{num,t,d}] + vertical(true/false)
- stack：layers[{name,items[]}]
- tiles：items[{icon,t}]
- ring：center(icon) + sides[{icon,t}]

图标名见 [../assets/icons/README.md](../assets/icons/README.md)。

## 新增一种卡片

1. 在 scripts/visuals.mjs 加一个 buildXxx(card) 返回 HTML 片段。
2. 在 buildCard() 里注册 variant。
3. 在 references/image-design-system.md 的第 4 节补上原型规格。
4. 遵守安全区 72px、字号阶、单一强调色。
