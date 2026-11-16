#!/usr/bin/env node
// scripts/directions.mjs — 读 directions.json，生成 3 个方向的缩略图 + 对照图 + 方向确认.md
// 用法：node scripts/directions.mjs --config examples/demo/directions.json --out examples/demo/directions
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderCard } from './card-render.mjs';
import { renderSheet } from './sheet.mjs';
import { planDirections } from './directions-plan.mjs';

function parseArgs() {
  const a = process.argv.slice(2);
  const v = { out: 'design-demos' };
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) v[a[i].slice(2)] = a[++i];
  }
  return v;
}

export function buildDirections(configPath, outDir) {
  const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
  if (!cfg.directions || cfg.directions.length < 3) throw new Error('directions.json 至少需要 3 个方向');
  outDir = resolve(outDir);
  mkdirSync(outDir, { recursive: true });
  const brand = cfg.brand || {};
  const items = [];

  cfg.directions.forEach((d, i) => {
    const id = d.id || String.fromCharCode(65 + i);
    const card = {
      variant: 'cover',
      kicker: d.kicker || '',
      title: d.title || ['方向 ' + id, d.name || ''],
      accent: d.accentWord || '',
      sub: d.sub || '',
      hero: d.hero || null,
      tags: d.tags || [],
    };
    const out = join(outDir, id + '.png');
    renderCard(card, {
      theme: d.theme || 'dark',
      accent: d.accent,
      accent2: d.accent2,
      brand: brand,
      page: i + 1,
      total: cfg.directions.length,
    }, out);
    items.push({ label: id + ' · ' + (d.name || ''), abs: out });
    console.log('  direction ' + id + ' -> ' + (d.name || '') + '  ' + out);
  });

  renderSheet(items, join(outDir, 'directions.png'), { cols: cfg.directions.length, cellW: 340, gap: 20, pad: 16 });
  console.log('  sheet -> ' + join(outDir, 'directions.png'));

  const lines = ['# 方向确认 · ' + (cfg.project || ''), '', '> 由 scripts/directions.mjs 生成。三个方向必须是结构差异，不是换色。', ''];
  cfg.directions.forEach((d, i) => {
    const id = d.id || String.fromCharCode(65 + i);
    lines.push('- 方向 ' + id + ' · ' + (d.name || '') + (d.note ? ' — ' + d.note : ''));
    lines.push('  缩略图：' + id + '.png');
  });
  lines.push('', '## 用户选择', '', '（待用户选择；把用户原话写在这里，例如「选 B，但把 C 的配色借一点」。选定后才开始量产。）', '');
  writeFileSync(join(outDir, '方向确认.md'), lines.join('\n'), 'utf8');
  console.log('  gate -> ' + join(outDir, '方向确认.md'));
  return { outDir, items };
}

const isMain = process.argv[1] && process.argv[1].endsWith('directions.mjs');
if (isMain) {
  const args = parseArgs();
  if (args.topic) {
    // 半自动模式：主题 -> 3 套候选配置 -> 直接渲染
    const outDir = resolve(args.out || 'design-demos');
    mkdirSync(outDir, { recursive: true });
    const cfg = planDirections(args);
    const cfgPath = join(outDir, 'directions.json');
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    console.log('  plan -> ' + cfgPath);
    buildDirections(cfgPath, outDir);
  } else {
    const config = args.config || 'directions.json';
    if (!existsSync(config)) {
      console.error('找不到配置文件：' + config + '\n可参考 examples/demo/directions.json，或用 --topic "主题" 走半自动模式。');
      process.exit(1);
    }
    buildDirections(config, args.out);
  }
}
