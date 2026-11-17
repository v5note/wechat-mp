// scripts/visuals.mjs — 卡片视觉组件库（纯字符串拼装，输出 HTML 片段）
// 所有组件遵守 references/image-design-system.md 的规范。
import { readFileSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 把本地图片读成 data URI，避免相对路径在渲染临时目录里失效（真实品牌截图用）
export function dataUri(p){
  const abs = isAbsolute(p) ? p : join(ROOT, p);
  const b = readFileSync(abs);
  const l = abs.toLowerCase();
  const mime = (l.endsWith('.jpg') || l.endsWith('.jpeg')) ? 'image/jpeg'
    : l.endsWith('.webp') ? 'image/webp'
    : l.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  return 'data:' + mime + ';base64,' + b.toString('base64');
}

export function shotFrame(url, caption, src){
  return '<div class="shotwrap"><div class="shot"><div class="sbar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span>' +
    '<span class="surl">' + esc(url || '') + '</span></div><img src="' + dataUri(src) + '"></div>' +
    (caption ? '<div class="shotcap">' + ic('search') + esc(caption) + '</div>' : '') + '</div>';
}

export function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
export function ic(name){ return '<svg class="ic"><use href="#ic-' + name + '"/></svg>'; }
export function hl(text, accent){
  text = String(text == null ? '' : text);
  if(!accent){ return esc(text); }
  var i = text.indexOf(accent);
  if(i < 0){ return esc(text); }
  return esc(text.slice(0,i)) + '<span class="acc">' + esc(accent) + '</span>' + esc(text.slice(i+accent.length));
}

export function titleHtml(t, accent){
  if(Array.isArray(t)){ return t.map(function(x){ return hl(x, accent); }).join('<br>'); }
  return hl(t, accent);
}

export function chip(t){
  t = String(t);
  if(t.charAt(0) === '*' || t.indexOf('★') === 0){
    return '<span class="chip accent">' + ic('star') + esc(t.replace(/^[★*]\s*/, '')) + '</span>';
  }
  return '<span class="chip">' + esc(t) + '</span>';
}
export function chips(tags){ return '<div class="tags">' + (tags||[]).map(chip).join('') + '</div>'; }

// ---------- frames ----------
export function browserFrame(url, inner){
  return '<div class="browser"><div class="bbar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span>' +
    '<span class="burl">' + esc(url||'app') + '</span></div><div class="bbody">' + inner + '</div></div>';
}
export function sidebar(n){
  var s = '<div class="mside">';
  for(var i=0;i<(n||6);i++){ s += '<div class="mnav' + (i===0?' on':'') + '"></div>'; }
  return s + '</div>';
}
export function mockDashboard(){
  // 诚实的骨架占位：不放任何编造的指标数字
  var card = function(w){ return '<div class="mcard"><div class="ml ' + w + '"></div><div class="ml w1"></div></div>'; };
  var heights = [42,64,50,78,58,88,70];
  var bars = heights.map(function(h){ return '<div class="mbar" style="height:' + h + '%"></div>'; }).join('');
  return '<div class="mock">' + sidebar(6) + '<div class="mmain">' +
    '<div class="mrow">' + card('w2') + card('w3') + card('w1') + '</div>' +
    '<div class="mchart">' + bars + '</div></div></div>';
}
export function mockList(){
  var row = function(w){ return '<div class="mcard" style="padding:14px;flex-direction:row;align-items:center;gap:14px">' +
    '<div class="mnav on" style="width:38px;height:38px;border-radius:10px"></div>' +
    '<div class="ml ' + w + '" style="height:12px"></div></div>'; };
  return '<div class="mock">' + sidebar(5) + '<div class="mmain" style="gap:12px">' +
    row('w2') + row('w3') + row('w1') + row('w2') + row('w3') + '</div></div>';
}
export function mockBoard(){
  var card = function(w){ return '<div class="mcard" style="min-height:74px"><div class="ml w1"></div><div class="ml ' + w + '"></div></div>'; };
  return '<div class="mock"><div class="mmain" style="flex-direction:row;gap:14px">' +
    '<div class="mmain" style="gap:12px">' + card('w2') + card('w3') + '</div>' +
    '<div class="mmain" style="gap:12px">' + card('w1') + card('w2') + card('w3') + '</div>' +
    '<div class="mmain" style="gap:12px">' + card('w2') + '</div>' +
    '</div></div>';
}

// ---------- code window ----------
export function codeWindow(file, lines){
  var body = (lines||[]).map(function(l){
    if(typeof l === 'string'){ return esc(l); }
    return '<span class="' + (l.cls||'') + '">' + esc(l.text) + '</span>';
  }).join('\n');
  return '<div class="code"><div class="cbar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span>' +
    '<span class="cname">' + esc(file||'file') + '</span></div><div class="cbody">' + body + '</div></div>';
}

// ---------- flow ----------
export function flow(nodes, vertical){
  var parts = [];
  (nodes||[]).forEach(function(n, i){
    parts.push('<div class="fnode">' + (n.num ? '<div class="fnum">' + esc(n.num) + '</div>' : '') +
      '<div class="ft">' + esc(n.t||'') + '</div>' + (n.d ? '<div class="fd">' + esc(n.d) + '</div>' : '') + '</div>');
    if(i < nodes.length - 1){ parts.push('<div class="farrow">' + ic(vertical ? 'arrow-down' : 'arrow-right') + '</div>'); }
  });
  return '<div class="flow' + (vertical ? ' v' : '') + '">' + parts.join('') + '</div>';
}

// ---------- stack ----------
export function stack(layers){
  var rows = (layers||[]).map(function(L, i){
    var chips = (L.items||[]).map(function(x){ return '<span class="schip">' + esc(x) + '</span>'; }).join('');
    return '<div class="slayer' + (i===0?' a':'') + '"><div class="sname">' + esc(L.name||'') + '</div><div class="schips">' + chips + '</div></div>';
  }).join('');
  return '<div class="stack">' + rows + '</div>';
}

// ---------- tiles ----------
export function tiles(items){
  var t = (items||[]).map(function(x){
    return '<div class="tile">' + ic(x.icon||'cube') + '<div class="tl">' + esc(x.t||'') + '</div></div>';
  }).join('');
  return '<div class="tiles">' + t + '</div>';
}

// ---------- ring ----------
export function ring(center, sides){
  var s = (sides||[]).map(function(x){ return '<div class="tile" style="padding:16px">' + ic(x.icon||'cube') + '<div class="tl">' + esc(x.t||'') + '</div></div>'; }).join('');
  return '<div class="ring"><div class="center">' + ic(center||'bolt') + '</div><div class="side" style="flex-direction:row;gap:14px">' + s + '</div></div>';
}

// ---------- steps (numbered horizontal) ----------
export function steps(items){
  var parts = [];
  (items||[]).forEach(function(n, i){
    parts.push('<div class="step"><div class="snum">' + esc(n.num != null ? n.num : (i+1)) + '</div>' +
      '<div class="st">' + esc(n.t||'') + '</div>' + (n.d ? '<div class="sd">' + esc(n.d) + '</div>' : '') + '</div>');
    if(i < items.length - 1){ parts.push('<div class="sarrow">' + ic('arrow-right') + '</div>'); }
  });
  return '<div class="steps">' + parts.join('') + '</div>';
}

// ---------- matrix / collection grid ----------
export function matrix(items, cols, compact){
  var c = cols || (items && items.length >= 6 ? 3 : 2);
  var cards = (items||[]).map(function(x){
    var rows = (x.fields||[]).map(function(f){ return '<div class="mxrow"><span>' + esc(f.k) + '</span><b>' + esc(f.v) + '</b></div>'; }).join('');
    var tags = (x.tags||[]).length ? '<div class="mxtags">' + x.tags.map(function(t){ return '<span class="mxtag">' + esc(t) + '</span>'; }).join('') + '</div>' : '';
    return '<div class="mxcard"><div class="mxhead">' + (x.num ? '<span class="mxnum">' + esc(x.num) + '</span>' : '') +
      '<span class="mxttl">' + esc(x.t||'') + '</span></div>' +
      (x.desc ? '<div class="mxdesc">' + esc(x.desc) + '</div>' : '') +
      (rows ? '<div class="mxfields">' + rows + '</div>' : '') + tags + '</div>';
  }).join('');
  return '<div class="matrix c' + c + (compact ? ' compact' : '') + '">' + cards + '</div>';
}

// ---------- checklist ----------
export function checklist(items){
  var rows = (items||[]).map(function(x){
    var t = typeof x === 'string' ? x : (x.t||'');
    var b = typeof x === 'object' && x.b ? '<b>' + esc(x.b) + '</b>' : '';
    var txt = typeof x === 'string' ? esc(x) : (esc(x.t||'') + (x.b ? '<b>' + esc(x.b) + '</b>' : '') + (x.d ? esc(x.d) : ''));
    return '<div class="clrow"><div class="clbox">' + ic('check') + '</div><div class="cltxt">' + txt + '</div></div>';
  }).join('');
  return '<div class="checklist">' + rows + '</div>';
}

// ---------- key-value table ----------
export function kv(rows){
  var body = (rows||[]).map(function(r){ return '<div class="kvrow"><span class="kvk">' + esc(r.k) + '</span><span class="kvv">' + esc(r.v) + '</span></div>'; }).join('');
  return '<div class="kv">' + body + '</div>';
}

// ---------- big stats ----------
export function stats(items){
  var s = (items||[]).map(function(x){ return '<div class="stat"><div class="num">' + esc(x.num) + '</div><div class="lb">' + esc(x.label||'') + '</div></div>'; }).join('');
  return '<div class="stats">' + s + '</div>';
}

// ---------- bullet list ----------
export function blist(items){
  var rows = (items||[]).map(function(x, i){
    var head = x.icon ? '<div class="bico">' + ic(x.icon) + '</div>' : '<div class="bidx">' + esc(x.num != null ? x.num : (i+1)) + '</div>';
    return '<div class="brow">' + head + '<div class="btxt"><div class="bt">' + esc(x.t||'') + '</div>' +
      (x.d ? '<div class="bd">' + esc(x.d) + '</div>' : '') + '</div></div>';
  }).join('');
  return '<div class="blist">' + rows + '</div>';
}

// ---------- generic hero dispatcher ----------
export function hero(h){
  if(!h) return '';
  if(h.type === 'browser'){ return browserFrame(h.url, h.ui === 'list' ? mockList() : (h.ui === 'board' ? mockBoard() : mockDashboard())); }
  if(h.type === 'code'){ return codeWindow(h.file, h.lines); }
  if(h.type === 'flow'){ return flow(h.nodes, h.vertical); }
  if(h.type === 'steps'){ return steps(h.nodes || h.items); }
  if(h.type === 'stack'){ return stack(h.layers); }
  if(h.type === 'tiles'){ return tiles(h.items); }
  if(h.type === 'ring'){ return ring(h.center, h.sides); }
  if(h.type === 'matrix'){ return matrix(h.items, h.cols, h.compact); }
  if(h.type === 'checklist'){ return checklist(h.items); }
  if(h.type === 'kv'){ return kv(h.rows); }
  if(h.type === 'stats'){ return stats(h.items); }
  if(h.type === 'blist'){ return blist(h.items); }
  if(h.type === 'compare'){ return compareBlock(h.left || {}, h.right || {}); }
  if(h.type === 'shot'){ return shotFrame(h.url, h.caption, h.src); }
  return '';
}

// ---------- card MAIN builders ----------
export function buildCover(c){
  var title = (c.title||[]).map(function(l){ return hl(l, c.accent); }).join('<br>');
  var out = '<div class="col" style="gap:0">';
  if(c.kicker){ out += '<div class="kicker">' + esc(c.kicker) + '</div>'; }
  out += '<h1 class="headline mt-m">' + title + '</h1>';
  if(c.sub){ out += '<div class="sub mt-m">' + esc(c.sub) + '</div>'; }
  if(c.hero){ out += '<div class="mt-l" style="flex:1;display:flex;align-items:flex-end">' + hero(c.hero) + '</div>'; }
  if(c.tags){ out += '<div class="tags mt-m">' + c.tags.map(chip).join('') + '</div>'; }
  return out + '</div>';
}

export function buildPoint(c){
  var out = '';
  if(c.num){ out += '<div class="ghost">' + esc(c.num) + '</div>'; }
  if(c.label){ out += '<div class="chip accent" style="align-self:flex-start">' + (c.labelIcon ? ic(c.labelIcon) : '') + esc(c.label) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.label ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.body){ out += '<p class="body mt-m" style="max-width:900px">' + esc(c.body) + '</p>'; }
  if(c.hero){ out += '<div class="fill">' + hero(c.hero) + '</div>'; }
  return out;
}

export function buildDiagram(c){
  var out = '';
  if(c.kicker){ out += '<div class="kicker">' + esc(c.kicker) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.hero){ out += '<div class="fill">' + hero(c.hero) + '</div>'; }
  if(c.caption){ out += '<div class="caption mt-m">' + esc(c.caption) + '</div>'; }
  return out;
}

function cmpCol(side, cls){
  var li = ((side && side.items) || []).map(function(x){
    return '<li class="' + (cls === 'new' ? 'yes' : 'non') + '">' + ic(cls === 'new' ? 'check' : 'x') + esc(x) + '</li>';
  }).join('');
  return '<div class="col ' + cls + '"><div class="chead">' + esc((side && side.title) || '') + '</div><ul>' + li + '</ul></div>';
}
export function compareBlock(left, right){ return '<div class="cmp">' + cmpCol(left, 'old') + cmpCol(right, 'new') + '</div>'; }

export function buildCompare(c){
  var out = '';
  if(c.title){ out += '<h2 class="headline sm">' + titleHtml(c.title, c.accent) + '</h2>'; }
  out += '<div class="' + (c.title ? 'mt-l' : '') + '">' + compareBlock(c.left, c.right) + '</div>';
  if(c.caption){ out += '<div class="caption mt-m">' + esc(c.caption) + '</div>'; }
  return out;
}

export function buildEnding(c){
  var out = '';
  if(c.title){ out += '<h2 class="headline sm">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.points && c.points.length){
    var li = c.points.map(function(p){ return '<div class="ri"><span class="ck">' + ic('check') + '</span>' + esc(p) + '</div>'; }).join('');
    out += '<div class="recap mt-l">' + li + '</div>';
  }
  var rowStyle = 'display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:56px;padding-top:32px;border-top:1px solid var(--border)';
  out += '<div style="' + rowStyle + '"><div><div class="kicker">' + esc(c.ctaKicker||'') + '</div>' +
    '<div class="headline xs mt-s" style="font-size:40px">' + esc(c.cta||'') + '</div></div>' +
    (c.qr ? '<div class="qr"></div>' : '') + '</div>';
  return out;
}

export function buildList(c){
  var out = '';
  if(c.kicker){ out += '<div class="kicker' + (c.kickerPill ? ' pill' : '') + '">' + esc(c.kicker) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.body){ out += '<p class="body mt-s" style="max-width:920px">' + esc(c.body) + '</p>'; }
  if(c.items || c.points){
    var items = c.items || (c.points||[]).map(function(p){ return {t:p}; });
    out += '<div class="mt-l">' + blist(items) + '</div>';
  }
  return out;
}

export function buildQuote(c){
  var out = '<div class="qmark">“</div>';
  out += '<div class="bigquote">' + hl(c.quote || c.title || '', c.accent) + '</div>';
  if(c.author){ out += '<div class="qauthor">— ' + esc(c.author) + '</div>'; }
  return out;
}

export function buildGrid(c){
  var out = '';
  if(c.kicker){ out += '<div class="kicker' + (c.kickerPill ? ' pill' : '') + '">' + esc(c.kicker) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.hero){ out += '<div class="fill">' + hero(c.hero) + '</div>'; }
  else if(c.items){ out += '<div class="mt-l">' + matrix(c.items, c.cols, c.compact) + '</div>'; }
  if(c.caption){ out += '<div class="caption mt-s">' + esc(c.caption) + '</div>'; }
  return out;
}

export function buildStat(c){
  var out = '';
  if(c.kicker){ out += '<div class="kicker' + (c.kickerPill ? ' pill' : '') + '">' + esc(c.kicker) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>'; }
  if(c.body){ out += '<p class="body mt-s">' + esc(c.body) + '</p>'; }
  if(c.stats){ out += '<div class="mt-l">' + stats(c.stats) + '</div>'; }
  if(c.caption){ out += '<div class="caption mt-m">' + esc(c.caption) + '</div>'; }
  return out;
}

export function buildCard(c){
  if(c.variant === 'cover') return buildCover(c);
  if(c.variant === 'point') return buildPoint(c);
  if(c.variant === 'diagram') return buildDiagram(c);
  if(c.variant === 'compare') return buildCompare(c);
  if(c.variant === 'ending') return buildEnding(c);
  if(c.variant === 'list') return buildList(c);
  if(c.variant === 'quote') return buildQuote(c);
  if(c.variant === 'grid') return buildGrid(c);
  if(c.variant === 'stat') return buildStat(c);
  return '<h2 class="headline sm">' + hl(c.title||'', c.accent) + '</h2>';
}