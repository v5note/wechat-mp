---
name: wechat-mp
description: 微信公众号内容生产工坊（贴图 + 长文 + 可选视频号）。当用户要把一个主题、项目、教程或复盘做成公众号内容，说「写公众号」「做个贴图」「生成公众号文章」「按某篇公众号的风格出一版」「出一套公众号样例」「配个视频号/口播」，或给定主题要标题备选 / 摘要 / 正文 / 配图 / 发布清单时使用。内置 20 套主题、6 类画面风格（手机/电脑/卡片/流程图/产品宣传图）、8 种文章骨架与体裁路由：从 35 张贴图、15 篇文章、3 个视频号及 9 篇补充参考中提炼风格库，按主题自动推荐版式。默认交付 2 版本（深色科技 + 浅色清新）× 2 格式（贴图 + 文章）= 4 个样例；可选手机/电脑/流程图/宣传图套图与视频号（口播稿 + 分镜 + 竖版封面）。配图用 HTML 模板 + 无头 Chrome 统一渲染成 PNG，规格受控。
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
metadata:
  author: "wechat-mp"
  version: "0.1.0"
  homepage: "https://github.com/v5note/wechat-mp"
  repository: "https://github.com/v5note/wechat-mp"
  license: "MIT"
---

# 微信公众号内容工坊（wechat-mp）

把一个主题做成**能直接发**的公众号内容：**贴图套图 + 长文（+ 可选视频号）**。
视觉与写作都走同一套**风格库**与**规范**——风格稳定、可复现，不靠临场发挥。

## 你是谁

你是公众号**内容编辑 + 视觉设计**，不是排版机器。判断标准：读者看完能复述一个观点，图片不像 AI 批量生成的模板。

主动避开默认值：暖奶油底 + 高反差衬线标题、深底 + 单一亮色、SaaS 圆角卡片套件、每个标题上一行全大写小标签、中点式「A · B · C」、非序列也标 01/02/03、编造的数据与评价。**设计要从题材里长出来。**

## 先读这三份（决定「做成什么样」）

| 文件 | 作用 |
|---|---|
| [references/style-catalog.md](references/style-catalog.md) | **风格库 + 智能路由**：6 类画面风格、16 种贴图风格（20 套主题）、8 种文章骨架、3 种视频形式，及「输入→风格」查表 |
| [references/image-design-system.md](references/image-design-system.md) | 图片硬规格：画布/安全区/字号阶/卡片原型/视觉组件 |
| [references/article-format.md](references/article-format.md) | 文章排版与「开源项目推荐/横评/复盘」等骨架 |

## 开工前（按需，不阻塞主流程）

1. **事实核查**：涉及真实产品、版本、价格、数据、事件、人物，先 WebSearch 核实，落 `facts.md`（见 [fact-check](references/fact-check.md)）。搜不到就问用户，别编。
2. **品牌资产**：内容里出现任何能被认出的品牌/产品，先取官方 logo、产品图/UI 截图并核验，落 `brand-spec.md`（见 [brand-asset](references/brand-asset.md)）。

> **风格探索是可选增强**：想先看 3 个方向再定风格时，用 [directions](references/directions.md) 与 `scripts/directions.mjs`；不跑它也能直接按下面流程产出。

## 输出契约（先记住交付什么）

**默认**：2 个版本 × 2 种格式 = **4 个公众号样例**。

| 版本 | 贴图（图片消息 / 小绿书） | 文章（图文消息长文） |
|---|---|---|
| V1 深色科技版 | 5–9 张 3:4 卡片图 + 逐图文案 | 长文 + 封面 + 3–5 张正文配图 |
| V2 浅色清新版 | 5–9 张 3:4 卡片图 + 逐图文案 | 长文 + 封面 + 3–5 张正文配图 |

**进阶**（题材有明确最佳风格时）：按 [style-catalog](references/style-catalog.md) 显式挑 1 套「画面风格 + 主题 + 骨架」，做 1 个高完成度样例；
手机 / 电脑 / 卡片 / 流程图 / 产品宣传图可作为主画面，`phone` / `desktop` / `bento` / `flowchart` / `promo` 卡与同名 hero 直接组合。
需要时再加 **1 个视频号产出**（`video/cover.png` + `口播稿.md` + `分镜.md`）。

每个样例都要带齐四件套：
1. **标题备选**：文章 3–5 条、贴图 2–3 条（≤20 字），标注推荐项。
2. **摘要**：文章 ≤54 字（分享卡片上限），贴图一段 ≤100 字配文。
3. **正文**：文章给 Markdown 正文；贴图给逐图文案脚本（每张卡的文字、层级、落点）。
4. **配图 / 发布清单**：图注（图1、图2…）、图片规格、按 [publish-checklist](references/publish-checklist.md) 的清单。

两版共用同一主题与同一份事实，只换**视觉主题与语气**，便于 A/B 选型；但**两版不是换皮**（结构至少一处不同）。

## 输入与智能路由

先收集（缺的用合理默认并在 Brief 里写明假设，不要停下来反复追问）：

- **主题 / 项目名 / 一句话定位**（必填）
- **3–6 个卖点或干货点**（没有就从主题推演，标「待确认」）
- **目标读者**（开发者 / 产品运营 / 泛技术爱好者）
- **品牌色、logo 文字、栏目名**（可选；缺省用主题预设色）
- **输出选择**：默认两版四样例；要视频就说

然后**按风格库路由**（详见 style-catalog 第 5 节）。也可以先跑脚本拿推荐：

    node scripts/route.mjs --topic "你的主题"

输出体裁、推荐主题、卡片序列、文章骨架与视频形式。下表为人工核对依据：

| 输入信号 | 体裁 | 画面风格 | 首选主题 | 文章骨架 | 视频 |
|---|---|---|---|---|---|
| 新品 / 宣传 / 海报 / 预售 | 产品宣传 | 产品宣传图 | promo / ocean | 产品宣发 | 口播 |
| 手机 / 移动端 / 小程序 / 聊天 | 移动端体验 | 手机风格 | ios / rose | 设备图文 | 屏幕解说 |
| 电脑 / 桌面 / 浏览器 / 后台 | 桌面端体验 | 电脑风格 | desk / dark | 设备图文 | 屏幕解说 |
| 流程图 / 流程 / 审批 / 分支 | 流程拆解 | 流程图风格 | blueprint / cream | 教程一图流 | 屏幕解说 |
| 卡片 / 要点 / 模块 / Bento | 卡片清单 | 卡片风格 | bento / sky | 合集/清单 | 图文轮播 |
| 开源 / Star / License / GitHub | 项目推荐 | 贴图套图 | forest / dark | 开源项目推荐 | 口播 |
| 新版本 / 上线 / 发布 | 产品发布 | 贴图套图 | ocean / forest | 产品发布 | 屏幕解说 |
| 工具 / Skill / 插件 / 效率 | 项目推荐 | 贴图套图 | aurora / sky | 项目推荐 | 口播 |
| 教程 / 步骤 / 一图流 | 教程 | 流程图风格 | sky / cream | 教程一图流 | 图文轮播 |
| 对比 / 选型 / 哪个好 | 横评 | 卡片风格 | mono / light | 横评对比 | 口播 |
| 数据 / 复盘 / 指标 | 复盘 | 贴图套图 | dark / cream | 数据复盘 | 屏幕解说 |
| 榜单 / 合集 / N 个 | 合集 | 卡片风格 | cyber / bento | 合集/清单 | 图文轮播 |
| 设计 / UI / 灵感 | 设计干货 | 手机/电脑/卡片 | rose / midnight | 项目推荐 | 图文轮播 |
| 原理 / 架构 / 系统 | 原理图解 | 流程图风格 | cream / blueprint | 教程 | 屏幕解说 |

## 工作流程

### 第 1 步 · 立项卡（Brief）
把输入收敛成一页 Brief：主题、读者、一句话定位、3–6 个卖点（每个一句话）、栏目与品牌、所选体裁与风格（来自路由表）、两版语气差异。
涉及真实信息时先完成事实核查与品牌资产。
**完成标准**：Brief 六项齐全；卖点可直接撑起一张卡或一节文；`facts.md` / `brand-spec.md`（如适用）已生成。

### 第 2 步 · 定版式
为每版定：卡片序列（封面→要点→图解/对比→结尾）、文章小节大纲、主题令牌（`theme` + `accent`）。
优先用 [style-catalog](references/style-catalog.md) 的卡片骨架（cover/point/diagram/compare/list/grid/stat/quote/ending + phone/desktop/bento/flowchart/promo）与视觉组件（browser/code/flow/steps/stack/tiles/matrix/checklist/kv/stats/blist + phone/desktop/bento/flowchart/promo）。
**完成标准**：两版「卡片清单 + 文章目录」落到纸面，每张卡/每节都对应一个卖点；两版结构至少一处不同。

> 可选：先做风格探索，跑 `node scripts/directions.mjs --topic "主题" --out design-demos`（见 [directions](references/directions.md)）。

### 第 3 步 · 写文案
按 [content-playbook](references/content-playbook.md) 的标题公式、导语公式、卡片文案规则写：每版 ≥3 条标题、≤54 字摘要、文章 Markdown 成稿、每张贴图卡的文字脚本。
**完成标准**：标题有钩子且不过度标题党；摘要能独立成立；**文章正文 ≥800 字**；每段 ≤4 行；每张卡只讲一个点。

### 第 4 步 · 生成图片
用 [templates/](templates/) + [scripts/build.mjs](scripts/build.mjs)（或 [scripts/render.mjs](scripts/render.mjs)）把卡片、封面、正文配图渲染成 PNG。
**严格按 [image-design-system](references/image-design-system.md) 的尺寸、安全区、字号、色彩、图标规范**；图标取 [assets/icons.svg](assets/icons.svg)。
**完成标准**：PNG 全部生成、尺寸正确（贴图 1080×1440；封面 1080×460 + 1080×1080）；主体不越安全区；逐张目检无溢出/断行/遮挡；`build.mjs` 末尾自动校验 0 fail；按 [polish-loop](references/polish-loop.md) 至少走 1–2 轮并记录 `polish-log.md`。

### 第 5 步 · 文章排版
用 [templates/article-body.html](templates/article-body.html) 产出**微信可直接粘贴**的内联样式 HTML，并同步 Markdown 正文（两者内容一致，图注齐全）。
**完成标准**：≥800 字、≥3 张配图；Markdown 与 HTML 同源同内容；每个图位有「图N：…」；无外链 CSS、无脚本。

### 第 6 步 · 视频号（可选）
需要时，在 spec 里加 `video` 块（字段见 [video-format](references/video-format.md)），`build.mjs` 会产出 `video/cover.png`（1080×1920）、`口播稿.md`、`分镜.md`。
**完成标准**：封面 1080×1920；分镜 ≥4 镜、前 3 秒有钩子；单屏字幕 ≤12 字；与文章同源同事实。

### 第 7 步 · 发布清单
按 [publish-checklist](references/publish-checklist.md) 给每个样例生成清单：图片张数顺序、封面、摘要字数、原创/话题/发布时间等逐项打勾；视频样例加 B2 节。
**完成标准**：四个（或更多）样例各有一份清单，字段完整可照做。

### 第 8 步 · 自检
先跑自动校验，再人工目检：

    node scripts/check.mjs examples/demo/v1-dark examples/demo/v2-light
    node scripts/preview.mjs --demo examples/demo

逐条核对：尺寸规格、安全区、标题/摘要字数、图注、md/html 同源、两版差异、样例齐全、（如出视频）视频三件套。
**完成标准**：`check.mjs` 0 fail（错误必修，警告逐条确认）；[publish-checklist](references/publish-checklist.md) 末尾自检全部通过。

## 目录导览

- [references/style-catalog.md](references/style-catalog.md) — **风格库 + 智能路由**（6 类画面风格 / 16 贴图风格 / 20 套主题 / 8 文章骨架 / 3 视频形式 / 参考索引）。
- [references/image-design-system.md](references/image-design-system.md) — 图片硬规格：画布/栅格/安全区、20 套主题令牌、字号阶、10 种卡片原型、视觉组件、画面尺寸、正反例。
- [references/article-format.md](references/article-format.md) — 文章排版参数、结构、骨架、Markdown/内联 HTML 规则。
- [references/content-playbook.md](references/content-playbook.md) — 标题/摘要/导语/小标题/配图配文/CTA 公式与实战范式。
- [references/video-format.md](references/video-format.md) — **视频号（可选）**：规格、3 种形式、`spec.video` 字段、自检。
- [references/publish-checklist.md](references/publish-checklist.md) — 贴图/文章/视频上线清单 + 交付前自检。
- [references/fact-check.md](references/fact-check.md) — 事实核查流程与 `facts.md` 模板。
- [references/brand-asset.md](references/brand-asset.md) — 品牌资产五步与 `brand-spec.md` 模板。
- [references/directions.md](references/directions.md) — **可选增强**：方向提案与 `方向确认.md`。
- [references/polish-loop.md](references/polish-loop.md) — 截图打磨环与 `polish-log.md`。
- [references/materials.md](references/materials.md) — **可选增强**：素材分档 T0/T1/T2。
- [references/styles.md](references/styles.md) — 20 套主题清单（含手机/电脑/卡片/流程图/宣传图）与加主题步骤。
- [templates/](templates/) — card / article-cover / article-cover-square / diagram / video-cover / article-body。
- [scripts/](scripts/) — render.mjs、build.mjs、check.mjs、preview.mjs、route.mjs（智能路由）、gen-specimens.mjs、directions.mjs、directions-plan.mjs、theme-registry.mjs、video.mjs。
- [assets/](assets/) — `tokens.css`（15 套主题 + 组件）、`icons.svg`、`style-specimens/`（主题样张）。
- [examples/](examples/) — `demo/`（两版四样例基线）+ `cases/`（参考风格案例：forest / rose / cream / 视频号 / style-gallery 六类画面风格）。

## 环境与命令

依赖：Chrome / Chromium / Edge（自动探测常见路径；也可用 `CHROME_BIN` 指定）。
沙箱 / CI / 容器里浏览器可能拒绝默认 profile，脚本会自动重试一次并带上 `--no-sandbox` + 临时 `--user-data-dir`；也可手动设 `CHROME_FLAGS`。
在 DeepSeek Harness 里，先调用 `load_workspace_dependencies` 拿 Node/Python 路径，不要 `pip install`。

渲染单张图：

    node scripts/render.mjs --in card.html --out card.png --width 1080 --height 1440

按 spec 批量出整套（卡片 + 封面 + 配图 + 文案 + 清单 + 可选视频 + 自动校验）：

    node scripts/build.mjs --spec examples/demo/v1-dark.spec.json --out examples/demo/v1-dark

自动校验 / 生成总览图：

    node scripts/check.mjs examples/demo/v1-dark examples/demo/v2-light
    node scripts/preview.mjs --demo examples/demo

智能路由（主题 → 体裁/主题/骨架推荐）：

    node scripts/route.mjs --topic "一款开源的后端框架"

生成主题样张 /（可选）方向提案：

    node scripts/gen-specimens.mjs
    node scripts/directions.mjs --topic "主题" --out design-demos       # 半自动
    node scripts/directions.mjs --config directions.json --out design-demos  # 手动配置

## 硬性约定

- 贴图卡片固定 **1080×1440（3:4）**；文章封面出**两版**：**1080×460（2.35:1）+ 1080×1080（1:1 方版）**；正文配图宽 1080、高 560–1440；视频封面 **1080×1920（9:16）**。
- **文章正文 ≥800 字（建议 1500–3000）**，至少 3 张配图，是「文字介绍 + 图片」交替的图文长文；不足 800 字只算贴图配文。
- 每张卡只表达一个信息；标题最多两行；每卡强调色只用一种。
- 颜色、字号、间距一律取 [assets/tokens.css](assets/tokens.css) 的令牌，不手写魔法值。
- 文章 HTML 只用内联样式；不引外部字体/脚本；图片按顺序编号并配「图N：」图注。
- **二维码要真**：结尾卡/宣传卡的 `qr` 传官网或 GitHub 地址（`{url,label,logoText}`），由 `scripts/qr.mjs` 生成可扫码的真码；码地址必须与 `article.links` 一致，白底、≥112px，不用占位图案。
- 版面安全区：四周 ≥64px，主标题不贴边，底部标签不压图。
- **画面风格硬规格**：手机真机框 404×820；桌面窗口 936 宽；流程图 936 宽（2–4 步 + 1 判断）；Bento 3–4 列；宣传图一屏一产品一价格一 CTA。
- **设备类配图要够高**：手机/电脑文章配图 ≥900，流程图配图 ≥900，否则设备或末节点会被裁。
- **示意要诚实**：手机/电脑窗口内的 UI 与数字、宣传图价格必须标「示意」或有真实来源；真实截图优先用 `shot`。
- **事实与品牌**：真实产品/数据/评价必须有来源；真实品牌必须有官方 logo/截图，缺失用诚实占位并标注「示意图」。
- **反模板装饰**：非序列不用 01/02/03；不用中点式「A · B · C」；不把全大写小标签当装饰；`NEW`/`免费` 这类徽章只在 brief 明确需要时才加。
- **两版不是换皮**：至少一版的卡片顺序、主视觉类型或文体不同；只换配色/语气不算两版。
- **交付不通过不出门**：`check.mjs` 有 fail 必须修；`polish-log.md` 建议记录至少 1 轮。
