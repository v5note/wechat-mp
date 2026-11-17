#!/usr/bin/env node
// scripts/case-banner.mjs — 生成 README「参考风格案例」头图 (1600×720)
// 用法：node scripts/case-banner.mjs [--out assets/case-banner.png]
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderHtml, ROOT } from './chrome.mjs';

const CASES = [
  ['FOREST', 'examples/cases/forest-stackbase/out/cards/card-01.png'],
  ['ROSE', 'examples/cases/rose-mosaic/out/cards/card-01.png'],
  ['CREAM', 'examples/cases/cream-agent/out/cards/card-01.png'],
  ['BAIZE', 'examples/cases/baize-baize/out/cards/card-01.png'],
  ['CYBER', 'examples/cases/cyber-agentbench/out/cards/card-01.png'],
];

export function buildCaseBanner(outPath) {
  const tpl = readFileSync(join(ROOT, 'templates/case-banner.html'), 'utf8');
  let html = tpl;
  for (const [key, rel] of CASES) {
    const b = readFileSync(join(ROOT, rel));
    html = html.split('{{IMG_' + key + '}}').join('data:image/png;base64,' + b.toString('base64'));
  }
  const out = resolve(outPath || join(ROOT, 'assets/case-banner.png'));
  return renderHtml(html, out, 1600, 720);
}

const isMain = process.argv[1] && process.argv[1].endsWith('case-banner.mjs');
if (isMain) {
  const i = process.argv.indexOf('--out');
  const out = i >= 0 ? process.argv[i + 1] : join(ROOT, 'assets/case-banner.png');
  console.log('rendered:', buildCaseBanner(out));
}
