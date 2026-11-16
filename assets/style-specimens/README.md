# style-specimens

4 套主题样张，由真实渲染管线生成，不是色块示意：

| 文件 | 主题 |
|---|---|
| `sheet-magazine.png` | magazine · 杂志米色 |
| `sheet-guofeng.png` | guofeng · 国风墨朱 |
| `sheet-mono.png` | mono · 极简黑白 |
| `sheet-night-cyan.png` | night-cyan · 深底青 |
| `overview.png` | 四张对照图 |

重新生成：

    node scripts/gen-specimens.mjs

加新主题：先在 [assets/tokens.css](../tokens.css) 加 `.t-<name>`，再到 [scripts/gen-specimens.mjs](../../scripts/gen-specimens.mjs) 的 `themes` 里加一行，跑上面的命令即可。用法见 [references/styles.md](../../references/styles.md)。
