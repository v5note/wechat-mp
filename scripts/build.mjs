#!/usr/bin/env node
// scripts/build.mjs — 按 spec.json 生成整套：贴图卡片 + 文章封面 + 正文配图 + 文案 + 发布清单
// v0.1.1：文章改为微信可粘贴片段（仅 section/p/strong/img）+ 浏览器「复制全文」导入页
//   支持 phone / desktop / bento / flowchart / promo 五种画面风格卡片与 hero
// 用法: node scripts/build.mjs --spec examples/demo/v1-dark.spec.json --out examples/demo/v1-dark
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { renderHtml, ROOT } from './chrome.mjs';
import { buildCard, hero, esc, hl, chip, dataUri } from './visuals.mjs';
import { buildArticleHtml, buildArticlePreview, buildArticleImport, buildArticleMd } from './article.mjs';
import { checkVersion } from './check.mjs';
import { buildDemoOverviews } from './preview.mjs';
import { buildVideoScriptMd, buildStoryboardMd, videoCoverFields } from './video.mjs';

const { values } = parseArgs({ options: {
  spec: { type: 'string' }, out: { type: 'string' },
  'render-video': { type: 'boolean', default: false }, 'no-tts': { type: 'boolean', default: false },
} });
if (!values.spec || !values.out) { console.error('用法: node scripts/build.mjs --spec <spec.json> --out <dir>'); process.exit(1); }

const spec = JSON.parse(readFileSync(values.spec, 'utf8'));
const outDir = resolve(values.out);
const theme = spec.theme || 'dark';
const brand = spec.brand || {};
const cards = spec.cards || [];
const article = spec.article || {};
const extraCss = spec.accent ? ('.t-' + theme + '{--accent:' + spec.accent + ';--accent-2:' + (spec.accent2||spec.accent) + '}') : '';
const tplCard = readFileSync(join(ROOT,'templates/card.html'),'utf8');
const tplCover = readFileSync(join(ROOT,'templates/article-cover.html'),'utf8');
const tplCoverSq = readFileSync(join(ROOT,'templates/article-cover-square.html'),'utf8');
const tplDiagram = readFileSync(join(ROOT,'templates/diagram.html'),'utf8');
const tplVideo = readFileSync(join(ROOT,'templates/video-cover.html'),'utf8');

function fill(tpl, map){
  var out = tpl;
  Object.keys(map).forEach(function(k){ out = out.split('{{'+k+'}}').join(map[k]); });
  return out;
}
function cardHtml(card, idx, total){
  var badge = card.badge ? '<span class="badge' + (card.badgeGhost?' ghost':'') + '">' + esc(card.badge) + '</span>' : '';
  var map = {
    THEME: 't-' + theme, LOGO: brand.logoImg ? ('<img class="logo-img" src="' + dataUri(brand.logoImg) + '">') : esc(brand.logo || (brand.name||'A').charAt(0)),
    BRAND: esc(brand.name||''), COLUMN: esc(brand.column||''), BADGE: badge,
    MAIN: buildCard(card), FOOTER_LEFT: esc(brand.site||brand.name||''), PAGE: (idx+1) + ' / ' + total
  };
  return fill(tplCard, map);
}

mkdirSync(join(outDir,'cards'), { recursive: true });
mkdirSync(join(outDir,'article','images'), { recursive: true });
if(spec.video){ mkdirSync(join(outDir,'video'), { recursive: true }); }

// 1) cards
const cardFiles = [];
cards.forEach(function(card, i){
  var n = String(i+1).padStart(2,'0');
  var p = join(outDir,'cards','card-' + n + '.png');
  renderHtml(cardHtml(card, i, cards.length), p, 1080, 1440, extraCss);
  cardFiles.push(p);
  console.log('  card', n, '->', p);
});

// 2) article figures (assign src in order)
var figIndex = 0;
(article.sections||[]).forEach(function(sec){
  if(sec.figure && sec.figure.hero){
    figIndex += 1;
    var src = 'images/fig' + figIndex + '.png';
    var tpl = fill(tplDiagram, {
      THEME: 't-' + theme,
      KICKER: esc(sec.figure.kicker || '图示'),
      TITLE: hl(sec.figure.title || '', sec.figure.accent || ''),
      VISUAL: hero(sec.figure.hero)
    });
    var h = sec.figure.height || 780;
    renderHtml(tpl, join(outDir,'article',src), 1080, h, extraCss);
    sec.figure.src = src;
    console.log('  fig', figIndex, '->', src);
  }
});

// 3) article cover
if(article.cover){
  var cv = article.cover;
  var cvTpl = fill(tplCover, {
    THEME: 't-' + theme,
    KICKER: esc(cv.kicker || ''),
    TITLE: (cv.title||[]).map(function(l){ return hl(l, cv.accent); }).join('<br>'),
    SUB: esc(cv.sub || ''),
    VISUAL: hero(cv.hero)
  });
  renderHtml(cvTpl, join(outDir,'article','cover.png'), 1080, 460, extraCss);
  console.log('  cover ->', 'article/cover.png');
  var cvSq = fill(tplCoverSq, {
    THEME: 't-' + theme, LOGO: brand.logoImg ? ('<img class="logo-img" src="' + dataUri(brand.logoImg) + '">') : esc(brand.logo || (brand.name||'A').charAt(0)),
    BRAND: esc(brand.name||''), COLUMN: esc(brand.column||''),
    KICKER: esc(cv.kicker || ''),
    TITLE: (cv.title||[]).map(function(l){ return hl(l, cv.accent); }).join('<br>'),
    SUB: esc(cv.sub || ''),
    VISUAL: hero(cv.hero),
    TAGS: (cv.tags||['★ 17.6k Star','MIT 开源']).map(chip).join('')
  });
  renderHtml(cvSq, join(outDir,'article','cover-square.png'), 1080, 1080, extraCss);
  console.log('  cover-square ->', 'article/cover-square.png');
}

// 4) article md + html
const artMd = buildArticleMd(article);
writeFileSync(join(outDir,'article','article.md'), artMd.replace(/\s*$/, '') + '\n', 'utf8');
const hanCount = (artMd.match(/[\u4e00-\u9fff]/g) || []).length;
console.log('  article 汉字数:', hanCount, hanCount >= 800 ? '(OK >=800)' : '(WARN <800)');
writeFileSync(join(outDir,'article','article.html'), buildArticleHtml(article).replace(/\s*$/, '') + '\n', 'utf8');
writeFileSync(join(outDir,'article','article-preview.html'), buildArticlePreview(article).replace(/\s*$/, '') + '\n', 'utf8');
writeFileSync(join(outDir,'article','article-import.html'), buildArticleImport(article).replace(/\s*$/, '') + '\n', 'utf8');
var pasteMd = [
  '# 粘贴到微信公众号 · 操作说明', '',
  '> 由 scripts/build.mjs 自动生成。article.html 是**片段**源码（只有一个根 section），article-import.html 是带「复制全文」按钮的导入页。', '',
  '## 一、正文怎么粘（推荐：导入页）', '',
  '1. 用浏览器打开 **article-import.html**，核对排版。',
  '2. 点顶部「**复制全文**」按钮——它复制的是**富文本**，不是源码。',
  '3. 到公众号编辑器正文区 **Ctrl+V**（macOS 为 Cmd+V），样式直接生效。',
  '4. 若按钮没反应：在页面上 **Ctrl+A / Cmd+A 全选 → 复制**，效果相同（浏览器会往剪贴板同时放富文本和纯文本）。',
  '', '## 一·备选：直接用 article.html（仅 macOS）', '',
  '- macOS 可用 VS Code 打开 **article.html** 全选复制，粘进编辑器得到的是富文本。',
  '- **Windows 不要用记事本打开 article.html 复制**：记事本只给剪贴板纯文本，粘过去就是满屏标签源码——这正是「粘进去不渲染」的原因。',
  '- 其他纯文本编辑器（Notepad++ 等）同理，只复制文本，不要用。',
  '- **不要**在浏览器里打开 article.html 后整页全选复制：会连带整页外壳一起复制，样式反而容易乱。',
  '', '## 二、图片怎么进', '',
  '- article.html 里的图片是占位：src 为 images/figN.png（相对路径），微信里一定会裂。',
  '- 粘完文字后，在编辑器里按图注顺序用「图片」按钮上传 article/images/fig' + (figIndex ? '1 → fig' + figIndex : 'N') + '，替换对应占位位置。',
  '- 题图/封面不走正文：用 article/cover.png（2.35:1）设封面，分享卡片的 1:1 图用 cover-square.png。',
  '', '## 三、会被微信清理、已经提前规避的写法', '',
  '- 整页外壳（doctype / html / head / body / title）：article.html 不输出。',
  '- h1、h2、figure、figcaption、hr、table、blockquote：全部改写成 p/span/strong/img。',
  '- font-family、letter-spacing、max-width、margin auto：从根节点去掉；字体会回到微信默认，这是正常现象。',
  '- <style>、<script>、外链字体：一律不输出。',
  '', '## 四、粘贴后逐项核对', '',
  '- [ ] 标题仍是加粗大字；小标题是「一、二、三」编号的蓝色加粗。',
  '- [ ] 图注「图N：…」在图下方、灰色居中。',
  '- [ ] 分割线两侧留白正常（由 1px 空段落实现）。',
  '- [ ] 列表逐条分行，没有被并成一段。',
  '- [ ] 手机预览：无乱码、无裂图、无多余空行。',
  ''].join('\n');
writeFileSync(join(outDir,'article','粘贴说明.md'), pasteMd, 'utf8');
console.log('  article.md / article.html / article-preview.html / article-import.html / 粘贴说明.md written');

// 4.5) 可选：视频号产出（口播稿 + 分镜 + 竖版封面）
var videoInfo = null;
if(spec.video){
  var v = spec.video;
  var vf = videoCoverFields(v, brand);
  vf.THEME = 't-' + theme;
  renderHtml(fill(tplVideo, vf), join(outDir,'video','cover.png'), 1080, 1920, extraCss);
  writeFileSync(join(outDir,'video','口播稿.md'), buildVideoScriptMd(v).replace(/\s*$/, '') + '\n', 'utf8');
  writeFileSync(join(outDir,'video','分镜.md'), buildStoryboardMd(v).replace(/\s*$/, '') + '\n', 'utf8');
  videoInfo = { cover: 'video/cover.png', script: 'video/口播稿.md', storyboard: 'video/分镜.md' };
  console.log('  video -> cover.png + 口播稿.md + 分镜.md');
  // 可选：--render-video 和 --no-tts 透传给 video-render.mjs，产出 video/video.mp4
  // 渲染后再按**实际成片时长**重画封面，保证封面上的「▶ 视频号 · Ns」与视频一致
  if (values['render-video']) {
    var vrArgs = ['scripts/video-render.mjs', '--spec', resolve(values.spec), '--out', outDir];
    if (values['no-tts']) vrArgs.push('--no-tts');
    try {
      var vrOut = execFileSync(process.execPath, vrArgs, { cwd: ROOT, encoding: 'utf8' });
      console.log('  ' + vrOut.trim().split('\n').join('\n  '));
      videoInfo.video = 'video/video.mp4';
      var durMatch = vrOut.match(/([\d.]+)s \u00b7/);
      if (durMatch) {
        v.duration = String(Math.ceil(Number(durMatch[1]))) + 's';
        var vf2 = videoCoverFields(v, brand);
        vf2.THEME = 't-' + theme;
        renderHtml(fill(tplVideo, vf2), join(outDir,'video','cover.png'), 1080, 1920, extraCss);
        console.log('  cover 时长标签已按实际成片更新为 ' + v.duration);
      }
    } catch (e) {
      console.warn('  ⚠ 视频渲染失败（可单独跑 node scripts/video-render.mjs 重试）：' + String(e.message).split('\n')[0]);
    }
  }
}

// 5) 文案.md
var L = [];
L.push('# ' + esc(spec.name || spec.slug || '公众号样例') + ' · 文案');
L.push('');
L.push('> 版本主题：' + theme + '　强调色：' + (spec.accent||'') + '　生成工具：wechat-mp skill');
L.push('');
L.push('## 标题备选');
L.push('');
L.push('### 文章（推荐第 ' + (((spec.titles&&spec.titles.recommend)||0)+1) + ' 条）');
(spec.titles&&spec.titles.article||[]).forEach(function(t,i){ L.push((i+1) + '. ' + t + (i===((spec.titles.recommend)||0)?'　**[推荐]**':'')); });
L.push('');
L.push('### 贴图（≤20 字）');
(spec.titles&&spec.titles.image||[]).forEach(function(t,i){ L.push((i+1) + '. ' + t); });
L.push('');
L.push('## 摘要（' + (spec.summary||'').length + ' 字）');
L.push('');
L.push(spec.summary||'');
L.push('');
L.push('## 贴图配文（≤100 字，图片消息描述）');
L.push('');
L.push(spec.imageCaption||'（未填写）');
L.push('');
L.push('## 贴图逐图文案脚本');
L.push('');
cards.forEach(function(c,i){
  L.push('### 图' + (i+1) + ' · ' + (c.variant||''));
  if(c.thumbs && c.thumbs.length){
    L.push('- 首屏预览：' + c.thumbs.map(function(t){ return (t.kicker ? t.kicker + '→' : '') + (t.t || t.title || ''); }).join(' / ') + '（缩略只放关键词）');
  }
  if(c.nexts && c.nexts.length){
    L.push('- 下期预告：' + c.nexts.map(function(n){ return n.t; }).join(' / '));
  }
  if(c.layout){ L.push('- 首图版式：' + c.layout + '（见 references/style-cases）'); }
  if(c.kicker){ L.push('- 眉标：' + c.kicker + (c.variant === 'cover' ? '（放在标题下方）' : '')); }
  if(c.label){ L.push('- 标签：' + c.label); }
  if(c.title){ L.push('- 标题：' + (Array.isArray(c.title)?c.title.join(' / '):c.title)); }
  if(c.accent){ L.push('- 强调词：' + c.accent); }
  if(c.sub){ L.push('- 副标题：' + c.sub); }
  if(c.body){ L.push('- 正文：' + c.body); }
  if(c.tags){ L.push('- 标签：' + c.tags.join(' / ')); }
  if(c.caption){ L.push('- 图注：' + c.caption); }
  if(c.points){ L.push('- 回顾：' + c.points.join(' / ')); }
  if(c.cta){ L.push('- CTA：' + c.cta); }
  L.push('');
});
writeFileSync(join(outDir,'文案.md'), L.join('\n') + '\n', 'utf8');

// 6) 发布清单.md
var C = [];
C.push('# 发布清单 · ' + (spec.name||spec.slug));
C.push('');
C.push('## 贴图');
C.push('- [ ] 图片共 ' + cards.length + ' 张，顺序：' + cards.map(function(c){return c.variant;}).join(' → '));
C.push('- [ ] 每张 1080×1440（3:4），PNG；单张 >2MB 时压到 JPG 90');
C.push('- [ ] 首图 3 秒可懂；标题 ≤20 字：' + ((spec.titles&&spec.titles.image&&spec.titles.image[0])||'') );
C.push('- [ ] 每卡一个信息、一个强调色、标题 ≤2 行；安全区 ≥64px');
C.push('- [ ] 配文 ≤100 字 + 一个 CTA；结尾卡含二维码/关键词');
C.push('');
C.push('## 文章');
C.push('- [ ] 标题：' + ((spec.titles&&spec.titles.article&&spec.titles.article[(spec.titles.recommend||0)])||''));
C.push('- [ ] 摘要 ≤54 字（当前 ' + (spec.summary||'').length + ' 字）');
C.push('- [ ] 正文 ≥800 字（当前 ' + hanCount + ' 字），含「文字介绍 + 配图」的图文长文');
C.push('- [ ] 封面：2.35:1（1080×460）与 1:1 方版（1080×1080）各一张；正文配图 ' + figIndex + ' 张（≥3），编号连续');
C.push('- [ ] 每图有「图N：」图注；段落 ≤4 行');
C.push('- [ ] article.html 是片段（仅一个根 <section>、只用 p/span/strong/img），不含 doctype/html/head/body 与 h1/h2/figure/hr/table');
C.push('- [ ] **粘贴方式**：浏览器打开 article-import.html → 点「复制全文」→ 粘进编辑器（拿到富文本）；别用记事本等纯文本编辑器打开 article.html 复制，那样粘进去是源码。细则见 article/粘贴说明.md');
C.push('- [ ] **配图要手动上传（必做）**：article.html 里的图片是相对路径 images/figN.png，粘进编辑器后图片会失效；按图注顺序把 ' + figIndex + ' 张配图从 article/images/ 逐张上传并插入（fig1 → fig' + figIndex + '）');
C.push('- [ ] 上传后点「预览」，确认图注「图N：…」与图片一一对应、编号连续');
C.push('- [ ] 封面：在编辑器里单独选 2.35:1 封面；公众号后台若要求 1:1 分享图，用 cover-square.png');
C.push('- [ ] 原创声明：勾选「原创」并填作者；正文里不要出现「本文由 XX 生成」这类元信息');
C.push('- [ ] 手机预览：无乱码、无失效图片');
C.push('');
C.push('## 发布前再核一遍（最容易被漏的）');
C.push('- [ ] 贴图按「图片消息」发时配文只有一段：用 文案.md 里的 ≤100 字配文，别贴整篇正文');
C.push('- [ ] 结尾卡/文末的「下期预告」必须与真实排期一致，不一致就先删掉（不承诺不存在的内容）');
C.push('- [ ] 文中数字（主题数 / 字数 / 尺寸）与当前版本仓库一致');
C.push('');
C.push('## 交付前自检：见 references/publish-checklist.md C 节');
writeFileSync(join(outDir,'发布清单.md'), C.join('\n') + '\n', 'utf8');

// 7) index
var I = [];
I.push('# ' + (spec.name||spec.slug));
I.push('');
I.push('## 贴图');
cardFiles.forEach(function(p,i){ I.push('- [' + 'cards/card-' + String(i+1).padStart(2,'0') + '.png' + '](' + 'cards/card-' + String(i+1).padStart(2,'0') + '.png' + ') — ' + (cards[i].variant)); });
I.push('');
I.push('## 文章');
I.push('- [article/article.md](article/article.md)');
I.push('- [article/article.html](article/article.html)（**粘贴用片段**）');
I.push('- [article/article-import.html](article/article-import.html)（**打开后点「复制全文」**）');
I.push('- [article/article-preview.html](article/article-preview.html)（本地预览，勿整页复制）');
I.push('- [article/粘贴说明.md](article/粘贴说明.md)');
I.push('- [article/cover.png](article/cover.png)（2.35:1）');
I.push('- [article/cover-square.png](article/cover-square.png)（1:1 方版）');
I.push('');
if(videoInfo){
  I.push('');
  I.push('## 视频号（可选）');
  I.push('- [video/cover.png](video/cover.png)（1080×1920 竖版封面）');
  if (existsSync(join(outDir,'video','video.mp4'))) I.push('- [video/video.mp4](video/video.mp4)（可直接上传 · [字幕.ass](video/字幕.ass) · [渲染说明](video/渲染说明.md)）');
  I.push('- [video/口播稿.md](video/口播稿.md) · [video/分镜.md](video/分镜.md)');
}
I.push('');
I.push('## 文案');
I.push('- [文案.md](文案.md) · [发布清单.md](发布清单.md)');
writeFileSync(join(outDir,'index.md'), I.join('\n') + '\n', 'utf8');

// 8) 自动自检（失败即非零退出，避免把坏产物交出去）
console.log('\n=== 自检 ===');
const check = checkVersion(outDir, values.spec);
check.oks.forEach(function(m){ console.log('  ✓ ' + m); });
check.warns.forEach(function(m){ console.log('  ⚠ ' + m); });
check.errs.forEach(function(m){ console.log('  ✗ ' + m); });
console.log('  → ' + check.oks.length + ' pass / ' + check.warns.length + ' warn / ' + check.errs.length + ' fail');
if(check.errs.length) { console.error('自检失败，已中止。'); process.exit(1); }

// 9) 两版都在时，顺手刷新总览图（overview.png / overview-article.png）
const parent = dirname(outDir);
try {
  const sibs = readdirSync(parent);
  if(sibs.some(function(d){ return existsSync(join(parent, d, 'cards')); })) buildDemoOverviews(parent);
} catch (e) { /* ignore */ }

console.log('DONE ->', outDir);
