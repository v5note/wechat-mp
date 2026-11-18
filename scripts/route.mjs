#!/usr/bin/env node
// scripts/route.mjs — 智能路由：输入主题，输出推荐体裁 / 主题 / 卡片骨架 / 文章骨架 / 视频形式
// 规则来源：references/style-catalog.md 第 5 节
// 用法：node scripts/route.mjs --topic "一款开源的后端框架" [--json]

const RULES = [
  { key: 'promo', test: /新品|宣传|海报|预售|上新|开售|卖点|广告图|主视觉/i,
    genre: '产品宣传', themes: ['promo', 'ocean'], article: '产品宣发', video: '口播干货' },
  { key: 'phone', test: /手机|移动端|小程序|聊天|对话|ios|android/i,
    genre: '移动端体验', themes: ['ios', 'rose'], article: '设备图文', video: '屏幕解说' },
  { key: 'desktop', test: /电脑|桌面|浏览器|网页|后台|工作台|编辑器|控制台|macos|windows/i,
    genre: '桌面端体验', themes: ['desk', 'dark'], article: '设备图文', video: '屏幕解说' },
  { key: 'flowchart', test: /流程图|流程|审批|分支|决策|链路|sop/i,
    genre: '流程拆解', themes: ['blueprint', 'cream'], article: '教程一图流', video: '屏幕解说' },
  { key: 'cards', test: /卡片|要点|模块|bento/i,
    genre: '卡片清单', themes: ['bento', 'sky'], article: '合集/清单', video: '图文轮播' },
  { key: 'opensource', test: /开源|star|license|github|仓库|源码|协议/i,
    genre: '项目推荐', themes: ['forest', 'dark'], article: '开源项目推荐', video: '口播干货' },
  { key: 'release', test: /发布|上线|新版本|发布会|终于来了|公测/i,
    genre: '产品发布', themes: ['ocean', 'forest'], article: '产品发布', video: '屏幕解说' },
  { key: 'tool', test: /工具|skill|插件|效率|神器|软件|app|客户端/i,
    genre: '项目推荐', themes: ['aurora', 'sky'], article: '项目推荐', video: '口播干货' },
  { key: 'tutorial', test: /教程|怎么用|如何|步骤|一图流|上手|照着点|指南/i,
    genre: '教程一图流', themes: ['sky', 'cream'], article: '教程一图流', video: '图文轮播' },
  { key: 'compare', test: /对比|选型|哪个好|横评|vs|区别|值得用吗/i,
    genre: '横评对比', themes: ['mono', 'light'], article: '横评对比', video: '口播干货' },
  { key: 'data', test: /数据|复盘|指标|增长|转化|报表|看板/i,
    genre: '数据复盘', themes: ['dark', 'cream'], article: '数据复盘', video: '屏幕解说' },
  { key: 'collection', test: /榜单|合集|盘点|大全|\d+\s*个|清单/i,
    genre: '合集', themes: ['cyber', 'sky'], article: '合集/清单', video: '图文轮播' },
  { key: 'design', test: /设计|ui|ux|灵感|组件|视觉|配色|界面/i,
    genre: '设计干货', themes: ['rose', 'midnight'], article: '项目推荐', video: '图文轮播' },
  { key: 'principle', test: /原理|架构|系统|机制|怎么跑|如何工作|底层/i,
    genre: '原理图解', themes: ['cream', 'dark'], article: '教程一图流', video: '屏幕解说' },
];

const CARD_BONES = {
  '产品宣传': ['promo', 'point', 'bento', 'compare', 'ending'],
  '移动端体验': ['phone', 'point', 'bento', 'compare', 'ending'],
  '桌面端体验': ['desktop', 'point', 'bento', 'diagram', 'ending'],
  '流程拆解': ['flowchart', 'steps', 'point', 'compare', 'ending'],
  '卡片清单': ['bento', 'grid', 'point', 'stat', 'ending'],
  '项目推荐': ['cover', 'point', 'list', 'diagram', 'compare', 'stat', 'ending'],
  '产品发布': ['cover', 'point', 'diagram', 'compare', 'ending'],
  '教程一图流': ['cover', 'diagram', 'list', 'steps', 'ending'],
  '横评对比': ['cover', 'compare', 'grid', 'stat', 'ending'],
  '数据复盘': ['cover', 'stat', 'diagram', 'compare', 'ending'],
  '合集': ['cover', 'grid', 'list', 'stat', 'ending'],
  '设计干货': ['cover', 'grid', 'list', 'compare', 'ending'],
  '原理图解': ['cover', 'diagram', 'list', 'diagram', 'quote', 'ending'],
};

const VISUAL_STYLE = {
  '产品宣传': '产品宣传图',
  '移动端体验': '手机风格',
  '桌面端体验': '电脑风格',
  '流程拆解': '流程图风格',
  '卡片清单': '卡片风格',
};

export function route(topic, opts = {}) {
  const t = String(topic || '');
  let hit = null;
  for (const r of RULES) { if (r.test.test(t)) { hit = r; break; } }
  const genre = opts.genre || (hit ? hit.genre : '项目推荐');
  let themes = hit ? hit.themes.slice() : ['light', 'dark'];
  if (opts.theme) themes = [opts.theme, ...themes.filter((x) => x !== opts.theme)];
  const article = hit ? hit.article : '项目推荐';
  const video = hit ? hit.video : '口播干货';
  const bones = CARD_BONES[genre] || CARD_BONES['项目推荐'];
  const reasons = [];
  if (hit) reasons.push('命中关键词规则「' + hit.key + '」');
  else reasons.push('未命中特定关键词，回退到「项目推荐」');
  const reader = /开发|前端|后端|工程|架构|代码/i.test(t) ? '开发者 / 技术决策者' : '产品运营 / 泛技术爱好者';
  return {
    topic: t,
    genre,
    theme: themes[0],
    altThemes: themes.slice(1),
    reader,
    articleSkeleton: article,
    visualStyle: VISUAL_STYLE[genre] || '贴图套图',
    cardVariants: bones,
    videoForm: video,
    reasons,
    note: '推荐仅供参考；真实产品/数据仍需 fact-check 与 brand-asset。',
  };
}

function parse() {
  const a = process.argv.slice(2); const v = {};
  for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { const k = a[i].slice(2); v[k] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true; } }
  return v;
}

const isMain = process.argv[1] && process.argv[1].endsWith('route.mjs');
if (isMain) {
  const v = parse();
  if (!v.topic) { console.error('用法：node scripts/route.mjs --topic "主题" [--json] [--theme forest]'); process.exit(1); }
  const r = route(v.topic, { theme: v.theme, genre: v.genre });
  if (v.json) console.log(JSON.stringify(r, null, 2));
  else {
    console.log('主题：' + r.topic);
    console.log('体裁：' + r.genre + '　读者：' + r.reader);
    console.log('画面风格：' + r.visualStyle + '　推荐主题：' + r.theme + (r.altThemes.length ? '（备选 ' + r.altThemes.join(' / ') + '）' : ''));
    console.log('卡片序列：' + r.cardVariants.join(' → '));
    console.log('文章骨架：' + r.articleSkeleton + '　视频：' + r.videoForm);
    console.log('依据：' + r.reasons.join('；'));
  }
}
