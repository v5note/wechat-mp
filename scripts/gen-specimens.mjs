#!/usr/bin/env node
// scripts/gen-specimens.mjs — 用真实渲染管线生成 4 套主题样张
// 用法：node scripts/gen-specimens.mjs
import { join, resolve } from 'node:path';
import { renderCard } from './card-render.mjs';
import { renderSheet } from './sheet.mjs';
import { ROOT } from './chrome.mjs';

const themes = [
  { theme: 'magazine', label: 'magazine · 杂志米色', column: '杂志编辑' },
  { theme: 'guofeng', label: 'guofeng · 国风朱砂', column: '国风专栏' },
  { theme: 'mono', label: 'mono · 极简黑白', column: '极简观察' },
  { theme: 'night-cyan', label: 'night-cyan · 深底青', column: '科技前线' },
];

const outDir = join(ROOT, 'assets', 'style-specimens');
const items = [];

for (const t of themes) {
  const card = {
    variant: 'cover',
    kicker: 'WECHAT MP 主题样张',
    title: ['把主题', '做成能发的内容'],
    accent: '能发',
    sub: '贴图 + 长文 · 2 版本 4 样例',
    hero: { type: 'browser', url: 'wechat-mp', ui: 'dashboard' },
    tags: ['★ 主题样张', '1080×1440', 'PNG'],
  };
  const out = join(outDir, 'sheet-' + t.theme + '.png');
  renderCard(card, {
    theme: t.theme,
    brand: { name: 'wechat-mp', logo: '微', column: t.column, site: 'wechat-mp' },
    page: 1,
    total: 1,
  }, out);
  items.push({ label: t.label, abs: resolve(out) });
  console.log('  specimen ->', 'assets/style-specimens/sheet-' + t.theme + '.png');
}

renderSheet(items, join(outDir, 'overview.png'), { cols: 4, cellW: 260, gap: 18, pad: 16 });
console.log('  overview -> assets/style-specimens/overview.png');
