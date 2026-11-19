#!/usr/bin/env node
// scripts/check.mjs — 交付前自动校验（尺寸 / 字数 / 图片引用 / 图注 / md-html 同源 / 规格）
// 用法：node scripts/check.mjs [版本目录…]
// 退出码：0 全过；1 有硬错误。
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { CARD_VARIANTS } from './visuals.mjs';
import { checkQr } from './qr-check.mjs';
import { themeOf, comparePair } from './palette.mjs';
import { MP_SAFE_TAGS, MP_DROP_ATTRS } from './article-tokens.mjs';

// 微信编辑器只保留白名单标签；h1/h2/figure/figcaption/hr/table/blockquote 会被剥离或改写
const MP_FORBIDDEN_TAGS = ['h1', 'h2', 'h3', 'h4', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'div', 'ul', 'ol', 'li'];
const MP_PAGE_SHELL = [/<!doctype/i, /<html[\s>]/i, /<head[\s>]/i, /<body[\s>]/i, /<title[\s>]/i];

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
    // 图注：新写法是「<p …>图N：…」，兼容旧产物的 <figcaption>
    const caps = (html.match(/<p\b[^>]*>[^<]*图\d+：/g) || []).length + (html.match(/<figcaption/g) || []).length;
    if (caps !== figNums.length) fail('article.html 图注 ' + caps + ' 个，与配图 ' + figNums.length + ' 张不一致（每图 1 个）');
    else ok('HTML 配图/图注 ' + caps + ' 个，无空 src');
    // ---- 微信可粘贴性：必须是片段，且只用白名单标签 ----
    const shell = MP_PAGE_SHELL.filter((re) => re.test(html)).map((re) => re.source);
    if (shell.length) fail('article.html 含整页外壳（' + shell.join(', ') + '），粘贴进微信会乱；应只输出一个根 <section>');
    else ok('article.html 为可粘贴片段（无 doctype/html/head/body）');
    const tagHits = [];
    for (const m of html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/g)) {
      const name = m[1].toLowerCase();
      if (MP_FORBIDDEN_TAGS.includes(name) && !tagHits.includes(name)) tagHits.push(name);
      else if (!MP_SAFE_TAGS.includes(name) && !tagHits.includes('?' + name)) tagHits.push('?' + name);
    }
    const bad = tagHits.filter((t) => !t.startsWith('?'));
    const unknown = tagHits.filter((t) => t.startsWith('?')).map((t) => t.slice(1));
    if (bad.length) fail('article.html 含微信会剥离的标签: ' + bad.map((t) => '<' + t + '>').join(' ') + '（改用 p/span/strong/img）');
    if (unknown.length) fail('article.html 含白名单外标签: ' + unknown.map((t) => '<' + t + '>').join(' '));
    if (!bad.length && !unknown.length) ok('article.html 只用 p/span/strong/img 等白名单标签');
    const dropped = MP_DROP_ATTRS.filter((a) => new RegExp(a + '\\s*:').test(html));
    if (dropped.length) warn('article.html 含微信会清理的属性: ' + dropped.join(', ') + '（写了也不生效）');
    if (/<img[^>]*src=["']images\//.test(html) && !existsSync(join(articleDir, '粘贴说明.md'))) {
      warn('article.html 图片为相对路径，需粘贴后在编辑器里手动上传替换（缺 article/粘贴说明.md）');
    }
    if (!existsSync(join(articleDir, '粘贴说明.md'))) warn('缺少 article/粘贴说明.md（粘贴步骤说明）');
    // HTML 小标题对应：段落里用 <strong> 模拟小节标题
    const htmlText = stripTags(html);
    for (const h of mdH2) if (!htmlText.includes(h)) fail('HTML 缺少 Markdown 小标题: ' + h);
    if (!mdH2.length) warn('article.md 没有二级小标题');
  }

  // ---- video (optional 视频号) ----
  const videoDir = join(abs, 'video');
  if (existsSync(videoDir)) {
    const vc = join(videoDir, 'cover.png');
    if (!existsSync(vc)) fail('缺少 video/cover.png');
    else {
      const s = pngSize(vc);
      if (!s || s.w !== 1080 || s.h !== 1920) fail('video/cover.png 尺寸应为 1080×1920，实际 ' + (s ? s.w + '×' + s.h : '非 PNG'));
    }
    if (!existsSync(join(videoDir, '口播稿.md'))) fail('缺少 video/口播稿.md');
    if (!existsSync(join(videoDir, '分镜.md'))) fail('缺少 video/分镜.md');
    else {
      const sb = readFileSync(join(videoDir, '分镜.md'), 'utf8');
      const rows = (sb.match(/^\| \d+ \|/gm) || []).length;
      if (rows < 4) fail('video/分镜.md 少于 4 个镜头');
      else ok('视频分镜 ' + rows + ' 镜');
    }
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
  const sp = specPath || (existsSync(abs + '.spec.json') ? abs + '.spec.json'
    : (existsSync(join(dirname(abs), 'spec.json')) ? join(dirname(abs), 'spec.json') : null));
  if (sp && existsSync(sp)) {
    const spec = JSON.parse(readFileSync(sp, 'utf8'));
    const art = (spec.titles && spec.titles.article) || [];
    const img = (spec.titles && spec.titles.image) || [];
    if (art.length < 3 || art.length > 5) fail('文章标题备选 ' + art.length + ' 条，应为 3–5');
    if (img.length < 2 || img.length > 3) fail('贴图标题备选 ' + img.length + ' 条，应为 2–3');
    img.forEach((t) => { if (String(t).length > 20) fail('贴图标题超过 20 字: ' + t); });
    if (spec.summary && spec.summary.length > 54) fail('spec.summary 超过 54 字');
    if (spec.imageCaption && spec.imageCaption.length > 100) fail('imageCaption 超过 100 字');
    const tone = themeOf(spec);
    if (!tone) fail('主题 ' + spec.theme + ' 无法判定明暗：检查 tokens.css 的 --bg1 / --text');
    else ok('主题 ' + spec.theme + '（' + tone + '）');
    const cards = spec.cards || [];
    if (cards.length < 5 || cards.length > 9) fail('spec.cards ' + cards.length + ' 张，应为 5–9');
    // 首图（封面卡）是钩子：标题短、有卖点条或首屏预览，标题不得缩到内页字号（见 image-design-system 4.1）
    const cover = cards[0] || {};
    if (cover.variant !== 'cover') warn('首张卡不是 cover：首图建议用封面卡做钩子');
    const coverLines = Array.isArray(cover.title) ? cover.title : [cover.title || ''];
    const longLines = coverLines.filter(function (line) { return String(line).length > 13; });
    if (longLines.length) fail('封面标题单行超过 13 字，字号会被压到内页级别: ' + longLines.join(' / '));
    if (!cover.thumbs && !cover.hero) warn('封面既没有首屏预览 thumbs 也没有主视觉 hero，首图信息量偏薄');
    if (!(cover.tags && cover.tags.length >= 2)) warn('封面卖点标签少于 2 个');
    const badVariants = cards.map((c) => c.variant).filter((v) => v && !CARD_VARIANTS.includes(v));
    if (badVariants.length) fail('未知卡片变体: ' + [...new Set(badVariants)].join(', '));
    const figs = ((spec.article && spec.article.sections) || []).filter((s) => s.figure).length;
    if (figs < 3 || figs > 5) fail('spec 配图位 ' + figs + ' 个，应为 3–5');
    if (spec.video) {
      if (!spec.video.title) fail('spec.video 缺少 title');
      const shots = spec.video.shots || [];
      if (shots.length < 4) fail('spec.video.shots ' + shots.length + ' 个，至少 4 个镜头');
      ok('视频 spec 字段自检通过（' + shots.length + ' 镜）');
    }
    // 二维码：结尾卡的码必须是真码，且指向链接里的地址
    const q = checkQr(abs, sp);
    q.oks.forEach(ok); q.warns.forEach(warn); q.errs.forEach(fail);
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
  const siblings = [];
  for (const d of dirs) {
    const r = checkVersion(d);
    printReport(d, r);
    fails += r.errs.length;
    // 同一期里的 v1/v2 成对出现时，额外校验「一浅一深」（见 SKILL.md）
    const abs = resolve(d);
    const sib = existsSync(abs + '.spec.json') ? abs + '.spec.json' : (existsSync(join(dirname(abs), 'spec.json')) ? join(dirname(abs), 'spec.json') : null);
    if (sib) siblings.push({ dir: d, spec: JSON.parse(readFileSync(sib, 'utf8')) });
  }
  const pairs = [];
  for (let i = 0; i + 1 < siblings.length; i += 2) {
    if (dirname(resolve(siblings[i].dir)) === dirname(resolve(siblings[i + 1].dir))) pairs.push([siblings[i].spec, siblings[i + 1].spec]);
  }
  if (siblings.length === 2 && !pairs.length) pairs.push([siblings[0].spec, siblings[1].spec]);
  for (const pair of pairs) {
    const r = comparePair(pair);
    console.log('\n=== 两版配色校验 ===');
    r.oks.forEach((m) => console.log('  ✓ ' + m));
    r.errs.forEach((m) => console.log('  ✗ ' + m));
    console.log('  → ' + r.oks.length + ' pass / 0 warn / ' + r.errs.length + ' fail');
    fails += r.errs.length;
  }
  if (fails) { console.error('\n校验失败：' + fails + ' 个错误。'); process.exitCode = 1; }
  else console.log('\n全部通过。');
}
