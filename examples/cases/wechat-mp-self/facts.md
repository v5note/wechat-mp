# 事实核查 · wechat-mp（自举案例）

> 核对日期：2026-11-19。来源：本仓库（当前工作区）源码、README、SKILL.md 与渲染产物；本案例只读仓库，未改动任何脚本/模板。
> 写法约定：本案例**不写 Star / 下载量 / 用户数 / 效果承诺**——仓库内没有这类数据来源。

| 事实 | 值 | 来源 |
|---|---|---|
| 项目定位 | 面向微信公众号的内容生产工具链 + Agent Skill | README.md 首段 |
| 默认产出 | 2 版本 × 2 格式 = 4 个样例（贴图 + 文章） | README.md「一次调用产出什么」 |
| 贴图规格 | 1080×1440（3:4） | templates/card.html、scripts/check.mjs |
| 文章封面规格 | 1080×460（2.35:1）+ 1080×1080（1:1） | templates/article-cover.html、article-cover-square.html |
| 视频号封面 | 1080×1920（9:16） | templates/video-cover.html |
| 正文长度门槛 | ≥800 汉字；建议 1500–3000 | SKILL.md 硬性约定、scripts/check.mjs |
| 摘要上限 | ≤54 字（微信分享卡片上限） | README.md、references/publish-checklist.md |
| 主题数量 | 20 套（dark / light / aurora / forest / ocean / cream / cyber / sky / rose / midnight / baize / ios / desk / bento / blueprint / promo / magazine / guofeng / mono / night-cyan） | assets/tokens.css、references/styles.md |
| 画面风格 | 6 类：手机 / 电脑 / 卡片（Bento）/ 流程图 / 产品宣传图 / 纯贴图 | references/style-catalog.md |
| 卡片 variant | cover / point / diagram / compare / ending / list / grid / stat / quote + phone / desktop / bento / flowchart / promo | templates/README.md、scripts/visuals.mjs |
| 视觉组件 | browser / code / flow / steps / stack / tiles / ring / matrix / checklist / kv / stats / blist / compare / shot + 5 种画面组件 | templates/README.md |
| 图标 | 25 个线性图标（sprite 自动注入） | assets/icons.svg、assets/icons/README.md |
| 文章骨架 | 8 种（项目推荐 / 产品宣发 / 产品发布 / 教程一图流 / 横评对比 / 数据复盘 / 合集清单 / 设备图文） | references/style-catalog.md |
| 视频号形式 | 3 种（口播 / 图文轮播 / 屏幕解说） | references/video-format.md |
| 脚本与测试 | 20 个脚本（不含 tests/），CI 跑 `node --test` | scripts/、.github/workflows/ci.yml |
| npm 依赖 | 0（Node.js 18+ ES Modules + 本机 Chrome） | README.md「特性 / 环境要求」 |
| 二维码 | 真实可扫码，零依赖生成（字节模式 + RS 纠错），并校验与 article.links 一致 | scripts/qr.mjs、qr-check.mjs |
| 自检命令 | `node scripts/check.mjs <dir>...`：张数 / 字数 / 摘要 / 图注 / md-html 同源 / 二维码 | scripts/check.mjs |
| 许可证 | MIT | LICENSE |

## 未确认 / 不写
- Star 数、下载量、使用者数量、涨粉效果 → 无可引来源，不写。
- 任何「比人工快 X 倍」类数字 → 需要对照实验，本案例不给。
- 自媒体账号规模、发布后的阅读量 → 与本仓库无关，不写。

## 素材来源
- logo：无独立品牌资产，使用字母块「微」（`brand.logo`），并在 `brand.column` 标注栏目。
- 截图：**没有产品界面可截**——本项目的「界面」就是它产出的图。
  因此正文配图与封面不使用 `shot` 真实截图框，改用本项目自己会产出的版式（流程图 / 拆解 / 对比 / 清单），素材全部由 `build.mjs` 现场渲染，来源即本仓库规范。
- 本案例自身即证据：`overview.png`、`out/**/*.png` 都是这套管线生成的产物。
