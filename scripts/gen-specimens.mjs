#!/usr/bin/env node
// scripts/gen-specimens.mjs — 用真实渲染管线生成 20 套主题 / 画面风格样张
// 用法：node scripts/gen-specimens.mjs
import { join, resolve } from 'node:path';
import { renderCard } from './card-render.mjs';
import { renderSheet } from './sheet.mjs';
import { ROOT } from './chrome.mjs';

const coverCard = {
  variant: 'cover',
  kicker: 'WECHAT MP 主题样张',
  title: ['把主题', '做成能发的内容'],
  accent: '能发',
  sub: '贴图 + 长文 · 2 版本 4 样例',
  hero: { type: 'browser', url: 'wechat-mp', ui: 'dashboard' },
  tags: ['★ 主题样张', '1080×1440', 'PNG'],
};

const themes = [
  { theme: 'dark', label: 'dark · 深色科技', column: '科技前线' },
  { theme: 'light', label: 'light · 浅色清新', column: '效率工坊' },
  { theme: 'magazine', label: 'magazine · 杂志米色', column: '杂志编辑' },
  { theme: 'guofeng', label: 'guofeng · 国风朱砂', column: '国风专栏' },
  { theme: 'mono', label: 'mono · 极简黑白', column: '极简观察' },
  { theme: 'night-cyan', label: 'night-cyan · 深底青', column: '科技前线' },
  { theme: 'aurora', label: 'aurora · 浅蓝工具推荐', column: '工具推荐' },
  { theme: 'forest', label: 'forest · 深绿开源项目', column: '开源精选' },
  { theme: 'ocean', label: 'ocean · 深蓝工具发布', column: '软件发布' },
  { theme: 'cream', label: 'cream · 米色架构图解', column: '原理图解' },
  { theme: 'cyber', label: 'cyber · 暗黑霓虹合集', column: '榜单合集' },
  { theme: 'sky', label: 'sky · 亮蓝清单干货', column: '干货清单' },
  { theme: 'rose', label: 'rose · 浅红新开源', column: '新开源' },
  { theme: 'midnight', label: 'midnight · 深紫夜', column: '灵感清单' },
  { theme: 'baize', label: 'baize · 白泽品牌紫', column: 'Agent 运行时' },
  {
    theme: 'ios', label: 'ios · 手机风格', column: '移动体验',
    card: {
      variant: 'phone',
      kicker: 'IOS · 手机风格',
      title: ['聊天里发一句', '图就画好了'],
      accent: '图就画好了',
      sub: '移动端截图式排版，读者像在看自己的手机',
      points: ['原生聊天界面', '状态栏 / 刘海齐全', '适配 3:4 竖版'],
      hero: { type: 'phone', screen: 'chat', name: 'Atlas 助手' },
      tags: ['★ 手机风格', '1080×1440'],
    },
  },
  {
    theme: 'desk', label: 'desk · 电脑风格', column: '桌面体验',
    card: {
      variant: 'desktop',
      kicker: 'DESKTOP · 电脑风格',
      title: '把工作台搬进图里',
      accent: '工作台',
      body: 'macOS 菜单栏 + 窗口 + Dock，一套完整的桌面语境。',
      hero: { type: 'desktop', app: 'Atlas Studio', ui: 'dashboard' },
      caption: '示意界面 · 非真实截图',
    },
  },
  {
    theme: 'bento', label: 'bento · 卡片风格', column: '卡片墙',
    card: {
      variant: 'bento',
      kicker: 'BENTO · 卡片风格',
      title: ['能力拆成卡片', '一眼扫完'],
      accent: '一眼扫完',
      body: '格子有大小，信息有主次。',
      items: [
        { t: '自动解析', d: '语言识别 + AST', icon: 'code', span: 2 },
        { t: '模块', d: '已解析', num: '42', tone: 'accent' },
        { t: '四种视图', d: '架构 / 调用 / 依赖 / 入口', icon: 'layers', span: 2 },
        { t: '导出', d: 'PNG / SVG / 链接', icon: 'share' },
        { t: '循环依赖', d: '标红提示', icon: 'branch', tone: 'ink' },
        { t: '随仓库更新', d: '改一次，图跟着变', icon: 'bolt' },
        { t: '零配置', d: '浏览器直接用', icon: 'spark' },
      ],
      cols: 3,
      caption: '示意数据',
    },
  },
  {
    theme: 'blueprint', label: 'blueprint · 流程图风格', column: '流程拆解',
    card: {
      variant: 'flowchart',
      kicker: 'FLOW · 流程图风格',
      title: '一张图讲清判断',
      accent: '判断',
      hero: {
        type: 'flowchart',
        start: '导入 Git 仓库',
        steps: [
          { t: '解析结构', d: '模块 / 依赖 / 入口' },
          { t: '生成视图', d: '架构 / 调用 / 依赖' },
        ],
        decision: {
          q: '发现循环依赖？',
          yes: { t: '标红并提示', d: '建议先解耦' },
          no: { t: '直接出图', d: '四种视图可切换' },
        },
        end: '导出 PNG / SVG',
      },
      caption: '图：从仓库到四张图',
    },
  },
  {
    theme: 'promo', label: 'promo · 产品宣传图', column: '新品发布',
    card: {
      variant: 'promo',
      promoBadge: 'NEW · 2.0',
      title: ['Atlas 2.0', '把项目画成图'],
      accent: '画成图',
      sub: '一句话出图，四种视图，随仓库更新',
      hero: {
        type: 'promo', device: 'phone', screen: 'app', app: 'Atlas',
        tags: ['零配置', '四种视图', '导出干净'], price: '免费', priceNote: 'MIT 开源',
      },
      points: ['开源免费', '浏览器直接用', '支持私有仓库'],
      cta: 'atlas.dev →',
    },
  },
];

const outDir = join(ROOT, 'assets', 'style-specimens');
const items = [];

for (const t of themes) {
  const card = t.card || coverCard;
  const out = join(outDir, 'sheet-' + t.theme + '.png');
  renderCard(card, {
    theme: t.theme,
    brand: { name: 'wechat-mp', logo: '微', column: t.column, site: 'wechat-mp' },
    page: 1,
    total: 1,
  }, out);
  items.push({ label: t.label, abs: resolve(out) });
  console.log('  specimen ->', 'assets/style-specimens/sheet-' + t.theme + '.png');
}

renderSheet(items, join(outDir, 'overview.png'), { cols: 4, cellW: 260, gap: 18, pad: 16 });
console.log('  overview -> assets/style-specimens/overview.png');
