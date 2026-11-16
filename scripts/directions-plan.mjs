#!/usr/bin/env node
// scripts/directions-plan.mjs — 半自动：给一个主题，生成 3 套候选方向配置
// 主题名单与样张来自 scripts/theme-registry.mjs（读 assets/tokens.css + style-specimens）
// 用法：node scripts/directions-plan.mjs --topic "Atlas 开源架构图" --project Atlas --out directions.json
import { writeFileSync } from 'node:fs';
import { listThemes, themeLabel, requireTheme } from './theme-registry.mjs';

const ICONS = ['layers', 'branch', 'grid', 'play'];

function splitTitle(topic, optTitle) {
  if (optTitle) {
    const parts = String(optTitle).split(/[,，/|]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return [parts[0], parts.slice(1).join('')];
  }
  const clean = topic.trim().replace(/\s+/g, ' ');
  if (clean.includes(' ')) {
    const parts = clean.split(' ');
    return [parts[0], parts.slice(1).join('')];
  }
  const chars = [...clean];
  if (chars.length <= 10) return [clean, '一次讲清'];
  const mid = Math.ceil(chars.length / 2);
  return [chars.slice(0, mid).join(''), chars.slice(mid).join('')];
}

function chooseEditorialTheme(topic) {
  const all = listThemes();
  const withSpecimen = all.filter((t) => t.hasSpecimen).map((t) => t.name);
  const available = withSpecimen.length ? withSpecimen : all.map((t) => t.name);
  const order = [];
  if (/国风|传统|文化|历史|诗词|非遗|中式|书法|水墨/.test(topic)) order.push('guofeng');
  if (/极简|黑白|技术|架构|工程|代码|开发者|开源/.test(topic)) order.push('mono');
  if (/AI|人工智能|科技|数据|未来|芯片|云|智能/.test(topic)) order.push('night-cyan');
  order.push('magazine');
  for (const n of order) if (available.includes(n)) return n;
  return available[0] || 'magazine';
}

function accentFor(theme) {
  if (theme === 'dark') return { accent: '#4F8CFF', accent2: '#38E1D6' };
  if (theme === 'light') return { accent: '#12B76A', accent2: '#2563EB' };
  return {};
}

export function planDirections(opts = {}) {
  const topic = String(opts.topic || '').trim();
  if (!topic) throw new Error('缺少 --topic');
  const project = opts.project || topic;
  const brandName = opts.brand || project;
  const logo = opts.logo || ([...brandName][0] || '微');
  const column = opts.column || '内容工坊';
  const site = opts.site || brandName;
  const [l1, l2] = splitTitle(topic, opts.title);
  const sub = opts.sub || ('关于「' + topic + '」的一次完整梳理');

  const rawPoints = opts.points ? String(opts.points).split(/[,，;；]/).map((s) => s.trim()).filter(Boolean) : [];
  const defaults = ['问题', '方法', '案例', '结论'];
  const points = [];
  for (let i = 0; i < 4; i++) points.push(rawPoints[i] || defaults[i]);

  const forced = opts.themes ? String(opts.themes).split(/[,，]/).map((s) => s.trim()).filter(Boolean) : [];
  const pick = (i, fallback) => {
    const name = forced[i];
    if (name) { requireTheme(name); return name; }
    return fallback;
  };
  const aTheme = pick(0, 'dark');
  const bTheme = pick(1, 'light');
  const cTheme = pick(2, chooseEditorialTheme(topic));

  return {
    project: project,
    brand: { name: brandName, logo: logo, column: column, site: site },
    directions: [
      {
        id: 'A', name: '清单体 · ' + themeLabel(aTheme),
        note: '清单体：封面 → 4 个要点 → 结尾；语气硬核、讲边界。',
        theme: aTheme, ...accentFor(aTheme),
        kicker: brandName + ' 精选',
        title: [l1, l2], accentWord: l2, sub: sub,
        hero: { type: 'tiles', items: points.map((t, i) => ({ icon: ICONS[i], t: t })) },
        tags: [],
      },
      {
        id: 'B', name: '图解体 · ' + themeLabel(bTheme),
        note: '图解体：一张流程图贯穿；语气轻快、讲场景。',
        theme: bTheme, ...accentFor(bTheme),
        kicker: brandName + ' 实用指南',
        title: [l1, l2], accentWord: l1, sub: sub,
        hero: { type: 'flow', nodes: points.map((t, i) => ({ num: String(i + 1), t: t, d: '' })) },
        tags: [],
      },
      {
        id: 'C', name: '杂志叙事 · ' + themeLabel(cTheme),
        note: '杂志叙事：封面 → 图文长段 → 引用；语气编辑感。',
        theme: cTheme, ...accentFor(cTheme),
        kicker: brandName + ' 编辑手记',
        title: [l1, l2], accentWord: cTheme === 'mono' ? '' : l2,
        sub: '把「' + topic + '」讲成一篇报道',
        hero: { type: 'browser', url: site, ui: 'list' },
        tags: [],
      },
    ],
  };
}

function parseArgs() {
  const a = process.argv.slice(2);
  const v = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) { v[a[i].slice(2)] = a[++i]; }
  }
  return v;
}

const isMain = process.argv[1] && process.argv[1].endsWith('directions-plan.mjs');
if (isMain) {
  const args = parseArgs();
  if (!args.topic) { console.error('用法：node scripts/directions-plan.mjs --topic "主题" [--project 名称] [--title "第一行,第二行"] [--points "点1,点2,点3,点4"] [--themes "dark,light,magazine"] [--out directions.json]'); process.exit(1); }
  const cfg = planDirections(args);
  const out = args.out || 'directions.json';
  writeFileSync(out, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  console.log('wrote ' + out);
  console.log('可用主题：' + listThemes().map((t) => t.name + (t.hasSpecimen ? '(有样张)' : '')).join(', '));
  console.log('下一步：node scripts/directions.mjs --config ' + out + ' --out design-demos');
}
