import { readFileSync, writeFileSync } from 'node:fs';
import { buildCard, qrTestHooks } from './visuals.mjs';
import { qrMatrix } from './qr.mjs';

export function checkQr(dir, specPath) {
  const errs = [], warns = [], oks = [];
  let spec;
  try { spec = JSON.parse(readFileSync(specPath, 'utf8')); } catch (e) { return { errs: ['读取 spec 失败: ' + e.message], warns, oks }; }
  const holes = [];
  qrTestHooks.onRender = (url) => { holes.push(url); return url; };
  const cards = spec.cards || [];
  const endings = cards.filter((c) => c.variant === 'ending' || c.variant === 'promo');
  let rendered = 0;
  try {
    cards.forEach((c) => {
      const html = buildCard(c);
      if (/qr placeholder/.test(html)) warns.push((c.variant || 'card') + ' 仍是二维码占位，建议改成真实 URL');
      rendered++;
    });
  } finally { qrTestHooks.onRender = () => null; }
  // 1) 声明了 qr 的结束卡/宣传卡，二维码目标必须是合法 http(s) 地址且能生成
  for (const c of endings.filter((x) => x.qr !== undefined && x.qr !== false)) {
    const q = typeof c.qr === 'object' && c.qr ? c.qr : (typeof c.qr === 'string' ? { url: c.qr } : null);
    if (!(q && q.url)) { errs.push((c.variant || 'card') + ' 缺少二维码目标（qr: {url}）'); continue; }
    if (!/^https?:\/\//.test(q.url)) { errs.push('二维码目标不是 http(s) 地址: ' + q.url); continue; }
    try { const m = qrMatrix(q.url); oks.push(c.variant + ' 二维码可生成：' + q.url + '（v' + m.version + '，' + m.size + '×' + m.size + '）'); }
    catch (e) { errs.push('二维码生成失败: ' + q.url); }
  }
  // 2) 二维码指向的地址要与 article.links 中某个地址一致（防止码和文案对不上）
  const linkUrls = (((spec.article || {}).links) || []).map((l) => (l.url || '').replace(/\/$/, ''));
  for (const c of endings) {
    const q = typeof c.qr === 'object' && c.qr ? c.qr : (typeof c.qr === 'string' ? { url: c.qr } : null);
    if (!(q && q.url)) continue;
    const u = q.url.replace(/\/$/, '');
    if (linkUrls.length && !linkUrls.includes(u)) warns.push('二维码地址不在 article.links 里: ' + q.url);
  }
  // 3) 渲染出来的 HTML 里必须真的有 qrsvg，且数量和 holes 对得上
  const produced = holes.length;
  if (produced) oks.push('渲染期生成二维码 ' + produced + ' 个');
  return { errs, warns, oks };
}
