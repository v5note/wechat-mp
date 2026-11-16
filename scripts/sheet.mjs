// scripts/sheet.mjs — 把多张图拼成一张带标签的对照图（纯 HTML + Chrome，无额外依赖）
import { readFileSync } from 'node:fs';
import { relative, dirname } from 'node:path';
import { renderHtml } from './chrome.mjs';

function pngSize(p) {
  const b = readFileSync(p);
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  return null;
}

export function renderSheet(items, outPath, opts = {}) {
  const cols = opts.cols || 3;
  const cellW = opts.cellW || 340;
  const gap = opts.gap || 20;
  const pad = opts.pad || 16;
  const labelH = opts.labelH || 24;
  const rowGap = opts.rowGap || 20;
  const bg = opts.bg || '#ffffff';
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));

  let height = pad * 2;
  const rowHeights = rows.map((row) => {
    let maxH = 0;
    row.forEach((it) => { const s = pngSize(it.abs); maxH = Math.max(maxH, labelH + Math.round(cellW * s.h / s.w)); });
    return maxH;
  });
  height += rowHeights.reduce((a, b) => a + b, 0) + rowGap * (rows.length - 1);
  const width = pad * 2 + cols * cellW + (cols - 1) * gap;

  const body = rows.map((row) => {
    const cells = row.map((it) => {
      const s = pngSize(it.abs);
      const src = relative(dirname(outPath), it.abs).split('\\').join('/');
      const label = it.label + (s ? '  (' + s.w + ' × ' + s.h + ')' : '');
      return '<div class="cell"><div class="lbl">' + label + '</div><img src="' + src + '"></div>';
    }).join('');
    return '<div class="row">' + cells + '</div>';
  }).join('');

  const html = '<!doctype html><html><head><meta charset="utf-8"><style>' +
    'body{margin:0;background:' + bg + ';-webkit-font-smoothing:antialiased}' +
    '.wrap{padding:' + pad + 'px}' +
    '.row{display:flex;gap:' + gap + 'px;margin-bottom:' + rowGap + 'px}' +
    '.row:last-child{margin-bottom:0}' +
    '.cell{width:' + cellW + 'px;flex:0 0 ' + cellW + 'px}' +
    '.lbl{font:13px/1.4 -apple-system,Arial,sans-serif;color:#667085;margin:0 0 6px}' +
    'img{width:100%;display:block;border:1px solid #ECECEC}' +
    '</style></head><body><div class="wrap">' + body + '</div></body></html>';

  return renderHtml(html, outPath, width, height);
}
