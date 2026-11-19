// scripts/palette.mjs — 主题明暗判定 + 两版「一浅一深」校验（零依赖）
// 判定口径：取 assets/tokens.css 里 .t-<theme>{--bg1,--text}，算 WCAG 感知亮度。
//   浅色系 light：bg 近白、字为深色；深色系 dark：bg 近黑、字为浅色。
// 不写死主题名单——调色板改了，判定自动跟着变；新增主题只要补齐令牌即可。
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './chrome.mjs';

const TOKENS = join(ROOT, 'assets/tokens.css');

function relLum(hex) {
  const c = String(hex).replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

let _cache = null;
export function themeTable() {
  if (_cache) return _cache;
  const css = existsSync(TOKENS) ? readFileSync(TOKENS, 'utf8') : '';
  const table = {};
  for (const m of css.matchAll(/\.t-([a-z][a-z0-9-]*)\{([^}]*)\}/g)) {
    const name = m[1];
    if (table[name]) continue;
    const bg = (m[2].match(/--bg1:\s*(#[0-9a-fA-F]{3,6})/) || [])[1];
    const text = (m[2].match(/--text:\s*(#[0-9a-fA-F]{3,6})/) || [])[1];
    const lbg = bg ? relLum(bg) : null;
    const ltx = text ? relLum(text) : null;
    let theme = null;
    if (lbg != null && ltx != null) theme = lbg >= 0.5 && ltx < 0.4 ? 'light' : (lbg < 0.5 && ltx > 0.5 ? 'dark' : null);
    table[name] = { theme, bg, text, luma: lbg };
  }
  _cache = table;
  return table;
}

// 两版配色以「色相」粗分：hue 取 --accent；同一配色族（hue 60° 内）算近亲。
function hueOf(hex) {
  const c = String(hex || '').replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export function themeOf(spec) {
  const t = themeTable()[spec && spec.theme];
  return t ? t.theme : null;
}

function accentOf(spec) {
  const own = spec && spec.accent;
  const fromTokens = (themeTable()[spec && spec.theme] || {}).accent;
  return hueOf(own) != null ? hueOf(own) : hueOf(fromTokens);
}

function hueGap(a, b) {
  if (a == null || b == null) return null;
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

// 交付前的两版校验：一浅一深、不同配色族、结构不同（卡片序列或正文骨架）。
export function comparePair(specs) {
  const errs = [];
  const oks = [];
  if (!Array.isArray(specs) || specs.length < 2) {
    errs.push('两版交付需要至少 2 份 spec');
    return { errs, oks };
  }
  if (specs.length > 2) oks.push('进阶交付：' + specs.length + ' 份 spec（一浅一深要求只对默认两版生效）');
  const list = specs.map((s) => ({
    name: s.slug || s.name || s.theme,
    theme: s.theme,
    tone: themeOf(s),
    hue: accentOf(s),
    seq: ((s.cards || []).map((c) => c.variant)).join('>'),
    hero: ((s.cards || []).filter((c) => c.variant !== 'ending').map((c) => ((c.hero || {}).type || c.variant))).join('>'),
    outline: ((s.article && s.article.sections) || []).map((x) => x.h).join('|'),
  }));
  list.forEach((x) => { if (!x.tone) errs.push('主题 ' + x.theme + ' 无法判定明暗（检查 tokens.css 的 --bg1/--text）'); });
  if (errs.length) return { errs, oks };

  if (specs.length >= 2) {
    const [a, b] = list;
    if (a.tone === b.tone) {
      errs.push('两版同为「' + a.tone + '」主题（' + a.theme + ' / ' + b.theme + '）：默认交付必须一浅一深');
    } else {
      oks.push('两版一浅一深：' + a.theme + '（' + a.tone + '）/ ' + b.theme + '（' + b.tone + '）');
    }
    const gap = hueGap(a.hue, b.hue);
    if (gap != null && gap < 40 && a.tone === b.tone) {
      errs.push('两版同属一个配色族（强调色相差 ' + Math.round(gap) + '°）：' + a.theme + ' / ' + b.theme);
    }
    // 契约口径（SKILL.md）：卡片顺序、主视觉类型或文体至少一处不同；只换配色/语气不算两版
    const heroTypes = (s) => (s.cards || []).filter((c) => c.variant !== 'ending').map((c) => ((c.hero || {}).type || c.variant)).join('>');
    const differs = [
      a.seq !== b.seq ? '卡片序列' : null,
      a.hero !== b.hero ? '主视觉类型' : null,
      a.outline !== b.outline ? '文章骨架' : null,
    ].filter(Boolean);
    if (!differs.length) {
      errs.push('两版结构完全相同（卡片序列 / 主视觉 / 文章骨架）：只换配色/语气不算两版');
    } else {
      oks.push('两版结构不同：' + differs.join(' / '));
    }
  }
  return { errs, oks };
}
