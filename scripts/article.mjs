// scripts/article.mjs — 结构化文章 → 微信可粘贴片段 HTML / Markdown / 本地预览页
// 规范见 references/article-format.md 第 5 节
//
// 产出三份（都由同一份 article 生成，内容一致）：
//   article.html         —— 只含一个根 <section> 的**片段**，直接全选粘贴进公众号编辑器；
//   article-preview.html —— 带 doctype/居中容器/灰底的本地预览页，内含同一片段，只用来肉眼核对；
//   article.md           —— Markdown 源。
// 规则：不用 doctype/html/head/body/h1/h2/figure/figcaption/hr/table/blockquote；
// 标题、图注、引用、分割线、表格全部改写成 p/span/strong/img 的白名单写法。

import { ARTICLE as S } from './article-tokens.mjs';

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function para(txt, style){ return '<p style="' + style + '">' + txt + '</p>'; }

// 图片位统一写法：p>img + p 图注（figure/figcaption 编辑器不保留）
function figHtml(src, cap, alt){
  var a = alt || cap || '';
  return '<p style="' + S.fig + '"><img src="' + esc(src) + '" alt="' + esc(a) + '" style="' + S.img + '"></p>' +
    (cap ? '<p style="' + S.cap + '">' + esc(cap) + '</p>' : '<p style="' + S.cap + '"></p>');
}

export function buildArticleFragment(a){
  var h = '';
  if(a.topbar){ h += para(esc(a.topbar), S.topbar); }
  h += para('<strong>' + esc(a.title) + '</strong>', S.h1);
  if(a.headerImage){ h += figHtml(a.headerImage, a.headerCaption || '', '题图'); }
  if(a.summary){ h += para('摘要：' + esc(a.summary), S.meta); }
  if(a.toc && a.toc.length){
    var ti = a.toc.map(function(t){ return para('· ' + esc(t), S.tocItem); }).join('');
    h += '<section style="' + S.tocBox + '">' + para(esc('本文目录 · ' + a.toc.length + ' 节'), S.tocTitle) + ti + '</section>';
  }
  (a.lead||[]).forEach(function(t){ h += para(esc(t), S.lead); });
  (a.sections||[]).forEach(function(sec){
    h += para('<strong>' + esc(sec.h) + '</strong>', S.h2);
    (sec.paras||[]).forEach(function(t){ h += para(esc(t), S.p); });
    if(sec.quote){ h += para(esc(sec.quote), S.quote); }
    if(sec.figure){ h += figHtml(sec.figure.src, sec.figure.cap, sec.figure.cap); }
    if(sec.table){
      // 表格会被编辑器清掉，只留文字：表头当小标题，每行拼成「列名：值」分条
      var head = sec.table.head || [];
      var rows = sec.table.rows || [];
      head.forEach(function(x, ci){
        h += para(esc(x), S.th);
        rows.forEach(function(r){
          var label = head.length > 1 ? esc(head[ci]) : '';
          var val = esc(r[ci]);
          h += para('· ' + (label ? label + '：' + val : val), ci === 0 ? S.td : S.tdc);
        });
      });
    }
    if(sec.list && sec.list.length){
      sec.list.forEach(function(t){ h += para('· ' + esc(t), S.li); });
    }
  });
  if(a.closing){ h += para(esc(a.closing), S.p); }
  h += para('', S.hr);
  (a.links||[]).forEach(function(l){ h += para('<strong>' + esc(l.label) + '：</strong>' + esc(l.url), S.link); });
  if(a.cta){ h += para(esc(a.cta), S.cta); }
  return '<section style="' + S.wrap + '">' + h + '</section>';
}

// 微信中直接粘贴的字符串：只有根 <section>，无整页外壳
export function buildArticleHtml(a){
  return buildArticleFragment(a);
}

// 导入页：在浏览器里打开，点一下「复制全文」拿到的是**富文本**，可直接粘进公众号编辑器。
// 这是 Windows / 没有富文本编辑器的环境下唯一可靠的方式（记事本复制出去的是纯文本，粘过去就是源码）。
export function buildArticleImport(a){
  var frag = buildArticleFragment(a);
  var js = "<script>function cp(){var n=document.getElementById('wx');var r=document.createRange();" +
    "r.selectNodeContents(n);var s=window.getSelection();s.removeAllRanges();s.addRange(r);" +
    "document.execCommand('copy');s.removeAllRanges();document.getElementById('msg').textContent='已复制，去公众号编辑器 Cmd/Ctrl+V';}</script>";
  return '<!doctype html><html lang="zh"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(a.title) + ' · 复制全文</title>' +
    '<style>body{margin:0;background:#EDEDED}'
    + '.bar{position:sticky;top:0;z-index:9;display:flex;gap:12px;align-items:center;padding:12px 18px;background:#101828;color:#fff;font:14px/1.5 -apple-system,"PingFang SC",sans-serif}'
    + '.bar button{font:inherit;font-weight:700;padding:8px 16px;border:0;border-radius:8px;background:#2563EB;color:#fff;cursor:pointer}'
    + '.bar span{color:#C7D2FE}'
    + '.wrap{max-width:680px;margin:0 auto;padding:24px 18px 60px;background:#fff}'
    + '</style></head><body>' +
    '<div class="bar"><button onclick="cp()">复制全文</button><span id="msg">复制后再去公众号编辑器粘贴</span></div>' +
    '<div class="wrap"><div id="wx">' + frag + '</div></div>' + js + '</body></html>';
}

// 本地预览页：只用来在浏览器里核对排版，**不要**整页复制粘贴
export function buildArticlePreview(a){
  return '<!doctype html><html lang="zh"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(a.title) + ' · 本地预览</title>' +
    '<style>body{margin:0;background:#EDEDED}\n.wrap{max-width:680px;margin:0 auto;padding:24px 18px 40px;background:#fff}\n' +
    '.hint{max-width:680px;margin:0 auto;padding:10px 18px;font:12px/1.6 monospace;color:#98A2B3;background:#EDEDED;border-bottom:1px solid #E2E6EE}</style></head>' +
    '<body><div class="hint">本地预览页（含整页外壳）。粘贴到微信公众号请复制 article.html，不要复制本页。</div>' +
    '<div class="wrap">' + buildArticleFragment(a) + '</div></body></html>';
}

export function buildArticleMd(a){
  var m = [];
  m.push('# ' + a.title);
  m.push('');
  if(a.headerImage){ m.push('![题图](' + a.headerImage + ')'); m.push(''); }
  if(a.summary){ m.push('> 摘要：' + a.summary); m.push(''); }
  if(a.toc && a.toc.length){ m.push('**本文目录**'); m.push(''); a.toc.forEach(function(t){ m.push('- ' + t); }); m.push(''); }
  (a.lead||[]).forEach(function(t){ m.push(t); m.push(''); });
  (a.sections||[]).forEach(function(sec){
    m.push('## ' + sec.h); m.push('');
    (sec.paras||[]).forEach(function(t){ m.push(t); m.push(''); });
    if(sec.quote){ m.push('> ' + sec.quote); m.push(''); }
    if(sec.figure){ m.push('![ ' + (sec.figure.cap||'') + ' ](' + sec.figure.src + ')'); m.push(''); }
    if(sec.table){
      var head = sec.table.head || [];
      var rows = sec.table.rows || [];
      head.forEach(function(x, ci){ rows.forEach(function(r){ m.push('- **' + x + '**：' + r[ci]); }); });
      m.push('');
    }
    if(sec.list && sec.list.length){ sec.list.forEach(function(t){ m.push('- ' + t); }); m.push(''); }
  });
  if(a.closing){ m.push(a.closing); m.push(''); }
  m.push('---'); m.push('');
  (a.links||[]).forEach(function(l){ m.push('**' + l.label + '：**' + l.url); });
  m.push('');
  if(a.cta){ m.push('> ' + a.cta); }
  return m.join('\n');
}
