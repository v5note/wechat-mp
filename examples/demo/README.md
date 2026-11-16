# examples/demo · 两版四样例（示范产出）

> **说明**：这里的项目「Atlas」与所有数据均为**演示虚构**，仅用于展示本 Skill 的产出形态与图片规范。替换成你的真实主题时，只需改 spec.json 的文案与图片内容。

一次调用产出 **2 个版本 × 2 种格式 = 4 个公众号样例**：

| # | 样例 | 内容 | 入口 |
|---|---|---|---|
| 1 | V1 深色科技版 · 贴图 | 7 张 3:4 卡片 | [v1-dark/cards/](v1-dark/cards/) |
| 2 | V1 深色科技版 · 文章 | **深度长文（1736 字，目录 + 7 节）+ 封面 + 4 张配图** | [v1-dark/article/article.md](v1-dark/article/article.md) |
| 3 | V2 浅色清新版 · 贴图 | 7 张 3:4 卡片 | [v2-light/cards/](v2-light/cards/) |
| 4 | V2 浅色清新版 · 文章 | 长文（876 字）+ 封面 + 3 张配图 | [v2-light/article/article.md](v2-light/article/article.md) |

每个版本文件夹都包含：

    v1-dark/
    ├── cards/        card-01.png … card-07.png   （贴图，1080×1440）
    ├── article/
    │   ├── cover.png           （文章封面 2.35:1，1080×460）
    │   ├── cover-square.png    （文章封面 1:1 方版，1080×1080）
    │   ├── images/fig1..N.png   （正文配图，≥3；V1 为 4 张）
    │   ├── article.md          （Markdown 正文，题图 cover.png 置顶）
    │   └── article.html        （微信可粘贴的内联样式 HTML）
    ├── 文案.md       （标题备选 · 摘要 · 贴图配文 · 逐图文案脚本）
    ├── 发布清单.md   （图片张数 / 顺序 / 图注 / 上传检查）
    ├── index.md      （该版本索引）
    └── *.spec.json   （生成用的内容源，改这里即可复现/迭代）

## 两版的差异

- **V1 深色科技版**：深色卡、代码窗、强调 #4F8CFF，面向开发者，语气硬核讲边界。
- **V2 浅色清新版**：浅色卡、产品截图、强调 #12B76A，面向团队/新人，语气轻快讲场景。

## 复现

    node scripts/build.mjs --spec examples/demo/v1-dark.spec.json  --out examples/demo/v1-dark
    node scripts/build.mjs --spec examples/demo/v2-light.spec.json --out examples/demo/v2-light

## 换成自己的主题

打开 spec.json，改这几处即可：name / brand / titles / summary / imageCaption / cards[].title·body / article.* 。
图片会按同一套规范重新生成。
