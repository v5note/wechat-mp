// scripts/visuals.mjs — 卡片视觉组件库（纯字符串拼装，输出 HTML 片段）
// 所有组件遵守 references/image-design-system.md 的规范。

export function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
export function ic(name){ return '<svg class="ic"><use href="#ic-' + name + '"/></svg>'; }
export function hl(text, accent){
  text = String(text == null ? '' : text);
  if(!accent){ return esc(text); }
  var i = text.indexOf(accent);
  if(i < 0){ return esc(text); }
  return esc(text.slice(0,i)) + '<span class="acc">' + esc(accent) + '</span>' + esc(text.slice(i+accent.length));
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
  var card = function(num,w){ return '<div class="mcard"><div class="mnum">' + num + '</div><div class="ml ' + w + '"></div></div>'; };
  var heights = [42,64,50,78,58,88,70];
  var bars = heights.map(function(h){ return '<div class="mbar" style="height:' + h + '%"></div>'; }).join('');
  return '<div class="mock">' + sidebar(6) + '<div class="mmain">' +
    '<div class="mrow">' + card('128','w2') + card('24','w3') + card('96%','w1') + '</div>' +
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

// ---------- generic hero dispatcher ----------
export function hero(h){
  if(!h) return '';
  if(h.type === 'browser'){ return browserFrame(h.url, h.ui === 'list' ? mockList() : (h.ui === 'board' ? mockBoard() : mockDashboard())); }
  if(h.type === 'code'){ return codeWindow(h.file, h.lines); }
  if(h.type === 'flow'){ return flow(h.nodes, h.vertical); }
  if(h.type === 'stack'){ return stack(h.layers); }
  if(h.type === 'tiles'){ return tiles(h.items); }
  if(h.type === 'ring'){ return ring(h.center, h.sides); }
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
  if(c.title){ out += '<h2 class="headline sm ' + (c.label ? 'mt-m' : '') + '">' + hl(c.title, c.accent) + '</h2>'; }
  if(c.body){ out += '<p class="body mt-m" style="max-width:900px">' + esc(c.body) + '</p>'; }
  if(c.hero){ out += '<div class="fill">' + hero(c.hero) + '</div>'; }
  return out;
}

export function buildDiagram(c){
  var out = '';
  if(c.kicker){ out += '<div class="kicker">' + esc(c.kicker) + '</div>'; }
  if(c.title){ out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + hl(c.title, c.accent) + '</h2>'; }
  if(c.hero){ out += '<div class="fill">' + hero(c.hero) + '</div>'; }
  if(c.caption){ out += '<div class="caption mt-m">' + esc(c.caption) + '</div>'; }
  return out;
}

export function buildCompare(c){
  var col = function(side, cls){
    var li = (side.items||[]).map(function(x){
      return '<li class="' + (cls === 'new' ? 'yes' : 'non') + '">' + ic(cls === 'new' ? 'check' : 'x') + esc(x) + '</li>';
    }).join('');
    return '<div class="col ' + cls + '"><div class="chead">' + esc(side.title||'') + '</div><ul>' + li + '</ul></div>';
  };
  var out = '';
  if(c.title){ out += '<h2 class="headline sm">' + hl(c.title, c.accent) + '</h2>'; }
  out += '<div class="cmp ' + (c.title ? 'mt-l' : '') + '">' + col(c.left,'old') + col(c.right,'new') + '</div>';
  if(c.caption){ out += '<div class="caption mt-m">' + esc(c.caption) + '</div>'; }
  return out;
}

export function buildEnding(c){
  var out = '';
  if(c.title){ out += '<h2 class="headline sm">' + hl(c.title, c.accent) + '</h2>'; }
  if(c.points && c.points.length){
    var li = c.points.map(function(p){ return '<div class="ri"><span class="ck">' + ic('check') + '</span>' + esc(p) + '</div>'; }).join('');
    out += '<div class="recap mt-l">' + li + '</div>';
  }
  var rowStyle = 'display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:56px;padding-top:32px;border-top:1px solid var(--border)';
  out += '<div style="' + rowStyle + '"><div><div class="kicker">' + esc(c.ctaKicker||'GET STARTED') + '</div>' +
    '<div class="headline xs mt-s" style="font-size:40px">' + esc(c.cta||'') + '</div></div>' +
    (c.qr ? '<div class="qr"></div>' : '') + '</div>';
  return out;
}

export function buildCard(c){
  if(c.variant === 'cover') return buildCover(c);
  if(c.variant === 'point') return buildPoint(c);
  if(c.variant === 'diagram') return buildDiagram(c);
  if(c.variant === 'compare') return buildCompare(c);
  if(c.variant === 'ending') return buildEnding(c);
  return '<h2 class="headline sm">' + hl(c.title||'', c.accent) + '</h2>';
}