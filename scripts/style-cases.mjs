#!/usr/bin/env node
// scripts/style-cases.mjs — 由 references/style-cases/cases.json 生成参考风格索引与首图对照墙
// 用法：node scripts/style-cases.mjs            # 生成 references/style-cases/README.md + overview.png
//       node scripts/style-cases.mjs --md       # 只生成 Markdown
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderHtml, ROOT } from './chrome.mjs';

const LIST = join(ROOT, 'references/style-cases/cases.json');

export function buildIndexMd(list) {
  const byStyle = new Map(list.styles.map((s) => [s.id, { ...s, cases: [] }]));
  list.cases.forEach((c) => { const hit = byStyle.get(c.style); if (hit) hit.cases.push(c); });
  const L = [];
  L.push('# 贴图首图参考（35 篇 · 8 种风格）');
  L.push('');
  L.push('> 来源：用户提供的 35 条公众号贴图链接，采集于 ' + list.meta.collected + '。' + list.meta.method + '。');
  L.push('> ' + list.meta.usage + '。');
  L.push('');
  L.push('![首图对照墙](overview.png)');
  L.push('');
  L.push('下表是**每种风格的版面骨架**，选风格时按「赛道」查，不要按配色挑。');
  L.push('');
  L.push('| 风格 | 代表账号 | 长什么样 | 适合哪类主题 |');
  L.push('|---|---|---|---|');
  for (const s of list.styles) L.push('| ' + s.name + ' | ' + s.accounts + ' | ' + s.look + ' | ' + s.serve + ' |');
  L.push('');
  for (const s of list.styles) {
    L.push('## ' + s.name + '（' + s.id + '）');
    L.push('');
    L.push('- 代表账号：' + s.accounts);
    L.push('- 长什么样：' + s.look);
    L.push('- 适合：' + s.serve);
    L.push('- 版面骨架：' + s.recipe.map((r, i) => (i + 1) + '. ' + r).join('；'));
    L.push('- 本篇样本：' + byStyle.get(s.id).cases.map((c) => '[' + c.project + '](' + c.url + ')').join(' · '));
    L.push('');
  }
  L.push('## 全部 35 篇');
  L.push('');
  L.push('| # | 标题 | 项目 / 账号 | 风格 | 链接 |');
  L.push('|---|---|---|---|---|');
  for (const c of list.cases) {
    const s = list.styles.find((x) => x.id === c.style);
    L.push('| ' + c.id.replace('sc-', '') + ' | ' + c.title + ' | ' + c.project + ' | ' + (s ? s.name : c.style) + ' | [打开](' + c.url + ') |');
  }
  L.push('');
  L.push('> 原图不随仓库分发：' + list.meta.note + '。本仓库只保留 `pin-red` 一张作对照（`assets/style-cases/pin-red/`），其余仅记录结构。');
  L.push('');
  return L.join('\n');
}

export function buildOverviewPng(list, out) {
  const cards = list.styles.slice(0, 4).map((s) => '<div class="card"><div class="b">' + s.accounts + '</div><div class="t">' + s.name + '</div><div class="d">' + s.look + '</div><div class="k">' + list.cases.filter((c) => c.style === s.id).length + ' 篇</div></div>').join('');
  const bar = list.styles.map((s) => '<span>' + s.name + ' · ' + list.cases.filter((c) => c.style === s.id).length + '</span>').join('');
  const html = '<!doctype html><html><head><meta charset="utf-8"><style>'
    + 'body{margin:0;background:#0E1116;color:#E8EAF0;font-family:-apple-system,"PingFang SC",sans-serif}'
    + '.wrap{padding:56px 64px}'
    + 'h1{margin:0 0 8px;font-size:54px;letter-spacing:-1px}'
    + '.sub{margin:0 0 34px;font-size:22px;color:#8E97A8;line-height:1.6}'
    + '.grid{display:flex;gap:14px}'
    + '.card{flex:1;background:#161B24;border:1px solid #232B38;border-radius:18px;padding:22px 20px}'
    + '.card .b{font-size:17px;color:#8E97A8;letter-spacing:1px}'
    + '.card .t{font-size:27px;font-weight:800;margin:6px 0 10px;color:#fff}'
    + '.card .d{font-size:16px;line-height:1.55;color:#AEB8C8}'
    + '.card .k{font-size:15px;color:#5EC8FF;margin-top:10px;font-weight:700}'
    + '.bar{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}'
    + '.bar span{font-size:15px;color:#C9D2E0;background:#161B24;border:1px solid #232B38;border-radius:999px;padding:7px 14px}'
    + '.foot{margin-top:22px;font-size:16px;color:#6C7789}'
    + '</style></head><body><div class="wrap">'
    + '<h1>35 篇贴图首图 · 8 种版面风格</h1>'
    + '<p class="sub">工具速评 · 深色技术 · 手绘标注 · 彩色格 · 叠层宣言 · 样张拼贴 · 单图知识海报 · 红系拼贴<br>从公众号图片消息（小绿书）的真实首图归纳，按结构归类，不按配色归类。</p>'
    + '<div class="grid">' + cards + '</div>'
    + '<div class="bar">' + bar + '</div>'
    + '<div class="foot">仅归纳版面结构，不复制原图与内容 · 采集于 ' + list.meta.collected + '</div>'
    + '</div></body></html>';
  return renderHtml(html, out, 1600, 640);
}

const isMain = process.argv[1] && process.argv[1].endsWith('style-cases.mjs');
if (isMain) {
  const list = JSON.parse(readFileSync(LIST, 'utf8'));
  const dir = join(ROOT, 'references/style-cases');
  writeFileSync(join(dir, 'README.md'), buildIndexMd(list));
  console.log('md:', join(dir, 'README.md'));
  if (!process.argv.includes('--md')) console.log('png:', buildOverviewPng(list, join(dir, 'overview.png')));
}
