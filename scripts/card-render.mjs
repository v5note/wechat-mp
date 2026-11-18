// scripts/card-render.mjs — 用同一套 card.html 外壳渲染任意单卡
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderHtml, ROOT } from './chrome.mjs';
import { buildCard, esc } from './visuals.mjs';

const TPL = readFileSync(join(ROOT, 'templates/card.html'), 'utf8');

// 单卡渲染时同样需要注入 tokens.css 与图标 sprite；
// chrome.mjs 的 injectAssets 只认模板里的 {{BASE_CSS}} / {{ICON_SPRITE}} 占位符。
export function inlineAssets(html) {
  const tokens = readFileSync(join(ROOT, 'assets/tokens.css'), 'utf8');
  const sprite = readFileSync(join(ROOT, 'assets/icons.svg'), 'utf8');
  return html
    .split('{{BASE_CSS}}').join(tokens)
    .split('{{ICON_SPRITE}}').join(sprite);
}

function fill(tpl, map) {
  let out = tpl;
  Object.keys(map).forEach((k) => { out = out.split('{{' + k + '}}').join(map[k]); });
  return out;
}

export function renderCard(card, opts = {}, outPath) {
  const theme = opts.theme || 'dark';
  const brand = opts.brand || {};
  const badge = card.badge ? '<span class="badge' + (card.badgeGhost ? ' ghost' : '') + '">' + esc(card.badge) + '</span>' : '';
  const html = fill(TPL, {
    THEME: 't-' + theme,
    LOGO: esc(brand.logo || (brand.name || 'A').charAt(0)),
    BRAND: esc(brand.name || ''),
    COLUMN: esc(brand.column || ''),
    BADGE: badge,
    MAIN: buildCard(card),
    FOOTER_LEFT: esc(brand.site || brand.name || ''),
    PAGE: (opts.page || 1) + ' / ' + (opts.total || 1),
  });
  let extraCss = '';
  if (opts.accent) {
    extraCss = '.t-' + theme + '{--accent:' + opts.accent + ';--accent-2:' + (opts.accent2 || opts.accent) + '}';
  }
  return renderHtml(inlineAssets(html), outPath, 1080, 1440, extraCss);
}
