#!/usr/bin/env node
// scripts/gen-article-body.mjs — 由 article-tokens.mjs 生成 templates/article-body.html
// 保证「配方参考」与最终 article.html 用的是同一套色值/间距，不再两处手写。
// 这里展示的每种元素都是**微信可粘贴的写法**（p/span/strong/img），不再用 h1/h2/figure/figcaption/hr/table。
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTICLE as A } from './article-tokens.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const html = [
'<!doctype html>',
'<html lang="zh">',
'<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
'<title>article-body · 微信文章内联样式配方</title>',
'<style>body{margin:0;background:#EDEDED;font-family:-apple-system,"PingFang SC",sans-serif}',
'.wrap{max-width:680px;margin:0 auto;background:#fff;padding:22px 18px 60px}',
'.hint{font:12px/1.6 monospace;color:#b0b0b0;margin:6px 0 18px;border-left:3px solid #eee;padding-left:10px}</style></head>',
'<body>',
'<!-- 由 scripts/gen-article-body.mjs 生成，请改 scripts/article-tokens.mjs 而不是直接改本文件。',
'     下面是全部可复用元素的写法：顶部条 / 标题 / 摘要 / 小节标题 / 段落 / 高亮 / 引用 / 图片+图注 / 表格（转分条）/ 列表 / 分割线 / CTA。',
'     本页是预览页；真正要粘贴的是 build.mjs 产出的 article.html（只含一个根 <section> 的片段）。 -->',
'<div class="wrap">',
'  <p class="hint">article-body.html · generated from scripts/article-tokens.mjs</p>',
'  <p style="' + A.topbar + '">每天推荐一个能上手的开源项目｜栏目「开源精选」</p>',
'  <p style="' + A.h1 + '"><strong>把任意仓库画成一张能点开的架构图</strong></p>',
'  <p style="' + A.meta + '">摘要：一句话读懂整个项目结构，附导出与上手步骤。</p>',
'  <p style="' + A.lead + '">接手一个新仓库，最花时间的往往不是改代码，而是先弄清它到底怎么跑起来的。</p>',
'  <p style="' + A.h2 + '"><strong>一、先说结论</strong></p>',
'  <p style="' + A.p + '">一句话概括：把仓库丢进去，它把模块、依赖和调用关系画成一张可点击的图。<strong style="' + A.accentText + '">重点结论用加粗+主题色</strong>，关键词可用高亮。</p>',
'  <p style="' + A.p + '">它的定位是 <span style="' + A.highlight + '">只读的架构地图</span>，不替你改代码。</p>',
'  <p style="' + A.quote + '">架构图的价值不在好看，而在让你三分钟内定位到「这个功能由哪几个模块负责」。</p>',
'  <p style="' + A.fig + '"><img src="images/fig1.png" alt="图1：仓库 → 模块 → 依赖的一张总图" style="' + A.img + '"></p>',
'  <p style="' + A.cap + '">图1：仓库 → 模块 → 依赖的一张总图</p>',
'  <p style="' + A.th + '">能力</p>',
'  <p style="' + A.td + '">· 能力：结构解析</p>',
'  <p style="' + A.tdc + '">· 说明：识别模块与入口</p>',
'  <p style="' + A.td + '">· 能力：依赖图</p>',
'  <p style="' + A.tdc + '">· 说明：画出调用关系</p>',
'  <p style="' + A.li + '">· 第一个要点</p>',
'  <p style="' + A.li + '">· 第二个要点</p>',
'  <p style="' + A.hr + '"></p>',
'  <p style="' + A.link + '"><strong>项目地址：</strong>https://atlas.dev</p>',
'  <p style="' + A.cta + '">关注「开源精选」，回复「架构」领取示例模板</p>',
'</div>',
'</body>',
'</html>',
''].join('\n');

writeFileSync(join(ROOT, 'templates/article-body.html'), html, 'utf8');
console.log('wrote templates/article-body.html', html.length);
