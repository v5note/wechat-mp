#!/usr/bin/env node
// scripts/validate-pair.mjs — 校验「默认两版」：一浅一深、不同配色族、结构不同
// 用法：
//   node scripts/validate-pair.mjs examples/demo/v1-dark.spec.json examples/demo/v2-light.spec.json
//   node scripts/validate-pair.mjs examples/cases/wechat-mp-self/*.spec.json
//   node scripts/validate-pair.mjs --all      # 自动收齐 demo 与 cases 里成对的 spec
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { comparePair, themeTable } from './palette.mjs';

function load(p) {
  return JSON.parse(readFileSync(resolve(p), 'utf8'));
}

const args = process.argv.slice(2);
let specs = [];
if (args.includes('--all')) {
  // 每个示例目录：取 v1-*.spec.json 与 v2-*.spec.json 各一份
  const groupsOut = [];
  const dirs = [
    resolve('examples/demo'),
    ...readdirSync(resolve('examples/cases'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => resolve('examples/cases', d.name)),
  ];
  for (const d of dirs) {
    const names = readdirSync(d).filter((f) => /^v[12].*\.spec\.json$/.test(f));
    const pair = [
      names.find((f) => f.startsWith('v1')),
      names.find((f) => f.startsWith('v2')),
    ].filter(Boolean).map((f) => load(resolve(d, f)));
    if (pair.length >= 2) groupsOut.push({ dir: d, specs: pair });
  }
  let bad = 0;
  for (const g of groupsOut) {
    const r = comparePair(g.specs);
    const label = g.dir.replace(resolve('.'), '').replace(/^\//, '');
    console.log('\n=== ' + label + ' ===');
    r.oks.forEach((m) => console.log('  ✓ ' + m));
    r.errs.forEach((m) => console.log('  ✗ ' + m));
    bad += r.errs.length;
  }
  if (!groupsOut.length) { console.error('没有找到成对的 v1/v2 spec'); process.exitCode = 1; }
  else if (bad) { console.error('\n两版校验失败：' + bad + ' 个错误。'); process.exitCode = 1; }
  else console.log('\n全部通过。');
} else {
  if (args.length < 2) {
    console.error('用法：node scripts/validate-pair.mjs <v1.spec.json> <v2.spec.json> [更多…]  或 --all');
    process.exit(1);
  }
  specs = args.map(load);
  const r = comparePair(specs);
  const table = themeTable();
  console.log('主题明暗：' + specs.map((s) => (s.theme + '=' + (table[s.theme] || {}).theme)).join('  '));
  r.oks.forEach((m) => console.log('  ✓ ' + m));
  r.errs.forEach((m) => console.log('  ✗ ' + m));
  if (r.errs.length) { console.error('\n两版校验失败：' + r.errs.length + ' 个错误。'); process.exitCode = 1; }
  else console.log('\n全部通过。');
}
