# assets/icons · 图标说明

## 用法

icons.svg 是一个 SVG symbol sprite。页面里先注入一次（模板中的 ICON_SPRITE 占位符会由脚本自动注入），
然后用 use 引用，颜色随父级 color：

    <svg class="ic"><use href="#ic-star"/></svg>

尺寸用 .ic 的 20 / 24 / 32 / 40 档（image-design-system 第 6 节）。

## 图标清单

| id | 含义 | id | 含义 |
|---|---|---|---|
| ic-star | 星标 / 评分 | ic-shield | 安全 / 边界 |
| ic-check | 对勾 / 完成 | ic-chart | 图表 / 数据 |
| ic-x | 叉 / 不具备 | ic-share | 分享 |
| ic-arrow-right | 右箭头 | ic-link | 链接 |
| ic-arrow-down | 下箭头 | ic-clock | 时间 |
| ic-arrow-up-right | 外链 / 跳转 | ic-spark | 亮点 / AI |
| ic-search | 搜索 | ic-database | 数据库 |
| ic-cube | 模块 / 组件 | ic-branch | 分支 / 调用 |
| ic-layers | 分层 / 架构 | ic-users | 用户 / 团队 |
| ic-code | 代码 | ic-play | 运行 / 入口 |
| ic-terminal | 终端 / 命令行 | ic-plus | 新增 |
| ic-bolt | 能力 / 速度 | ic-qr | 二维码 |
| ic-grid | 网格 / 依赖 | | |

风格统一为线性、2px 描边、24×24 网格、单一 currentColor。加新图标请沿用同一风格并补进本表。

## 换成自己的品牌图标

把 icons.svg 里对应 symbol 的 path 换掉即可，id 不变就不用改模板。
