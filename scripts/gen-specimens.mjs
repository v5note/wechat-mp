#!/usr/bin/env node
// scripts/gen-specimens.mjs — 用真实渲染管线生成 4 套主题样张
// 用法：node scripts/gen-specimens.mjs
import { join, resolve } from 'node:path';
import { renderCard } from './card-render.mjs';
import { renderSheet } from './sheet.mjs';
import { ROOT } from './chrome.mjs';

const themes = [
  { theme: 'dark', label: 'dark · 深色科技', column: '科技前线' },
  { theme: 'light', label: 'light · 浅色清新', column: '效率工坊' },
  { theme: 'magazine', label: 'magazine · 杂志米色', column: '杂志编辑' },
  { theme: 'guofeng', label: 'guofeng · 国风朱砂', column: '国风专栏' },
  { theme: 'mono', label: 'mono · 极简黑白', column: '极简观察' },
  { theme: 'night-cyan', label: 'night-cyan · 深底青', column: '科技前线' },
  { theme: 'aurora', label: 'aurora · 浅蓝工具推荐', column: '工具推荐' },
  { theme: 'forest', label: 'forest · 深绿开源项目', column: '开源精选' },
  { theme: 'ocean', label: 'ocean · 深蓝工具发布', column: '软件发布' },
  { theme: 'cream', label: 'cream · 米色架构图解', column: '原理图解' },
  { theme: 'cyber', label: 'cyber · 暗黑霓虹合集', column: '榜单合集' },
  { theme: 'sky', label: 'sky · 亮蓝清单干货', column: '干货清单' },
  { theme: 'rose', label: 'rose · 浅红新开源', column: '新开源' },
  { theme: 'midnight', label: 'midnight · 深紫夜', column: '灵感清单' },
  { theme: 'baize', label: 'baize · 白泽品牌紫', column: 'Agent 运行时' },
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
