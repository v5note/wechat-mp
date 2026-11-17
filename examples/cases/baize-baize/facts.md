# 事实核查 · 白泽 Baize

> 检索/核对日期：2026-11-17。来源：官方仓库 `/Users/jingyuan-mb01/javaspace/baize`（只读）、官网与文档。
> 本案例只读取 baize 仓库，未修改其中任何文件。

| 事实 | 值 | 来源 |
|---|---|---|
| 产品定位 | Server–Client 模式的多语言 Agent 运行时平台 | README.md / baize-docs/index.md |
| 核心组成 | Java Server 管理 Agent、模型、MCP、Skill、RAG、资源与执行调度 | baize-docs/index.md |
| 协议 | NARP v2，gRPC 双向流（AgentRuntimeService.Connect） | baize-docs/zh/architecture.md、zh/protocol |
| 客户端语言 | Java（AgentScope）、Python（LangGraph + LangChain）、Node.js（Pi Agent） | baize-docs/index.md |
| 规划中客户端 | Rust、Golang 独立 SDK「属于规划」，当前不可接入 | baize-docs/index.md、zh/desktop.md |
| 管理端 | baize-ai-ui（Vue） | README.md |
| 对话端 | baize-ai-chat（Web + Tauri 2 桌面） | README.md、zh/desktop.md |
| 桌面执行 | Rust Host 启动固定 sidecar，Agent Loop 使用 Pi Agent | zh/desktop.md |
| 部署端口 | 默认 HTTP 8880、gRPC 18900（可覆盖） | zh/start.md |
| 服务端环境 | JDK 21、Maven 3.9（或 wrapper）、MySQL、Redis | zh/start.md |
| Node 客户端 | Node.js ≥ 22.19、pnpm 10 | zh/start.md |
| Python 客户端 | Python ≥ 3.11、uv | zh/start.md |
| 安全边界 | NARP 当前未启用 TLS，gRPC 端口应限制在受信任网络 | README.md「安全说明」 |
| 文档核对时间 | 官方文档标注 2026-10-29 核对 | baize-docs/index.md |
| 品牌主色 | #6255D7 | baize-docs/PRODUCT.md |
| 官网标语 | 统一掌控，自由运行。让智能，融入你的业务。 | baize.v5ai.xin 首屏 |

## 未确认 / 不写
- 许可证：管理后台页脚显示「Copyright MIT © 2026 Baize AI(白泽)」，但仓库未附 LICENSE 文件说明；正文不展开许可结论，如需对外声明请先与官方确认。
- 价格、Star 数、性能数字 → 无官方来源，不写。
- 生产可用性结论 → 只描述官方文档声明，不做效果承诺。

## 素材来源
- logo：`baize-website/public/baize-mark.png`
- 官网首屏截图：`baize-website/output/playwright/hero.png`（官方产物，页面内标注「交互架构示意」）
- 真实管理后台截图（用户于 2026-11-17 提供）：`ref/login.png`、`ref/dashboard-top.png`、`ref/execution-records.png`、`ref/playground.png`、`ref/agent-admin.png`、`ref/model-admin.png`、`ref/chat-ui.png`
- 截图口径：控制台显示 Agent 10 / 模型 14 / 知识库 4 / MCP 3 / Skill 2 / API Key 2；模型列表 14 条（含 DeepSeek、Qwen 等）。这些是截图时点的真实后台状态，正文不据此推断长期数据。
- **素材说明**：后台截图为用户提供的测试数据，可直接使用；本案例仅存于 `wechat-mp` 工作区，未改动 baize 仓库。
