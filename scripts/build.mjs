#!/usr/bin/env node
// scripts/build.mjs — 按 spec.json 生成整套：贴图卡片 + 文章封面 + 正文配图 + 文案 + 发布清单
// 用法: node scripts/build.mjs --spec examples/demo/v1-dark.spec.json --out examples/demo/v1-dark
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { renderHtml, ROOT } from './chrome.mjs';
import { buildCard, hero, esc, hl, chip } from './visuals.mjs';
import { buildArticleHtml, buildArticleMd } from './article.mjs';

const { values } = parseArgs({ options: { spec: { type: 'string' }, out: { type: 'string' } } });
if (!values.spec || !values.out) { console.error('用法: node scripts/build.mjs --spec <spec.json> --out <dir>'); process.exit(1); }

const spec = JSON.parse(readFileSync(values.spec, 'utf8'));
const outDir = resolve(values.out);
const theme = spec.theme || 'dark';
const brand = spec.brand || {};
const cards = spec.cards || [];
const article = spec.article || {};
const extraCss = '.t-' + theme + '{--accent:' + (spec.accent||'#4F8CFF') + ';--accent-2:' + (spec.accent2||'#38E1D6') + '}';
const tplCard = readFileSync(join(ROOT,'templates/card.html'),'utf8');
const tplCover = readFileSync(join(ROOT,'templates/article-cover.html'),'utf8');
const tplCoverSq = readFileSync(join(ROOT,'templates/article-cover-square.html'),'utf8');
const tplDiagram = readFileSync(join(ROOT,'templates/diagram.html'),'utf8');

function fill(tpl, map){
  var out = tpl;
  Object.keys(map).forEach(function(k){ out = out.split('{{'+k+'}}').join(map[k]); });
  return out;
}
function cardHtml(card, idx, total){
  var badge = card.badge ? '<span class="badge' + (card.badgeGhost?' ghost':'') + '">' + esc(card.badge) + '</span>' : '';
  var map = {
    THEME: 't-' + theme, LOGO: esc(brand.logo || (brand.name||'A').charAt(0)),
    BRAND: esc(brand.name||''), COLUMN: esc(brand.column||''), BADGE: badge,
    MAIN: buildCard(card), FOOTER_LEFT: esc(brand.site||brand.name||''), PAGE: (idx+1) + ' / ' + total
  };
  return fill(tplCard, map);
}

mkdirSync(join(outDir,'cards'), { recursive: true });
mkdirSync(join(outDir,'article','images'), { recursive: true });

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
      VISUAL: hero(sec.figure.hero),
      CAPTION: esc(sec.figure.cap || '')
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
    THEME: 't-' + theme, LOGO: esc(brand.logo || (brand.name||'A').charAt(0)),
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
writeFileSync(join(outDir,'article','article.md'), artMd, 'utf8');
const hanCount = (artMd.match(/[\u4e00-\u9fff]/g) || []).length;
console.log('  article 汉字数:', hanCount, hanCount >= 800 ? '(OK >=800)' : '(WARN <800)');
writeFileSync(join(outDir,'article','article.html'), buildArticleHtml(article), 'utf8');
console.log('  article.md / article.html written');

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
  if(c.kicker){ L.push('- 眉标：' + c.kicker); }
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
writeFileSync(join(outDir,'文案.md'), L.join('\n'), 'utf8');

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
C.push('- [ ] HTML 为内联样式，粘贴到微信编辑器不丢样式');
C.push('- [ ] 手机预览：无乱码、无失效图片');
C.push('');
C.push('## 交付前自检：见 references/publish-checklist.md C 节');
writeFileSync(join(outDir,'发布清单.md'), C.join('\n'), 'utf8');

// 7) index
var I = [];
I.push('# ' + (spec.name||spec.slug));
I.push('');
I.push('## 贴图');
cardFiles.forEach(function(p,i){ I.push('- [' + 'cards/card-' + String(i+1).padStart(2,'0') + '.png' + '](' + 'cards/card-' + String(i+1).padStart(2,'0') + '.png' + ') — ' + (cards[i].variant)); });
I.push('');
I.push('## 文章');
I.push('- [article/article.md](article/article.md)');
I.push('- [article/article.html](article/article.html)');
I.push('- [article/cover.png](article/cover.png)（2.35:1）');
I.push('- [article/cover-square.png](article/cover-square.png)（1:1 方版）');
I.push('');
I.push('## 文案');
I.push('- [文案.md](文案.md) · [发布清单.md](发布清单.md)');
writeFileSync(join(outDir,'index.md'), I.join('\n'), 'utf8');

console.log('DONE ->', outDir);