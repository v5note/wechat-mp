# 白泽 Baize · 真实产品案例

这是 `wechat-mp` 的**真实品牌案例**：事实来自官方仓库 `baize`（只读）与官网/文档，logo 与门户截图取自官方产物。

- 风格：`baize` 品牌紫（#6255D7）
- 体裁：Agent 运行时 / 平台推荐
- 产出：9 张贴图 + 1465 字文章 + 5 张配图 + 视频号三件套
- 声明：未修改 `/Users/jingyuan-mb01/javaspace/baize` 内任何文件；截图来自官方站点产物，页面中的「交互架构示意」保持原样。

## 复现

```bash
node scripts/build.mjs --spec examples/cases/baize-baize/spec.json --out examples/cases/baize-baize/out
node scripts/check.mjs examples/cases/baize-baize/out
```

## 事实与素材

- [facts.md](facts.md) — 逐条事实与来源、未确认项
- [brand-spec.md](brand-spec.md) — 品牌资产与使用限制
- [ref/](ref/) — 官方 logo 与官网截图副本

## 真实后台截图

- `ref/login.png` 管理台登录页（封面）
- `ref/dashboard-top.png` 控制台（资源 / 运行 / 连接）
- `ref/execution-records.png` 执行记录（Trace 列表）
- `ref/playground.png` 调试工具（对话调试）
- `ref/agent-admin.png` Agent 管理（配置 / 预览 / 发布）
- `ref/model-admin.png` 模型管理（多 provider / 14 个模型）
- `ref/chat-ui.png` 独立对话端 baize-ai-chat

> 截图由用户提供，均为**测试数据**，可直接使用。
