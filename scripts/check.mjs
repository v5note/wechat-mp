#!/usr/bin/env node
// scripts/check.mjs — 交付前自动校验（尺寸 / 字数 / 图片引用 / 图注 / md-html 同源 / 规格）
// 用法：node scripts/check.mjs [版本目录…]
// 退出码：0 全过；1 有硬错误。
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MAX_BYTES = 2 * 1024 * 1024;

function pngSize(p) {
  const b = readFileSync(p);
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  return null;
}

function files(dir, re) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => re.test(f)).sort();
}

function stripTags(s) {
  return String(s).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

export function checkVersion(dir, specPath) {
  const errs = [];
  const warns = [];
  const oks = [];
  const fail = (m) => errs.push(m);
  const warn = (m) => warns.push(m);
  const ok = (m) => oks.push(m);
  const abs = resolve(dir);
  const articleDir = join(abs, 'article');

  if (!existsSync(abs)) {
    fail('目录不存在: ' + dir);
    return { errs, warns, oks };
  }

  // ---- cards ----
  const cardFiles = files(join(abs, 'cards'), /^card-\d+\.png$/);
  if (cardFiles.length < 5 || cardFiles.length > 9) fail('贴图张数 ' + cardFiles.length + '，应为 5–9');
  else ok('贴图 ' + cardFiles.length + ' 张');
  for (const f of cardFiles) {
    const p = join(abs, 'cards', f);
    const s = pngSize(p);
    if (!s || s.w !== 1080 || s.h !== 1440) fail(f + ' 尺寸应为 1080×1440，实际 ' + (s ? s.w + '×' + s.h : '非 PNG'));
    if (statSync(p).size > MAX_BYTES) fail(f + ' 超过 2MB');
  }

  // ---- article images ----
  const figFiles = files(join(articleDir, 'images'), /^fig(\d+)\.png$/);
  const figNums = figFiles.map((f) => Number(f.match(/fig(\d+)/)[1])).sort((a, b) => a - b);
  if (figNums.length < 3 || figNums.length > 5) fail('正文配图 ' + figNums.length + ' 张，应为 3–5');
  else ok('正文配图 ' + figNums.length + ' 张');
  figNums.forEach((n, i) => { if (n !== i + 1) fail('正文配图编号不连续，缺 fig' + (i + 1)); });
  for (const f of figFiles) {
    const p = join(articleDir, 'images', f);
    const s = pngSize(p);
    if (!s || s.w !== 1080) fail(f + ' 宽度应为 1080');
    if (!s || s.h < 560 || s.h > 1440) fail(f + ' 高度 ' + (s ? s.h : '?') + '，应在 560–1440');
    if (statSync(p).size > MAX_BYTES) fail(f + ' 超过 2MB');
  }
  for (const [name, w, h] of [['cover.png', 1080, 460], ['cover-square.png', 1080, 1080]]) {
    const p = join(articleDir, name);
    if (!existsSync(p)) { fail('缺少 ' + name); continue; }
    const s = pngSize(p);
    if (!s || s.w !== w || s.h !== h) fail(name + ' 尺寸应为 ' + w + '×' + h + '，实际 ' + (s ? s.w + '×' + s.h : '非 PNG'));
  }

  // ---- article.md ----
  const mdPath = join(articleDir, 'article.md');
  const htmlPath = join(articleDir, 'article.html');
  let md = '';
  let html = '';
  if (!existsSync(mdPath)) fail('缺少 article.md'); else md = readFileSync(mdPath, 'utf8');
  if (!existsSync(htmlPath)) fail('缺少 article.html'); else html = readFileSync(htmlPath, 'utf8');
  let mdH2 = [];

  if (md) {
    if (/undefined/.test(md)) fail('article.md 含 undefined 图片引用');
    const cjk = (md.match(/[\u4e00-\u9fff]/g) || []).length;
    if (cjk < 800) fail('article.md 正文 ' + cjk + ' 字，少于 800'); else ok('正文 ' + cjk + ' 字（≥800）');

    const summary = md.match(/^> 摘要：(.+)$/m);
    if (!summary) warn('article.md 未找到「> 摘要：」行');
    else if (summary[1].trim().length > 54) fail('摘要 ' + summary[1].trim().length + ' 字，超过 54');
    else ok('摘要 ' + summary[1].trim().length + ' 字（≤54）');

    mdH2 = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    const imgLines = [...md.matchAll(/^!\[([^\]]*)\]\(([^)]*)\)\s*$/gm)];
    let mdFigCount = 0;
    const captionNums = [];
    for (const m of imgLines) {
      const alt = m[1].trim();
      const src = m[2].trim();
      if (src === 'undefined') { fail('图片引用为 undefined: ' + alt); continue; }
      if (/^https?:/.test(src)) continue;
      const p = join(articleDir, src);
      if (!existsSync(p)) fail('图片不存在: ' + src);
      const cn = alt.match(/图(\d+)/);
      if (cn) { mdFigCount++; captionNums.push(Number(cn[1])); }
    }
    captionNums.sort((a, b) => a - b);
    captionNums.forEach((n, i) => { if (n !== i + 1) fail('图注编号不连续: 期望 ' + (i + 1) + ' 实际 ' + n); });
    if (mdFigCount !== figNums.length) fail('Markdown 图注 ' + mdFigCount + ' 个，与配图文件 ' + figNums.length + ' 张不一致');
    else ok('图中链接/图注 ' + mdFigCount + ' 个，编号连续');

    // paragraph length (rough): flag >4 lines at 16px/680 width
    const paras = md.split(/\n\s*\n/).filter((p) => p && !/^[#!>|\-*]|^\*\*|^\d+\.|^_{3,}|^---/.test(p.trim()));
    let longParas = 0;
    for (const p of paras) {
      const c = (p.match(/[\u4e00-\u9fff]/g) || []).length;
      if (Math.ceil(c / 38) > 4) longParas++;
    }
    if (longParas) warn(longParas + ' 个段落按 680px 估算超过 4 行');
  }

  // ---- article.html ----
  if (html) {
    if (/<script/i.test(html)) fail('article.html 含 <script>（微信会剥离）');
    if (/<style/i.test(html)) fail('article.html 含 <style>（应全部内联）');
    if (/rel=["']stylesheet/i.test(html)) fail('article.html 引用外部样式');
    const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
    if (srcs.some((s) => !s.trim())) fail('article.html 存在空 src 图片');
    let htmlFigCount = 0;
    for (const s of srcs) {
      if (!s) continue;
      if (/^https?:/.test(s)) continue;
      if (!existsSync(join(articleDir, s))) fail('article.html 图片不存在: ' + s);
      if (!/cover/.test(s)) htmlFigCount++;
    }
    if (htmlFigCount !== figNums.length) fail('article.html 配图 ' + htmlFigCount + ' 张，与配图文件 ' + figNums.length + ' 张不一致');
    const caps = (html.match(/<figcaption/g) || []).length;
    if (caps !== figNums.length) fail('article.html 图注 ' + caps + ' 个，与配图 ' + figNums.length + ' 张不一致（每图 1 个）');
    else ok('HTML 配图/图注 ' + caps + ' 个，无空 src');
    const htmlH2 = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => stripTags(m[1]));
    for (const h of mdH2) if (!htmlH2.includes(h)) fail('HTML 缺少 Markdown 小标题: ' + h);
    if (!mdH2.length) warn('article.md 没有二级小标题');
  }

  // ---- companion files ----
  for (const [f, label] of [['文案.md', '文案'], ['发布清单.md', '发布清单'], ['index.md', '索引']]) {
    if (!existsSync(join(abs, f))) fail('缺少 ' + f);
  }
  if (existsSync(join(abs, 'index.md'))) {
    const idx = readFileSync(join(abs, 'index.md'), 'utf8');
    for (const m of idx.matchAll(/\]\(([^)]+)\)/g)) {
      const l = m[1].split('#')[0].trim();
      if (l && !/^https?:/.test(l) && !existsSync(join(abs, l))) fail('index.md 链接失效: ' + l);
    }
  }
  const leftovers = files(abs, /^\.render-/).length + files(articleDir, /^\.render-/).length;
  if (leftovers) warn('存在 ' + leftovers + ' 个 .render-* 临时文件');

  // ---- spec ----
  const sp = specPath || (existsSync(abs + '.spec.json') ? abs + '.spec.json' : null);
  if (sp && existsSync(sp)) {
    const spec = JSON.parse(readFileSync(sp, 'utf8'));
    const art = (spec.titles && spec.titles.article) || [];
    const img = (spec.titles && spec.titles.image) || [];
    if (art.length < 3 || art.length > 5) fail('文章标题备选 ' + art.length + ' 条，应为 3–5');
    if (img.length < 2 || img.length > 3) fail('贴图标题备选 ' + img.length + ' 条，应为 2–3');
    img.forEach((t) => { if (String(t).length > 20) fail('贴图标题超过 20 字: ' + t); });
    if (spec.summary && spec.summary.length > 54) fail('spec.summary 超过 54 字');
    if (spec.imageCaption && spec.imageCaption.length > 100) fail('imageCaption 超过 100 字');
    const cards = spec.cards || [];
    if (cards.length < 5 || cards.length > 9) fail('spec.cards ' + cards.length + ' 张，应为 5–9');
    const figs = ((spec.article && spec.article.sections) || []).filter((s) => s.figure).length;
    if (figs < 3 || figs > 5) fail('spec 配图位 ' + figs + ' 个，应为 3–5');
    ok('spec 字段自检通过');
  } else {
    warn('未找到 spec.json，跳过标题/摘要字段校验');
  }

  return { errs, warns, oks };
}

function printReport(dir, r) {
  console.log('\n=== ' + dir + ' ===');
  for (const m of r.oks) console.log('  ✓ ' + m);
  for (const m of r.warns) console.log('  ⚠ ' + m);
  for (const m of r.errs) console.log('  ✗ ' + m);
  console.log('  → ' + r.oks.length + ' pass / ' + r.warns.length + ' warn / ' + r.errs.length + ' fail');
}

const isMain = process.argv[1] && process.argv[1].endsWith('check.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const dirs = args.length ? args : ['examples/demo/v1-dark', 'examples/demo/v2-light'];
  let fails = 0;
  for (const d of dirs) {
    const r = checkVersion(d);
    printReport(d, r);
    fails += r.errs.length;
  }
  if (fails) { console.error('\n校验失败：' + fails + ' 个错误。'); process.exitCode = 1; }
  else console.log('\n全部通过。');
}
