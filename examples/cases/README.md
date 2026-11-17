# 参考风格案例（examples/cases）

这些案例是「从参考素材提炼风格 → 用同一套管线产出」的示范。除 baize 外均为**演示虚构项目**；baize-baize 是**真实产品案例**，事实来自官方仓库与文档，logo/截图取官方产物，未改动 baize 仓库。

| 目录 | 风格主题 | 体裁 | 卡片 | 文章 | 视频号 |
|---|---|---|---|---|---|
| [forest-stackbase](forest-stackbase/) | forest 深绿开源项目 | 开源项目推荐（刘哥式） | 7 张 | 1065 字 · 3 图 | 口播干货（5 镜） |
| [rose-mosaic](rose-mosaic/) | rose 浅红新开源 | 设计干货 | 6 张 | 895 字 · 3 图 | 图文轮播（4 镜） |
| [cream-agent](cream-agent/) | cream 米色架构图解 | 原理图解 | 6 张 | 937 字 · 3 图 | — |
| [baize-baize](baize-baize/) | baize 白泽品牌紫（真实产品） | Agent 运行时 / 平台推荐 | 9 张 | 1465 字 · 5 图 | 口播干货（5 镜） |
| [cyber-agentbench](cyber-agentbench/) | cyber 暗黑霓虹合集 | 合集 / 榜单 | 6 张 | 928 字 · 4 图 | 图文轮播（4 镜） |

## 复现

```bash
node scripts/build.mjs --spec examples/cases/forest-stackbase/spec.json --out examples/cases/forest-stackbase/out
node scripts/build.mjs --spec examples/cases/rose-mosaic/spec.json    --out examples/cases/rose-mosaic/out
node scripts/build.mjs --spec examples/cases/cream-agent/spec.json    --out examples/cases/cream-agent/out
node scripts/build.mjs --spec examples/cases/baize-baize/spec.json    --out examples/cases/baize-baize/out
node scripts/build.mjs --spec examples/cases/cyber-agentbench/spec.json --out examples/cases/cyber-agentbench/out
node scripts/check.mjs examples/cases/forest-stackbase/out examples/cases/rose-mosaic/out examples/cases/cream-agent/out examples/cases/baize-baize/out examples/cases/cyber-agentbench/out
```

每个案例产出：`out/cards/`（贴图）、`out/article/`（长文 + 封面 + 配图）、`out/video/`（可选视频号三件套）、`out/文案.md`、`out/发布清单.md`、`out/index.md` 与 `overview*.png`。

> 想把这些案例换成真实项目：按 [brand-asset](../references/brand-asset.md) 取官方 logo/截图，按 [fact-check](../references/fact-check.md) 核实数据，再改 `spec.json` 重出即可。
> baize-baize 使用用户提供的真实管理后台截图（登录、控制台、执行记录、调试、Agent 管理、模型管理、Chat）。截图均为**测试数据**，可直接用于本案例。
