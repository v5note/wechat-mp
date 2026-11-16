#!/usr/bin/env node
// scripts/render.mjs — HTML → PNG
// 用法: node scripts/render.mjs --in card.html --out card.png --width 1080 --height 1440
// 自动注入 assets/tokens.css 与 icons.svg（模板里的 {{BASE_CSS}} / {{ICON_SPRITE}} / <!--ICON_SPRITE--> 会被替换）
import { parseArgs } from 'node:util';
import { renderFile, chromePath } from './chrome.mjs';

const { values } = parseArgs({ options: {
  in: { type: 'string' }, out: { type: 'string' },
  width: { type: 'string', default: '1080' }, height: { type: 'string', default: '1440' },
  css: { type: 'string', default: '' },
}});
if (!values.in || !values.out) {
  console.error('用法: node scripts/render.mjs --in <file.html> --out <file.png> [--width 1080] [--height 1440] [--css extra.css]');
  process.exit(1);
}
try { console.log('chrome:', chromePath()); } catch (e) { console.error(e.message); process.exit(2); }
const out = renderFile(values.in, values.out, parseInt(values.width, 10), parseInt(values.height, 10), values.css);
console.log('rendered:', out);
