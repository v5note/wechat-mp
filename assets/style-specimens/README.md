# style-specimens

20 套主题 / 画面风格样张，由真实渲染管线生成，不是色块示意：

| 文件 | 主题 | 展示的版式 |
|---|---|---|
| `sheet-dark.png` | dark · 深色科技 | 封面 + 浏览器框 |
| `sheet-light.png` | light · 浅色清新 | 封面 + 浏览器框 |
| `sheet-aurora.png` | aurora · 浅蓝工具推荐 | 封面 + 浏览器框 |
| `sheet-forest.png` | forest · 深绿开源项目 | 封面 + 浏览器框 |
| `sheet-ocean.png` | ocean · 深蓝工具发布 | 封面 + 浏览器框 |
| `sheet-cream.png` | cream · 米色架构图解 | 封面 + 浏览器框 |
| `sheet-cyber.png` | cyber · 暗黑霓虹合集 | 封面 + 浏览器框 |
| `sheet-sky.png` | sky · 亮蓝清单干货 | 封面 + 浏览器框 |
| `sheet-rose.png` | rose · 浅红新开源 | 封面 + 浏览器框 |
| `sheet-midnight.png` | midnight · 深紫夜 | 封面 + 浏览器框 |
| `sheet-baize.png` | baize · 白泽品牌紫 | 封面 + 浏览器框 |
| `sheet-ios.png` | ios · 手机风格 | 手机卡（左文右机） |
| `sheet-desk.png` | desk · 电脑风格 | 电脑卡（上文下窗） |
| `sheet-bento.png` | bento · 卡片风格 | 卡片墙（大小格） |
| `sheet-blueprint.png` | blueprint · 流程图风格 | 流程图（判断 + 分支） |
| `sheet-promo.png` | promo · 产品宣传图 | 宣传海报（产品舞台 + 价格） |
| `sheet-magazine.png` | magazine · 杂志米色 | 封面 + 浏览器框 |
| `sheet-guofeng.png` | guofeng · 国风墨朱 | 封面 + 浏览器框 |
| `sheet-mono.png` | mono · 极简黑白 | 封面 + 浏览器框 |
| `sheet-night-cyan.png` | night-cyan · 深底青 | 封面 + 浏览器框 |
| `overview.png` | — | 20 张对照图（4 列） |

重新生成：

    node scripts/gen-specimens.mjs

加新主题：先在 [assets/tokens.css](../tokens.css) 加 `.t-<name>`，再到 [scripts/gen-specimens.mjs](../../scripts/gen-specimens.mjs) 的 `themes` 里加一行（画面风格主题可带专属 `card` 字段），跑上面的命令即可。用法见 [references/styles.md](../../references/styles.md)。
