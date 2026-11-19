// scripts/visuals.mjs — 卡片视觉组件库（纯字符串拼装，输出 HTML 片段）
// 所有组件遵守 references/image-design-system.md 的规范。
import { readFileSync } from 'node:fs';
import { qrSvg } from './qr.mjs';
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


// ============================================================
// 画面风格组件（手机 / 电脑 / 卡片 / 流程图 / 产品宣传图）
// 参考：手机截图流、桌面端演示、Bento 卡片墙、流程图解、产品宣发海报
// ============================================================

// 测试钩子：prerender 时可让指定 URL 渲染成空心占位，用于验证「二维码内容与链接一致」
export const qrTestHooks = { onRender: function(){ return null; } };

let _uid = 0;
function uid(prefix){ _uid += 1; return prefix + '-' + _uid; }

// ---------- phone mockup ----------
function phoneStatus(o){
  return '<div class="pstatus"><span class="ptime">' + esc(o.time || '9:41') + '</span>' +
    '<span class="pstat"><i class="pbar b1"></i><i class="pbar b2"></i><i class="pbar b3"></i><i class="pbatt"></i></span></div>';
}
function phoneChat(o){
  const msgs = o.messages || [
    { from: 'them', text: '把仓库地址发我，我帮你画一张架构图' },
    { from: 'me', text: 'https://github.com/acme/atlas' },
    { from: 'them', text: '解析完成：42 个模块，3 处循环依赖', card: { t: '架构图已生成', s: 'PNG / SVG / 链接' } }
  ];
  const body = msgs.map(function(m){
    const cls = m.from === 'me' ? ' me' : '';
    const card = m.card ? '<div class="pmcard"><div class="pic"></div><div><div class="pt">' + esc(m.card.t || '') +
      '</div><div class="ps">' + esc(m.card.s || '') + '</div></div></div>' : '';
    return '<div class="pmsg' + cls + '">' + esc(m.text || '') + card + '</div>';
  }).join('');
  return '<div class="pchathead"><span class="pback">‹</span><span class="pav">' + esc(o.avatar || (o.name || 'A').charAt(0)) + '</span>' +
    '<span class="pname">' + esc(o.name || 'Atlas 助手') + '</span><span class="pdots">···</span></div>' +
    '<div class="pmsgs"><div class="pday">' + esc(o.day || '今天 09:41') + '</div>' + body + '</div>' +
    '<div class="pinput"><span class="pplus">+</span><span class="pfield">' + esc(o.input || '发消息…') + '</span></div>';
}
function phoneFeed(o){
  const items = o.items || [
    { t: '一张图看懂整个项目', d: '架构 / 调用 / 依赖' },
    { t: '新人接手，先看这三张图', d: '入口 / 模块 / 数据' },
    { t: '循环依赖，怎么拆', d: '识别 / 解耦 / 验证' }
  ];
  const first = items[0] || {};
  const rows = items.slice(1).map(function(x){
    return '<div class="plistrow"><div class="pdot"></div><div class="pl"><b>' + esc(x.t || '') + '</b><span>' + esc(x.d || '') + '</span></div></div>';
  }).join('');
  return '<div class="pfeedhead"><b>' + esc(o.title || '发现') + '</b><span class="psearch">' + ic('search') + ' 搜索</span></div>' +
    '<div class="pfeature"><div class="pthumb"></div><div class="pftxt"><b>' + esc(first.t || '') + '</b><span>' + esc(first.d || '') + '</span></div></div>' +
    rows +
    '<div class="ptabbar"><span class="ptab on">' + ic('spark') + '精选</span><span class="ptab">' + ic('grid') + '专题</span>' +
    '<span class="ptab">' + ic('users') + '关注</span><span class="ptab">' + ic('cube') + '我的</span></div>';
}
function phoneApp(o){
  const stats = o.stats || [{ num: '42', label: '模块' }, { num: '3', label: '循环依赖' }, { num: '8', label: '入口' }];
  const rows = o.items || [
    { icon: 'layers', t: '架构图已更新', d: '2 分钟前 · 42 个模块' },
    { icon: 'branch', t: '发现 3 处循环依赖', d: '建议先解耦 core 与 api' },
    { icon: 'share', t: '导出 PNG / SVG', d: '可直接放进评审文档' }
  ];
  const statHtml = stats.map(function(s){ return '<div class="pstatbox"><b>' + esc(s.num) + '</b><span>' + esc(s.label) + '</span></div>'; }).join('');
  const rowHtml = rows.map(function(x){
    return '<div class="papprow"><div class="pic">' + ic(x.icon || 'cube') + '</div><div class="ptxt"><b>' + esc(x.t || '') +
      '</b><span>' + esc(x.d || '') + '</span></div><span class="pgo">›</span></div>';
  }).join('');
  const heights = [38, 62, 48, 76, 54, 88, 66];
  const bars = heights.map(function(h){ return '<i style="height:' + h + '%"></i>'; }).join('');
  return '<div class="papphead"><b>' + esc(o.title || '工作台') + '</b><span class="pav">' + esc(o.avatar || 'A') + '</span></div>' +
    '<div class="pstatrow">' + statHtml + '</div>' +
    '<div class="papphero"><div class="pht">' + esc(o.chartTitle || '本周结构变化') + '</div><div class="phb">' + bars + '</div></div>' +
    '<div class="papplist">' + rowHtml + '</div>' +
    '<div class="ptabbar"><span class="ptab on">' + ic('grid') + '概览</span><span class="ptab">' + ic('layers') + '项目</span>' +
    '<span class="ptab">' + ic('chart') + '报表</span><span class="ptab">' + ic('users') + '我的</span></div>';
}
export function phone(o){
  o = o || {};
  const screen = o.screen || 'chat';
  const inner = screen === 'feed' ? phoneFeed(o) : (screen === 'app' ? phoneApp(o) : phoneChat(o));
  return '<div class="phonewrap"><div class="phone">' +
    '<span class="pside vol"></span><span class="pside vol2"></span><span class="pside pwr"></span>' +
    '<div class="pscreen">' + phoneStatus(o) + '<div class="pbody">' + inner + '</div></div>' +
    '<div class="pnotch"></div><div class="phome"></div>' +
    '</div></div>';
}

// ---------- desktop / mac window ----------
function deskContent(o){
  const ui = o.ui || 'dashboard';
  if(ui === 'editor') {
    const lines = (o.lines || [
      'import { parse } from "./core"',
      'import { render } from "./view"',
      '',
      'const repo = parse(input);',
      'const graph = build(repo);',
      'render(graph, { theme: "dark" });'
    ]).map(function(l, i){
      return '<span class="' + (i === 3 ? 'ck' : (i === 4 ? 'cs' : '')) + '">' + esc(l) + '</span>';
    }).join('\n');
    return '<div class="dcode">' + lines + '</div>';
  }
  if(ui === 'list') {
    // 关键词清单：首图里用，只放名词与数字，不放句子
    const lines = (o.list || ['五步出稿清单', '2 版本 × 2 格式', '视频号三件套']).map(function(t, i){
      return '<div class="lrow' + (i === 0 ? ' on' : '') + '"><span class="lno">' + (i + 1) + '</span><span>' + esc(t) + '</span></div>';
    }).join('');
    return '<div class="llist">' + lines + '</div>';
  }
  if(ui === 'board') {
    const col = function(n, extra){
      let s = '<div class="mcard" style="flex:1;gap:8px">';
      for (let i = 0; i < n; i++) s += '<div class="ml ' + (i % 2 ? 'w2' : 'w3') + '"></div>';
      return s + '</div>';
    };
    return '<div class="drow" style="flex:1">' + col(3) + col(4) + col(2) + '</div>';
  }
  const stats = o.stats || [{ num: '42', label: '模块' }, { num: '128', label: '依赖' }, { num: '3', label: '待处理' }];
  const statHtml = stats.map(function(s){
    var big = s.num != null ? s.num : s.v;
    var lb = s.label != null ? s.label : s.k;
    return '<div class="dstat"><b>' + esc(big) + '</b><span>' + esc(lb) + '</span></div>';
  }).join('');
  const heights = [42, 66, 52, 78, 58, 88, 70, 62];
  const bars = heights.map(function(h){ return '<i class="mbar" style="height:' + h + '%"></i>'; }).join('');
  return '<div class="dstatrow">' + statHtml + '</div>' +
    '<div class="dchart">' + bars + '</div>' +
    '<div class="drow"><div class="mcard"><div class="ml w2"></div><div class="ml w1"></div></div>' +
    '<div class="mcard"><div class="ml w3"></div><div class="ml w2"></div></div></div>';
}
export function desktop(o){
  o = o || {};
  // 可选尺寸：viewH 控制窗口正文高度，size=sm 时整体更紧凑（首图里用）
  var winStyle = '';
  if (o.size === 'sm' || o.viewH) winStyle = '--winbody:' + (o.viewH || 270) + 'px;--winhead:' + (o.size === 'sm' ? 40 : 50) + 'px';
  var nav = o.nav || [
    { icon: 'grid', t: '概览' }, { icon: 'layers', t: '项目' }, { icon: 'branch', t: '架构图' },
    { icon: 'chart', t: '调用链' }, { icon: 'cube', t: '设置' }
  ];
  const navHtml = nav.map(function(n, i){
    return '<div class="wnav' + (i === 0 ? ' on' : '') + '">' + ic(n.icon || 'cube') + esc(n.t || '') + '</div>';
  }).join('');
  const tabs = (o.tabs || ['概览', '结构', '导出']).map(function(t, i){
    return '<span class="wintab' + (i === 0 ? ' on' : '') + '">' + esc(t) + '</span>';
  }).join('');
  const dock = o.dock === false ? '' : '<div class="ddock"><i class="on"></i><i></i><i></i><i></i><i></i></div>';
  return '<div class="desktop' + (o.size === 'sm' ? ' sm' : '') + '"' + (winStyle ? ' style="' + winStyle + '"' : '') + '>' +
    '<div class="menubar"><span class="mblogo">◆</span><span class="mbmenu">文件</span><span class="mbmenu">编辑</span>' +
    '<span class="mbmenu">视图</span><span class="mbmenu">窗口</span><span class="mbmenu">帮助</span>' +
    '<span class="mbright">' + esc(o.time || '9:41') + '</span></div>' +
    '<div class="deskwin"><div class="winbar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span>' +
    '<span class="wintitle">' + esc(o.app || 'Atlas Studio') + '</span><span class="wintabs">' + tabs + '</span></div>' +
    '<div class="winbody"><div class="winside">' + navHtml + '</div><div class="winc">' + deskContent(o) + '</div></div></div>' +
    dock + '</div>';
}

// ---------- bento / card wall ----------
export function bento(items, cols, compact){
  const c = cols || (items && items.length >= 6 ? 3 : 2);
  const cells = (items || []).map(function(x, i){
    // CSS 里 .bcell 基类用 ink/accent 作色块名，所以浅色主题的墨色块统一输出成 "ink solid"
    const cls = 'bcell' + (x.span ? ' span' + x.span : '') + (x.tall ? ' tall' : '') + (x.tone === 'ink' ? ' ink solid' : (x.tone ? ' ' + x.tone : ''));
    const head = x.icon ? '<div class="bico">' + ic(x.icon) + '</div>' : '';
    const num = x.num != null ? '<div class="bignum">' + esc(x.num) + '</div>' : '';
    const tags = (x.tags || []).length ? '<div class="btags">' + x.tags.map(function(t){ return '<span class="btag">' + esc(t) + '</span>'; }).join('') + '</div>' : '';
    return '<div class="' + cls + '" style="color:' + (x.tone ? '#fff' : 'var(--text)') + '">' + head + '<div class="bt">' + esc(x.t || '') + '</div>' +
      (x.d ? '<div class="bd">' + esc(x.d) + '</div>' : '') + num + tags +
      (x.ghost ? '<div class="bnum">' + esc(x.ghost) + '</div>' : '') + '</div>';
  }).join('');
  return '<div class="bento c' + c + '">' + cells + '</div>';
}

// ---------- flowchart (HTML nodes + SVG connectors) ----------
export function flowchart(o){
  o = o || {};
  const W = 936, cx = W / 2;
  const nodes = [], edges = [], labels = [];
  let y = 0;
  const start = { kind: 'start', x: cx - 190, y: 0, w: 380, h: 76, t: o.start || '开始' };
  nodes.push(start); y = 76 + 52;
  const steps = o.steps || [];
  steps.forEach(function(s, i){
    nodes.push({ kind: 'step', x: cx - 280, y: y, w: 560, h: 88, t: s.t || '', d: s.d || '', num: s.num || (i + 1) });
    y += 88 + 44;
  });
  const dec = o.decision ? { kind: 'decision', x: cx - 180, y: y, w: 360, h: 168, t: o.decision.q || '' } : null;
  if (dec) { nodes.push(dec); y += 168 + 42; }
  let yes = null, no = null;
  if (dec) {
    const bw = 356, bh = 124;
    yes = { kind: 'branch', x: 20, y: y, w: bw, h: bh, t: (o.decision.yes || {}).t || '是', d: (o.decision.yes || {}).d || '', tag: o.yesLabel || '是' };
    no = { kind: 'branch', x: W - 20 - bw, y: y, w: bw, h: bh, t: (o.decision.no || {}).t || '否', d: (o.decision.no || {}).d || '', tag: o.noLabel || '否' };
    nodes.push(yes, no); y += bh + 44;
  }
  const end = { kind: 'end', x: cx - 190, y: y, w: 380, h: 76, t: o.end || '结束' };
  nodes.push(end);
  const H = y + 76;

  const chain = [start].concat(steps.map(function(s, i){ return nodes[1 + i]; }));
  if (dec) chain.push(dec);
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i], b = chain[i + 1];
    edges.push({ d: 'M ' + cx + ' ' + (a.y + a.h) + ' L ' + cx + ' ' + b.y });
  }
  if (!dec) {
    const last = steps.length ? nodes[steps.length] : start;
    edges.push({ d: 'M ' + cx + ' ' + (last.y + last.h) + ' L ' + cx + ' ' + end.y });
  } else {
    const dcy = dec.y + dec.h / 2;
    const ycx = yes.x + yes.w / 2, ncx = no.x + no.w / 2;
    edges.push({ d: 'M ' + dec.x + ' ' + dcy + ' L ' + ycx + ' ' + dcy + ' L ' + ycx + ' ' + yes.y });
    edges.push({ d: 'M ' + (dec.x + dec.w) + ' ' + dcy + ' L ' + ncx + ' ' + dcy + ' L ' + ncx + ' ' + no.y });
    labels.push({ x: (dec.x + ycx) / 2 - 14, y: dcy - 34, t: o.yesLabel || '是' });
    labels.push({ x: (dec.x + ncx) / 2 - 14, y: dcy - 34, t: o.noLabel || '否' });
    const mergeY = yes.y + yes.h + 22;
    edges.push({ d: 'M ' + ycx + ' ' + (yes.y + yes.h) + ' L ' + ycx + ' ' + mergeY + ' L ' + cx + ' ' + mergeY + ' L ' + cx + ' ' + end.y });
    edges.push({ d: 'M ' + ncx + ' ' + (no.y + no.h) + ' L ' + ncx + ' ' + mergeY + ' L ' + cx + ' ' + mergeY + ' L ' + cx + ' ' + end.y });
  }

  const mid = uid('fc');
  const nodeHtml = nodes.map(function(n){
    const style = 'left:' + n.x + 'px;top:' + n.y + 'px;width:' + n.w + 'px;height:' + n.h + 'px';
    if (n.kind === 'decision') {
      return '<div class="fcdecision" style="' + style + '"><svg viewBox="0 0 ' + n.w + ' ' + n.h + '" preserveAspectRatio="none">' +
        '<polygon points="' + (n.w / 2) + ',2 ' + (n.w - 2) + ',' + (n.h / 2) + ' ' + (n.w / 2) + ',' + (n.h - 2) + ' 2,' + (n.h / 2) + '"></polygon></svg>' +
        '<div class="fdtext">' + esc(n.t) + '</div></div>';
    }
    const cls = 'fcnode ' + n.kind;
    return '<div class="' + cls + '" style="' + style + '">' +
      (n.num != null ? '<div class="fcnum">' + esc(n.num) + '</div>' : '') +
      (n.tag ? '<div class="fctag">' + esc(n.tag) + '</div>' : '') +
      '<div class="fct">' + esc(n.t) + '</div>' + (n.d ? '<div class="fcd">' + esc(n.d) + '</div>' : '') + '</div>';
  }).join('');

  const edgeHtml = edges.map(function(e){
    return '<path class="fcedge" d="' + e.d + '" marker-end="url(#' + mid + ')"></path>';
  }).join('');
  const labelHtml = labels.map(function(l){
    return '<div class="fclabel" style="left:' + l.x + 'px;top:' + l.y + 'px">' + esc(l.t) + '</div>';
  }).join('');

  return '<div class="flowchartwrap"><div class="fchart" style="width:' + W + 'px;height:' + H + 'px">' +
    '<svg class="fclines" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    '<defs><marker id="' + mid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
    '<path class="fcarrow" d="M0,0 L10,5 L0,10 z"></path></marker></defs>' + edgeHtml + '</svg>' +
    nodeHtml + labelHtml + '</div></div>';
}

// ---------- product promo stage ----------
export function promoStage(o){
  o = o || {};
  let device;
  if (o.src) {
    device = '<div class="pdev pdev-shot"><div class="shot"><img src="' + dataUri(o.src) + '"></div></div>';
  } else if (o.device === 'desktop') {
    device = '<div class="pdev pdev-desk">' + desktop({ app: o.app || 'Atlas Studio', ui: o.ui || 'dashboard', dock: false }) + '</div>';
  } else {
    device = '<div class="pdev pdev-phone">' + phone({ screen: o.screen || 'app', name: o.app || 'Atlas', items: o.items }) + '</div>';
  }
  const tags = (o.tags || ['一句话出图', '四种视图', '随仓库更新']).slice(0, 3);
  const floats = tags.map(function(t, i){ return '<div class="pfloat f' + (i + 1) + '">' + ic('check') + esc(t) + '</div>'; }).join('');
  const price = o.price ? '<div class="pprice"><b>' + esc(o.price) + '</b>' + (o.priceNote ? '<span>' + esc(o.priceNote) + '</span>' : '') + '</div>' : '';
  return '<div class="pstage"><div class="pglow"></div><div class="pring"></div>' + device + floats + price + '</div>';
}

// ---------- new card builders ----------
export function buildPhone(c){
  const heroHtml = hero(c.hero || { type: 'phone', screen: c.screen || 'chat', name: c.app, messages: c.messages, items: c.items });
  const text = '<div class="sdtext">' +
    (c.kicker ? '<div class="sdkicker">' + esc(c.kicker) + '</div>' : '') +
    (c.title ? '<h2 class="headline">' + titleHtml(c.title, c.accent) + '</h2>' : '') +
    (c.sub ? '<div class="sdbody">' + esc(c.sub) + '</div>' : '') +
    ((c.points || []).length ? '<div class="sdpoints">' + c.points.map(function(p){ return '<div class="sdpoint">' + ic('check') + esc(p) + '</div>'; }).join('') + '</div>' : '') +
    '<div class="tags">' + (c.tags || []).map(chip).join('') + '</div></div>';
  if (c.layout === 'stack') {
    return (c.kicker ? '<div class="kicker">' + esc(c.kicker) + '</div>' : '') +
      (c.title ? '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>' : '') +
      (c.sub ? '<div class="body mt-s">' + esc(c.sub) + '</div>' : '') +
      '<div class="fill">' + heroHtml + '</div>';
  }
  return '<div class="splitdevice phone-split">' + text + '<div class="sdvis">' + heroHtml + '</div></div>';
}

export function buildDesktop(c){
  let out = '';
  if (c.kicker) out += '<div class="kicker">' + esc(c.kicker) + '</div>';
  if (c.title) out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>';
  if (c.body) out += '<p class="body mt-s" style="max-width:940px">' + esc(c.body) + '</p>';
  out += '<div class="fill">' + hero(c.hero || { type: 'desktop', app: c.app, ui: c.ui }) + '</div>';
  if (c.caption) out += '<div class="caption mt-s">' + esc(c.caption) + '</div>';
  return out;
}

export function buildBento(c){
  let out = '';
  if (c.kicker) out += '<div class="kicker' + (c.kickerPill ? ' pill' : '') + '">' + esc(c.kicker) + '</div>';
  if (c.title) out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>';
  if (c.body) out += '<p class="body mt-s" style="max-width:940px">' + esc(c.body) + '</p>';
  out += '<div class="fill">' + hero(c.hero || { type: 'bento', items: c.items, cols: c.cols }) + '</div>';
  if (c.caption) out += '<div class="caption mt-s">' + esc(c.caption) + '</div>';
  return out;
}

export function buildFlowchart(c){
  let out = '';
  if (c.kicker) out += '<div class="kicker">' + esc(c.kicker) + '</div>';
  if (c.title) out += '<h2 class="headline sm ' + (c.kicker ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h2>';
  out += '<div class="fill">' + hero(c.hero || { type: 'flowchart', start: c.start, steps: c.steps, decision: c.decision, end: c.end }) + '</div>';
  if (c.caption) out += '<div class="caption mt-s">' + esc(c.caption) + '</div>';
  return out;
}

export function buildPromo(c){
  let out = '';
  if (c.promoBadge) out += '<div class="promobadge">' + (c.badgeIcon ? ic(c.badgeIcon) : '') + esc(c.promoBadge) + '</div>';
  if (c.title) out += '<h1 class="headline ' + (c.promoBadge ? 'mt-m' : '') + '">' + titleHtml(c.title, c.accent) + '</h1>';
  if (c.sub) out += '<div class="sub mt-s" style="max-width:820px">' + esc(c.sub) + '</div>';
  out += '<div class="promostage-wrap fill">' + hero(c.hero || { type: 'promo' }) + '</div>';
  if ((c.points || []).length || c.cta) {
    out += '<div class="promobar"><div class="promopoints">' +
      (c.points || []).map(function(p){ return '<div class="pp">' + ic('check') + esc(p) + '</div>'; }).join('') +
      '</div>' + (c.cta ? '<div class="promocta">' + esc(c.cta) + '</div>' : '') + '</div>';
  }
  // 宣传卡也可带真实二维码：qr 传 URL 或 {url,label}
  var q = typeof c.qr === 'object' && c.qr ? c.qr : (typeof c.qr === 'string' ? { url: c.qr } : null);
  if (q && q.url) {
    out += '<div class="pqrcard"><div class="pqrbox">' + qrSvg(q.url, { logoText: q.logoText, fg: '#111111' }) + '</div>' +
      '<div class="pqrtxt"><div class="pqrb">' + esc(q.label || '扫码打开') + '</div>' +
      '<div class="pqru">' + esc(String(q.url).replace(/^https?:\/\//, '')) + '</div></div></div>';
  }
  return out;
}

export const CARD_VARIANTS = ['cover', 'point', 'diagram', 'compare', 'list', 'grid', 'stat', 'quote', 'ending', 'phone', 'desktop', 'bento', 'flowchart', 'promo'];

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
  if(h.type === 'phone'){ return phone(h); }
  if(h.type === 'desktop'){ return desktop(h); }
  if(h.type === 'bento'){ return bento(h.items, h.cols, h.compact); }
  if(h.type === 'flowchart'){ return flowchart(h); }
  if(h.type === 'promo'){ return promoStage(h); }
  if(h.type === 'compare'){ return compareBlock(h.left || {}, h.right || {}); }
  if(h.type === 'shot'){ return shotFrame(h.url, h.caption, h.src); }
  if(h.type === 'coverthumb'){ return '<div class="coverthumb"><img src="' + dataUri(h.src) + '"></div>'; }
  return '';
}

// ---------- card MAIN builders ----------
// 封面卡 = 首屏钩子：大标题 + 一句钩子副标 + 首屏预览 + 卖点条
// 设计依据见 references/image-design-system.md 4.1；标题字号按最长一行长度自动降档，保证两行不挤。
function hookClass(title){
  var maxLen = Math.max.apply(null, (title||['']).map(function(l){ return String(l).length; }));
  if(maxLen <= 7) return 'headline hook';
  if(maxLen <= 10) return 'headline hook2';
  return 'headline hook3';
}

function badgePill(t){
  var on = /^★/.test(String(t));
  return '<span class="chip' + (on ? ' accent' : '') + '">' + esc(String(t).replace(/^★\s*/, on ? '★ ' : '')) + '</span>';
}

// 首屏预览：缩略图按规范只能出现关键词预览或图形占位，不塞正文（4.1 缩略图规则）
function coverThumbs(items){
  if(!items || !items.length) return '';
  var cells = items.map(function(it){
    if(it.variant === 'ending'){
      return '<div class="thumb ending"><div class="tb tb-k">结尾</div><div class="tb tb-t">' + hl(it.title||'关注', '') + '</div><div class="tb-qr"></div></div>';
    }
    var big = it.big ? '<div class="tb tb-a"></div>' : '<div class="tb tb-c"></div><div class="tb tb-b"></div>';
    return '<div class="thumb"><div class="tb tb-k">' + esc(it.kicker||'') + '</div><div class="tb tb-t">' + hl(it.t||'', it.accent||'') + '</div>' + big + '</div>';
  }).join('');
  var more = items.more ? '<div class="thumb rm"><div class="tb-more">+' + esc(items.more) + ' 张</div></div>' : '';
  return '<div class="thumbs"><div class="thumbs-hd">往下<br>还有</div>' + cells + more + '</div>';
}

// 首图版面（cover.layout）：8 种来自 references/style-cases 的版面骨架
// 未指定 layout 时走默认骨架（大标题 + 副标 + 首屏预览/主视觉 + 卖点条）
function layoutEyebrow(o){
  var bg = o.eyebrow;
  if(!bg) return '';
  return '<div class="hband">' + esc(bg) + '</div>';
}
function layoutStrip(o){ return o.strip ? '<div class="bandline">' + esc(o.strip) + '</div>' : ''; }
function layoutNote(o){ return o.note ? '<div class="note">' + esc(o.note) + '</div>' : ''; }
function layoutBar(o){
  if(!o.bar || !o.bar.length) return '';
  return '<div class="hbar">' + o.bar.map(function(b, i){ return '<div class="hchip' + (i === 1 ? ' on' : '') + '">' + esc(b) + '</div>'; }).join('') + '</div>';
}

// annotated-illu / tool-brief：浅底大标题 + 说明 + 主视觉，手写感靠小注实现
function coverAnnotated(o){
  var out = '';
  if(o.accentBg){ out += '<div class="hband">' + esc(o.accentBg) + '</div>'; }
  if(o.note) out += '<div class="note">' + esc(o.note) + '</div>';
  if(o.hero) out += hero(o.hero);
  if(o.tiles && o.tiles.length){
    out += '<div class="board">' + o.tiles.slice(0, 6).map(function(t){
      return '<div class="tilelogo"><span class="nm">' + esc(t.badge || (t.name || '?').slice(0, 1)) + '</span><span>' + esc(t.name || t.t) + '</span></div>';
    }).join('') + '</div>';
  }
  return out;
}

// tool-brief（工具速评）：眉标 → 超大两行标题 → 两行定位 → 真截图/多端窗口 → 底部双 pill
function coverToolBrief(o){
  var out = '';
  if(o.hero){ out += hero(o.hero); }
  if(o.note){ out += '<div class="tbn">' + esc(o.note) + '</div>'; }
  if(o.pills && o.pills.length){
    out += '<div class="tbpills">' + o.pills.map(function(p, i){
      return '<div class="tbp' + (i === 0 ? ' solid' : '') + '"><b>' + esc(p.t) + '</b>' + (p.d ? '<span>' + esc(p.d) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  return out;
}

// dev-dark（深色技术）：截图/流转图 + 2×2 能力格 + 底部边界提醒
function coverDevDark(o){
  var pts = (o.points || []).slice(0, 4).map(function(p){
    return '<div class="hcell"><b>' + esc(p.t) + '</b>' + esc(p.d || '') + '</div>';
  }).join('');
  var out = '';
  if(o.hero){ out += hero(o.hero); }
  out += '<div class="hgrid">' + pts + '</div>';
  if(o.strip){ out += '<div class="ddnote"><b>先了解：</b>' + esc(o.strip.replace(/^先了解[:：]\s*/, '')) + '</div>'; }
  return out;
}

// color-grid：编号格 + 一句话条
function coverColorGrid(o){
  var cells = (o.cells || []).slice(0, 6).map(function(c, i){
    return '<div class="hcell" style="border-top:5px solid var(--accent)"><b>' + esc(String(i + 1).padStart(2, '0') + '  ' + c.t) + '</b>' + esc(c.d || '') + '</div>';
  }).join('');
  var bar = '';
  if(o.formula){ bar = '<div class="bandline">' + esc(o.formula) + '</div>'; }
  return bar + '<div class="hgrid">' + cells + '</div>' + layoutStrip(o);
}

// bento-stack：主视觉铺底 + 宣言卡
function coverBentoStack(o){
  return (o.hero ? hero(o.hero) : '') + (o.declare ? '<div class="bandline">' + esc(o.declare) + '</div>' : '');
}

// layout-sample：4 张样张并排
function coverLayoutSample(o){
  if(!o.samples || !o.samples.length) return '';
  return '<div class="thumb4">' + o.samples.slice(0, 4).map(function(s){
    return '<div><div class="s">' + (s.src ? '<img src="' + dataUri(s.src) + '">' : '') + '</div><div class="cap">' + esc(s.t || '') + '</div></div>';
  }).join('') + '</div>' + layoutStrip(o);
}

// diagram-poster：一张图解做主体
function coverDiagramPoster(o){
  return (o.hero ? hero(o.hero) : '') + (o.summary ? '<div class="note">' + esc(o.summary) + '</div>' : '');
}

// pin-red：品牌图块入标题 + 点阵 + 4 宫格要点
function coverPinRed(o){
  var out = '';
  if(o.tiles && o.tiles.length){
    out += '<div class="hgrid" style="grid-template-columns:repeat(4,1fr);gap:10px">' + o.tiles.slice(0, 4).map(function(t){
      return '<div class="hcell" style="text-align:center;padding:14px 8px"><b style="font-size:22px">' + esc(t.t) + '</b>' + esc(t.d || '') + '</div>';
    }).join('') + '</div>';
  }
  if(o.points) out += o.points.map(function(p){ return '<div class="note">' + esc(p) + '</div>'; }).join('');
  return out;
}

const COVER_LAYOUTS = {
  'annotated-illu': coverAnnotated,
  'tool-brief': coverToolBrief,
  'dev-dark': coverDevDark,
  'color-grid': coverColorGrid,
  'bento-stack': coverBentoStack,
  'layout-sample': coverLayoutSample,
  'diagram-poster': coverDiagramPoster,
  'pin-red': coverPinRed,
};

export function buildCover(c){
  var title = (c.title||[]).map(function(l){ return hl(l, c.accent); }).join('<br>');
  var out = '<div class="col covercard" style="gap:0">';
  if(c.eyebrow){ out += layoutEyebrow(c); }
  out += '<h1 class="' + hookClass(c.title) + '" style="margin-top:' + (c.eyebrow ? '18px' : '0') + '">' + title + '</h1>';
  if(c.prize){ out += '<div class="prize">' + esc(c.prize) + '</div>'; }
  if(c.sub){ out += '<div class="sub mt-s">' + esc(c.sub) + '</div>'; }
  if(c.kicker){ out += '<div class="kpay">' + (c.kickerPill === false ? '<div class="kicker">' + esc(c.kicker) + '</div>' : '<div class="kicker pill">' + esc(c.kicker) + '</div>') + '</div>'; }
  if(c.cue){ out += '<div class="scrollcue"><i></i><span>' + esc(c.cue) + '</span></div>'; }
  var layoutFn = c.layout && COVER_LAYOUTS[c.layout];
  if(layoutFn){ out += '<div class="vis">' + layoutFn(c) + '</div>'; }
  else {
  out += '<div class="vis">';
  if(c.hero){ out += hero(c.hero); }
  else if(c.thumbs){ out += coverThumbs(c.thumbs); }
  }
  if(c.tags){ out += '<div class="tags' + (c.hero || c.thumbs || c.layout ? ' mt-m' : '') + '">' + c.tags.map(function(t){ return badgePill(t); }).join('') + '</div>'; }
  out += '</div></div>';
  return out;
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
  if(c.nexts && c.nexts.length){
    out += '<div class="nexts mt-l"><div class="nexts-hd">下期预告</div>' + c.nexts.map(function(n){
      return '<div class="next"><span class="nx">' + esc(n.num||'') + '</span><span class="nt">' + esc(n.t||'') + '</span>' + (n.d ? '<span class="nd">' + esc(n.d) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  if(c.points && c.points.length){
    var li = c.points.map(function(p){ return '<div class="ri"><span class="ck">' + ic('check') + '</span>' + esc(p) + '</div>'; }).join('');
    out += '<div class="recap mt-l">' + li + '</div>';
  }
  // 二维码：qr 传 URL 字符串或 {url, label, logoText} 时生成**真实可扫**的码；true 为占位（不推荐）
  var qrTarget = typeof c.qr === 'object' && c.qr ? c.qr : (typeof c.qr === 'string' ? { url: c.qr } : null);
  var qrHtml = '';
  if (qrTarget && qrTarget.url) {
    var hollow = qrTestHooks.onRender(qrTarget.url);
    qrHtml = '<div class="qrcard' + (hollow ? ' hollow' : '') + '"><div class="qrsvgbox">' +
      (hollow ? '' : qrSvg(qrTarget.url, { logoText: qrTarget.logoText })) + '</div>' +
      '<div class="qrlabel">' + esc(qrTarget.label || '扫码打开') + '</div>' +
      (hollow ? '' : '<div class="qrurl">' + esc(String(qrTarget.url).replace(/^https?:\/\//, '')) + '</div>') + '</div>';
  } else if (c.qr === true) {
    qrHtml = '<div class="qrcard"><div class="qr placeholder"></div><div class="qrlabel">二维码占位</div></div>';
  }
  var rowStyle = 'display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:56px;padding-top:32px;border-top:1px solid var(--border)';
  out += '<div style="' + rowStyle + '"><div><div class="kicker">' + esc(c.ctaKicker||'') + '</div>' +
    '<div class="headline xs mt-s" style="font-size:40px">' + esc(c.cta||'') + '</div></div>' + qrHtml + '</div>';
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
  if(c.variant === 'phone') return buildPhone(c);
  if(c.variant === 'desktop') return buildDesktop(c);
  if(c.variant === 'bento') return buildBento(c);
  if(c.variant === 'flowchart') return buildFlowchart(c);
  if(c.variant === 'promo') return buildPromo(c);
  return '<h2 class="headline sm">' + hl(c.title||'', c.accent) + '</h2>';
}
