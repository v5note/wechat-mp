---
name: wechat-mp
description: 微信公众号内容生产（贴图 + 文章）。当用户要把一个主题、项目、教程或复盘做成公众号内容，说「写公众号」「做个贴图」「生成公众号文章」「按某篇公众号的风格出一版」「出一套公众号样例」，或给定主题后要标题备选 / 摘要 / 正文 / 配图 / 发布清单时使用。默认交付 2 个版本（深色科技版、浅色清新版），每版含「贴图套图」与「文章」两种格式，共 4 个公众号样例；配图用 HTML 模板 + 无头 Chrome 统一渲染成 PNG，规格受控。
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# 微信公众号内容工坊（wechat-mp）

把一个主题做成**能直接发**的公众号内容：**贴图套图 + 长文**，两个版本，共四个样例。
所有配图走同一套**图片设计规范**，所有长文走同一套**文章格式规范**——风格稳定、可复现，不靠临场发挥。

## 输出契约（先记住交付什么）

一次调用默认产出 **2 个版本 × 2 种格式 = 4 个公众号样例**：

| 版本 | 贴图（图片消息 / 小绿书） | 文章（图文消息长文） |
|---|---|---|
| V1 深色科技版 | 5–9 张 3:4 卡片图 + 逐图文案 | 长文 + 封面 + 3–5 张正文配图 |
| V2 浅色清新版 | 5–9 张 3:4 卡片图 + 逐图文案 | 长文 + 封面 + 3–5 张正文配图 |

每个样例都要带齐这四件套：

1. **标题备选**：文章 3–5 条、贴图 2–3 条（≤20 字），标注推荐项。
2. **摘要**：文章摘要 ≤54 字（微信分享卡片上限），贴图写一段 ≤100 字的配文。
3. **正文**：文章给 **Markdown 正文**；贴图给**逐图文案脚本**（每张卡的文字、层级、落点）。
4. **配图 / 发布清单**：图注（图1、图2…）、图片规格、以及按 [publish-checklist](references/publish-checklist.md) 生成的发布清单。

两版共用同一主题与同一份事实，只换**视觉主题与语气**，便于用户 A/B 选型。

## 输入

先收集（缺的用合理默认并在 Brief 里写明假设，不要停下来反复追问）：

- **主题 / 项目名 / 一句话定位**（必填）
- **3–6 个卖点或干货点**（没有就从主题推演，标为「待确认」）
- **目标读者**（开发者 / 产品运营 / 泛技术爱好者）
- **品牌色、logo 文字、栏目名**（可选；缺省用主题预设色）
- **版本偏好**（默认两版都出）

## 工作流程

### 第 1 步 · 立项卡（Brief）
把输入收敛成一页 Brief：主题、读者、一句话定位、3–6 个卖点（每个一句话）、栏目与品牌、两版的语气差异、所选内容体裁（见 [content-playbook](references/content-playbook.md) 四类：产品发布 / 项目推荐 / 教程一图流 / 数据复盘）。
**完成标准**：Brief 六项齐全，卖点可直接撑起一张卡或一节文。

### 第 2 步 · 定版式
为每版定：卡片序列（封面→要点→图解/对比→结尾）、文章小节大纲、主题令牌（深色/浅色）。对照 [image-design-system](references/image-design-system.md) 的卡片原型与 [article-format](references/article-format.md) 的结构选型。
**完成标准**：两版的「卡片清单 + 文章目录」都落到纸面，每张卡/每节都对应一个卖点。

### 第 3 步 · 写文案
按 [content-playbook](references/content-playbook.md) 的标题公式、导语公式、卡片文案规则写：每版 ≥3 条标题、≤54 字摘要、文章 Markdown 成稿、每张贴图卡的文字脚本。
**完成标准**：标题有钩子且不标题党过头；摘要能独立成立；正文段落每段 ≤4 行；**文章正文 ≥800 字**；卡片每张只讲一个点。

### 第 4 步 · 生成图片
用 [templates/](templates/) 里的 HTML 模板 + [scripts/build.mjs](scripts/build.mjs)（或直接 [scripts/render.mjs](scripts/render.mjs)）把卡片、文章封面、正文配图渲染成 PNG。**严格按 [image-design-system](references/image-design-system.md) 的尺寸、安全区、字号、色彩、图标规范**；图标取 [assets/icons.svg](assets/icons.svg)。
**完成标准**：所有 PNG 生成成功、尺寸正确（贴图 1080×1440，封面 1080×460）、主体不越安全区、逐张目检无溢出/断行/遮挡。

### 第 5 步 · 文章排版
用 [templates/article-body.html](templates/article-body.html) 产出**微信可直接粘贴**的内联样式 HTML，并同步产出 Markdown 正文（两者内容一致，图注齐全）。
**完成标准**：文章 ≥800 字、≥3 张配图；Markdown 与 HTML 同源同内容；每个图位有「图N：…」图注；无外链 CSS、无脚本（微信编辑器会剥离）。

### 第 6 步 · 发布清单
按 [publish-checklist](references/publish-checklist.md) 给每个样例生成一份清单：图片张数与顺序、封面、摘要字数、原创/话题/发布时间等逐项打勾。
**完成标准**：四个样例各有一份清单，字段完整可照做。

### 第 7 步 · 自检
逐条核对：尺寸规格、安全区、标题/摘要字数、图注、两版差异是否清晰、四个样例是否齐全。
**完成标准**：[publish-checklist](references/publish-checklist.md) 末尾的「交付前自检」全部通过。

## 目录导览

- [references/image-design-system.md](references/image-design-system.md) — **图片样式规范**：画布/栅格/安全区、深浅两套主题令牌、字号阶、5 种卡片原型、视觉组件（浏览器框/代码窗/流程图/层级图/对比）、图标规范、正反例。
- [references/article-format.md](references/article-format.md) — **文章格式规范**：微信排版参数、文章结构、四类体裁配图位、Markdown 骨架、内联 HTML 规则。
- [references/content-playbook.md](references/content-playbook.md) — 标题/摘要/导语/小标题/CTA 的公式与四类体裁大纲。
- [references/publish-checklist.md](references/publish-checklist.md) — 贴图与文章各自的上线清单 + 交付前自检。
- [templates/](templates/) — 可复用 HTML 模板（卡片、封面、文章正文、图解）。
- [scripts/](scripts/) — render.mjs（HTML→PNG）、build.mjs（按 spec 批量出图）。
- [assets/](assets/) — 主题令牌 CSS、图标 sprite、示例 logo。
- [examples/demo/](examples/demo/) — 一次完整的示范产出（两版四样例），可整体替换为自己的内容。

## 环境与命令

依赖：macOS/Linux 上的 Chrome 或 Chromium（脚本会自动探测常见路径，也可用环境变量 CHROME_BIN 指定）。
渲染单张图：

    node scripts/render.mjs --in card.html --out card.png --width 1080 --height 1440

按 spec 批量出整套（卡片 + 封面 + 配图）：

    node scripts/build.mjs --spec examples/demo/spec.json --out examples/demo/out

## 硬性约定

- 贴图卡片固定 **1080×1440（3:4）**；文章封面出**两版**：**1080×460（2.35:1）+ 1080×1080（1:1 方版）**；正文配图宽 1080、高 560–1440。
- **文章正文 ≥800 字（建议 1500–2500）**，至少 3 张配图，是「文字介绍 + 图片」交替的图文长文；不足 800 字只算贴图配文，不算文章。
- 每张卡只表达一个信息；标题最多两行；每卡强调色只用一种。
- 颜色、字号、间距一律取 [assets/tokens.css](assets/tokens.css) 的令牌，不手写魔法值。
- 文章 HTML 只用内联样式；不引外部字体/脚本；图片按顺序编号并配「图N：」图注。
- 版面安全区：四周 ≥64px，主标题不贴边，底部标签不压图。
