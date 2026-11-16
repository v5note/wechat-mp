// scripts/article.mjs — 结构化文章 → 微信内联样式 HTML / Markdown
// 规范见 references/article-format.md

var S = {
  wrap: 'max-width:680px;margin:0 auto;padding:8px 0;font-size:16px;line-height:1.75;color:#3F3F3F;letter-spacing:.5px;font-family:-apple-system,"PingFang SC",sans-serif',
  topbar: 'margin:0 0 20px;padding:10px 14px;background:#F3F6FF;border-radius:8px;font-size:13px;color:#5B667A;letter-spacing:.5px',
  h1: 'margin:0 0 12px;font-size:24px;line-height:1.4;font-weight:800;color:#101828',
  meta: 'margin:0 0 22px;font-size:13px;color:#98A2B3',
  lead: 'margin:0 0 20px;font-size:16px;line-height:1.78;color:#6B6B6B',
  p: 'margin:0 0 19px;font-size:16px;line-height:1.78;color:#3F3F3F;letter-spacing:.5px',
  h2: 'margin:34px 0 14px;font-size:19px;font-weight:800;color:#2563EB;line-height:1.4',
  quote: 'margin:0 0 22px;padding:14px 16px;background:#F7F8FA;border-left:4px solid #2563EB;border-radius:0 8px 8px 0;font-size:15px;line-height:1.7;color:#4B5563',
  fig: 'margin:0 0 24px;text-align:center',
  img: 'width:100%;border-radius:10px;display:block',
  cap: 'margin-top:8px;font-size:13px;color:#9A9A9A',
  th: 'background:#2563EB;color:#fff;padding:10px 12px;text-align:left;font-weight:700',
  td: 'padding:10px 12px;border-bottom:1px solid #EEF1F6',
  tdc: 'padding:10px 12px;border-bottom:1px solid #EEF1F6;color:#5B667A',
  hr: 'height:1px;background:#E5E7EB;margin:28px 0;border:none',
  link: 'margin:0 0 8px;font-size:15px;line-height:1.8;color:#3F3F3F',
  cta: 'margin:18px 0 0;padding:14px 16px;background:#EEF4FF;border-radius:10px;font-size:14px;color:#2563EB;text-align:center',
  li: 'margin:0 0 10px;font-size:16px;line-height:1.7;color:#3F3F3F',
  tocBox: 'margin:0 0 24px;padding:16px 18px;background:#F7F9FC;border:1px solid #E7ECF5;border-radius:10px',
  tocTitle: 'margin:0 0 8px;font-size:13px;font-weight:700;color:#98A2B3;letter-spacing:1px',
  tocItem: 'margin:0;font-size:14px;line-height:1.9;color:#2563EB'
};
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function para(txt, style){ return '<p style="' + style + '">' + esc(txt) + '</p>'; }

export function buildArticleHtml(a){
  var h = '';
  if(a.topbar){ h += para(a.topbar, S.topbar); }
  h += '<h1 style="' + S.h1 + '">' + esc(a.title) + '</h1>';
  if(a.headerImage){ h += '<figure style="' + S.fig + '"><img src="' + esc(a.headerImage) + '" style="' + S.img + '"></figure>'; }
  if(a.summary){ h += '<p style="' + S.meta + '">摘要：' + esc(a.summary) + '</p>'; }
  if(a.toc && a.toc.length){
    var ti = a.toc.map(function(t){ return '<p style="' + S.tocItem + '">· ' + esc(t) + '</p>'; }).join('');
    h += '<div style="' + S.tocBox + '"><p style="' + S.tocTitle + '">本文目录 · ' + a.toc.length + ' 节</p>' + ti + '</div>';
  }
  (a.lead||[]).forEach(function(t){ h += para(t, S.lead); });
  (a.sections||[]).forEach(function(sec){
    h += '<h2 style="' + S.h2 + '">' + esc(sec.h) + '</h2>';
    (sec.paras||[]).forEach(function(t){ h += para(t, S.p); });
    if(sec.quote){ h += '<blockquote style="' + S.quote + '">' + esc(sec.quote) + '</blockquote>'; }
    if(sec.figure){
      h += '<figure style="' + S.fig + '"><img src="' + esc(sec.figure.src) + '" style="' + S.img + '">' +
        '<figcaption style="' + S.cap + '">' + esc(sec.figure.cap) + '</figcaption></figure>';
    }
    if(sec.table){
      var head = (sec.table.head||[]).map(function(x){ return '<th style="' + S.th + '">' + esc(x) + '</th>'; }).join('');
      var rows = (sec.table.rows||[]).map(function(r, ri){
        var bg = ri % 2 ? '#F7F9FC' : '#fff';
        var tds = r.map(function(c, ci){ return '<td style="' + (ci===0?S.td:S.tdc) + ';background:' + bg + '">' + esc(c) + '</td>'; }).join('');
        return '<tr style="background:' + bg + '">' + tds + '</tr>';
      }).join('');
      h += '<table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
    }
    if(sec.list && sec.list.length){
      var lis = sec.list.map(function(t){ return '<p style="' + S.li + '">· ' + esc(t) + '</p>'; }).join('');
      h += lis;
    }
  });
  if(a.closing){ h += para(a.closing, S.p); }
  h += '<hr style="' + S.hr + '">';
  (a.links||[]).forEach(function(l){ h += '<p style="' + S.link + '"><strong>' + esc(l.label) + '：</strong>' + esc(l.url) + '</p>'; });
  if(a.cta){ h += '<p style="' + S.cta + '">' + esc(a.cta) + '</p>'; }
  return '<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(a.title) + '</title></head><body style="margin:0;background:#EDEDED">' +
    '<div style="' + S.wrap + '">' + h + '</div></body></html>';
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
    if(sec.figure){ m.push('![ ' + sec.figure.cap + ' ](' + sec.figure.src + ')'); m.push(''); }
    if(sec.table){
      m.push('| ' + (sec.table.head||[]).join(' | ') + ' |');
      m.push('| ' + (sec.table.head||[]).map(function(){ return '---'; }).join(' | ') + ' |');
      (sec.table.rows||[]).forEach(function(r){ m.push('| ' + r.join(' | ') + ' |'); });
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
