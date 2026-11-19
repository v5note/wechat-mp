# templates · 模板说明

七个模板都用同一套 [../assets/tokens.css](../assets/tokens.css) 与 [../assets/icons.svg](../assets/icons.svg)（渲染时由脚本自动注入）。

| 文件 | 用途 | 画布 |
|---|---|---|
| card.html | 贴图单卡外壳（品牌头 / 正文区 / 页脚） | 1080×1440（3:4） |
| article-cover.html | 文章封面 banner | 1080×460（2.35:1） |
| article-cover-square.html | 文章封面 1:1 方版 | 1080×1080 |
| diagram.html | 文章正文配图（架构图 / 流程图 / 对比等） | 宽 1080，高自定 |
| article-body.html | 微信文章内联样式**配方参考**（由 scripts/gen-article-body.mjs 生成） | 流式 |
| video-cover.html | 视频号竖版封面 | 1080×1920（9:16） |
| case-banner.html | README 案例区头图 | 1600×720 |

## card.html 占位符

- BASE_CSS / ICON_SPRITE —— 由脚本注入，不要手改。
- THEME —— t-dark 或 t-light。
- LOGO / BRAND / COLUMN —— 品牌字母块、品牌名、栏目名。
- BADGE —— 右上角徽章 HTML（留空则不显示）。
- MAIN —— 卡片正文区，用 scripts/visuals.mjs 的 buildCard() 生成；也可手写。
- FOOTER_LEFT / PAGE —— 页脚左文案与页码。

## 卡片 variant 与数据（喂给 build.mjs 的 spec.cards[]）

- cover：title[两行]（首行放结果/反常，字号自动降档）/ accent(高亮词) / sub / kicker+kickerPill(标题下方的栏目 pill) / thumbs[{variant,kicker,t,accent,big}]（首屏预览，替代 hero）/ hero（有真截图时用）/ tags[] / prize / cue / badge
- cover.layout（首图版式，来自 references/style-cases 的 8 种骨架）：
  `annotated-illu` / `tool-brief`（accentBg, note, hero, tiles）/ `dev-dark`（hero, points[{t,d}], strip）/
  `color-grid`（formula, cells[{t,d}], strip）/ `bento-stack`（hero, declare）/ `layout-sample`（samples[{src,t}], strip）/
  `diagram-poster`（hero, summary）/ `pin-red`（tiles[{t,d}], points[]）；另有 eyebrow（标题上方的胶囊标签）
  - `tool-brief` 专属字段：`pills[{t,d}]`（底部双 pill，第一个自动实心）+ `note`；主视觉常用 `hero{type:desktop, size:sm, viewH, ui:list|board, nav, list}`
  - `dev-dark` 专属字段：`points[{t,d}]`（2×2 能力格）+ `strip`（底部「先了解：…」边界提醒，自动加前缀）
- point：num / label / title / body / hero
- diagram：kicker / title / accent / hero / caption
- compare：title / left{title,items[]} / right{title,items[]} / caption
- list：kicker / kickerPill / title / body / items[{t,d,icon|num}]
- grid：kicker / title / items[{num,t,desc,fields[{k,v}],tags[]}] / cols / caption
- stat：kicker / title / body / stats[{num,label}] / caption
- quote：quote / accent / author
- ending：title / nexts[{num,t,d}]（下期预告）/ points[] / cta / ctaKicker / qr（传 `{url,label,logoText}` 生成**真实二维码**，`true` 只是占位）
- **phone**：kicker / title / sub / points[] / hero{type:phone} / tags / layout(split 或 stack)
- **desktop**：kicker / title / body / hero{type:desktop} / caption
- **bento**：kicker / title / body / items[{t,d,icon,num,tags,span,tall,tone}] / cols / caption
- **flowchart**：kicker / title / hero{type:flowchart} / caption
- **promo**：promoBadge / title / accent / sub / hero{type:promo} / points[] / cta / qr

## hero 视觉类型（hero.type）

- browser：url + ui（dashboard | list | board）
- code：file + lines（字符串或 {text, cls: cm|ck|cs|cv}）
- flow：nodes[{num,t,d}] + vertical(true/false)
- steps：nodes[{num,t,d}]（编号横向步骤）
- stack：layers[{name,items[]}]
- tiles：items[{icon,t}]
- ring：center(icon) + sides[{icon,t}]
- matrix：items[{num,t,desc,fields[{k,v}],tags[]}] + cols
- checklist：items[字符串 或 {t,b,d}]
- kv：rows[{k,v}]（技术栈/参数表）
- stats：items[{num,label}]（数据大字）
- blist：items[{t,d,icon|num}]（要点列表）
- compare：left{title,items[]} + right{title,items[]}（正文配图用对比块）
- **phone**：screen(chat|feed|app) + name / messages[{from,text,card}] / items / stats
- **desktop**：app + ui(dashboard|board|editor) + nav / tabs / stats / dock
- **bento**：items[{t,d,icon,num,tags,span,tall,tone}] + cols
- **flowchart**：start + steps[{t,d}] + decision{q,yes,no} + end + yesLabel/noLabel
- **promo**：device(phone|desktop) + src（真实截图）+ tags + price + priceNote
- **coverthumb**：src（本地图片路径）——视频号封面里把首图缩成构图帧，保证首帧与贴图首图一致

图标名见 [../assets/icons/README.md](../assets/icons/README.md)。

## 新增一种卡片

1. 在 scripts/visuals.mjs 加一个 buildXxx(card) 返回 HTML 片段。
2. 在 buildCard() 里注册 variant。
3. 在 references/image-design-system.md 的第 4 节补上原型规格。
4. 遵守安全区 72px、字号阶、单一强调色。
