#!/usr/bin/env node
// scripts/preview.mjs — 自动生成示例总览图（卡片墙 / 封面+配图）
// 用法：node scripts/preview.mjs [--demo examples/demo]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { renderHtml } from './chrome.mjs';

function pngSize(p) {
  const b = readFileSync(p);
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  return null;
}
function files(dir, re) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => re.test(f)).sort();
}
function rel(demoDir, abs) { return relative(demoDir, abs).split('\\').join('/'); }

function sheetHtml(demoDir, rows, cellW, gapX, pad) {
  const rowHtml = rows.map((row) => {
    const cells = row.cells.map((c) => {
      const s = pngSize(c.abs);
      const label = c.label + (s ? ' (' + s.w + ', ' + s.h + ')' : '');
      return '<div class="cell"><div class="lbl">' + label + '</div><img src="' + rel(demoDir, c.abs) + '"></div>';
    }).join('');
    return '<div class="row">' + cells + '</div>';
  }).join('');
  return '<!doctype html><html><head><meta charset="utf-8"><style>' +
    'body{margin:0;background:#fff;-webkit-font-smoothing:antialiased}' +
    '.wrap{padding:' + pad + 'px}' +
    '.row{display:flex;gap:' + gapX + 'px;margin-bottom:18px}' +
    '.row:last-child{margin-bottom:0}' +
    '.cell{width:' + cellW + 'px;flex:0 0 ' + cellW + 'px}' +
    '.lbl{font:13px/1.4 -apple-system,Arial,sans-serif;color:#667085;margin:0 0 5px}' +
    'img{width:100%;display:block;border:1px solid #ECECEC}' +
    '</style></head><body><div class="wrap">' + rowHtml + '</div></body></html>';
}

export function buildDemoOverviews(demoDir) {
  demoDir = resolve(demoDir);
  const versions = ['v1-dark', 'v2-light'].filter((v) => existsSync(join(demoDir, v)));
  if (!versions.length) return [];

  // 1) card wall: one row per version, 7 columns
  const cardRows = versions.map((v) => ({
    cells: files(join(demoDir, v, 'cards'), /^card-\d+\.png$/).map((f, i) => ({
      label: v.replace('v1-dark', 'V1').replace('v2-light', 'V2') + '-card' + String(i + 1).padStart(2, '0'),
      abs: join(demoDir, v, 'cards', f),
    })),
  }));
  const cardW = 190, cardGap = 8, cardPad = 12;
  const cardCellH = Math.round(cardW * 1440 / 1080);
  const cardHeight = cardPad * 2 + cardRows.length * (18 + cardCellH) + (cardRows.length - 1) * 18;
  const maxCards = Math.max(1, ...cardRows.map((r) => r.cells.length));
  const cardWidth = cardPad * 2 + maxCards * cardW + (maxCards - 1) * cardGap;
  const cardOut = join(demoDir, 'overview.png');
  renderHtml(sheetHtml(demoDir, cardRows, cardW, cardGap, cardPad), cardOut, cardWidth, cardHeight);
  const outputs = [cardOut];

  // 2) article overview: 2 columns, covers first then figures
  if (versions.length === 2) {
    const v1 = versions[0], v2 = versions[1];
    const items = [
      { label: 'V1-cover', abs: join(demoDir, v1, 'article', 'cover.png') },
      { label: 'V2-cover', abs: join(demoDir, v2, 'article', 'cover.png') },
    ];
    const addFigs = (v, tag) => files(join(demoDir, v, 'article', 'images'), /^fig\d+\.png$/).forEach((f) => {
      items.push({ label: tag + '-' + f.replace('.png', ''), abs: join(demoDir, v, 'article', 'images', f) });
    });
    addFigs(v1, 'V1');
    addFigs(v2, 'V2');
    const rows = [];
    for (let i = 0; i < items.length; i += 2) rows.push({ cells: items.slice(i, i + 2) });
    const cellW = 520, gapX = 36, pad = 12;
    let height = pad * 2;
    rows.forEach((row, idx) => {
      let rh = 0;
      row.cells.forEach((c) => { const s = pngSize(c.abs); rh = Math.max(rh, 18 + Math.round(cellW * s.h / s.w)); });
      height += rh + (idx < rows.length - 1 ? 18 : 0);
    });
    const width = pad * 2 + 2 * cellW + gapX;
    const artOut = join(demoDir, 'overview-article.png');
    renderHtml(sheetHtml(demoDir, rows, cellW, gapX, pad), artOut, width, height);
    outputs.push(artOut);
  }

  console.log('  preview -> ' + outputs.map((p) => relative(process.cwd(), p)).join(', '));
  return outputs;
}

const isMain = process.argv[1] && process.argv[1].endsWith('preview.mjs');
if (isMain) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--demo');
  const demo = i >= 0 ? argv[i + 1] : 'examples/demo';
  buildDemoOverviews(demo);
}
