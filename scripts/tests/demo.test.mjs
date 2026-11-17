import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkVersion } from '../check.mjs';
import { ARTICLE } from '../article-tokens.mjs';
import { planDirections } from '../directions-plan.mjs';
import { listThemes, themeLabel } from '../theme-registry.mjs';
import { route } from '../route.mjs';

const demo = 'examples/demo';
const versions = ['v1-dark', 'v2-light'];

test('demo passes automated check', () => {
  for (const v of versions) {
    const r = checkVersion(join(demo, v));
    assert.equal(r.errs.length, 0, v + ': ' + r.errs.join('; '));
  }
});

test('article-body palette is a subset of article-tokens', () => {
  const tokenHex = new Set((JSON.stringify(ARTICLE).match(/#[0-9A-Fa-f]{6}/g) || []).map((x) => x.toUpperCase()));
  const body = readFileSync('templates/article-body.html', 'utf8');
  const bodyHex = new Set((body.match(/#[0-9A-Fa-f]{6}/g) || []).map((x) => x.toUpperCase()));
  const allow = new Set(['#EDEDED', '#B0B0B0', '#EEEEEE']);
  const offenders = [...bodyHex].filter((x) => !tokenHex.has(x) && !allow.has(x));
  assert.deepEqual(offenders, []);
});

test('SKILL keeps the article + card contract and quality gates', () => {
  const s = readFileSync('SKILL.md', 'utf8');
  assert.match(s, /metadata:\s*\n\s*author:/);
  assert.match(s, /version:\s*"2\.0\.0"/);
  assert.ok(s.includes('2 个版本 × 2 种格式'));
  assert.ok(s.includes('4 个公众号样例'));
  assert.ok(s.includes('贴图') && s.includes('文章'));
  assert.ok(s.includes('style-catalog') && s.includes('video-format'), 'missing style/video docs');
  for (const f of ['facts.md', 'brand-spec.md', 'polish-log.md']) {
    assert.ok(s.includes(f), 'missing quality gate ' + f);
  }
});

test('no undefined image refs in demo', () => {
  for (const v of versions) {
    const md = readFileSync(join(demo, v, 'article', 'article.md'), 'utf8');
    assert.ok(!md.includes('undefined'), v);
  }
});

test('case banner exists at 1600×720', () => {
  const p = 'assets/case-banner.png';
  assert.ok(existsSync(p), 'missing case banner');
  const b = readFileSync(p);
  assert.equal(b.readUInt32BE(16), 1600);
  assert.equal(b.readUInt32BE(20), 720);
});

test('theme specimens exist', () => {
  for (const t of ['magazine', 'guofeng', 'mono', 'night-cyan', 'aurora', 'forest', 'ocean', 'cream', 'cyber', 'sky', 'rose', 'midnight', 'baize']) {
    assert.ok(existsSync('assets/style-specimens/sheet-' + t + '.png'), 'missing specimen ' + t);
  }
  assert.ok(existsSync('assets/style-specimens/overview.png'));
});

test('theme registry lists themes and specimens', () => {
  const themes = listThemes();
  assert.ok(themes.length >= 14, 'expected >=14 themes, got ' + themes.length);
  for (const t of ['aurora', 'forest', 'ocean', 'cream', 'cyber', 'sky', 'rose', 'midnight']) {
    const f = themes.find((x) => x.name === t);
    assert.ok(f && f.hasSpecimen, 'new theme with specimen: ' + t);
  }
  for (const t of ['magazine', 'guofeng', 'mono', 'night-cyan']) {
    const found = themes.find((x) => x.name === t);
    assert.ok(found && found.hasSpecimen, 'theme with specimen: ' + t);
  }
  assert.equal(themeLabel('dark'), '深色科技');
});

test('router maps topics to genre/theme/skeleton', () => {
  const r1 = route('一款开源的后端框架，支持自托管');
  assert.equal(r1.genre, '项目推荐');
  assert.equal(r1.theme, 'forest');
  assert.equal(r1.articleSkeleton, '开源项目推荐');
  assert.ok(r1.cardVariants.includes('cover'));
  const r2 = route('库存数据复盘，指标怎么看');
  assert.equal(r2.genre, '数据复盘');
  assert.ok(r2.altThemes.length >= 1 || r2.theme);
});

test('planner turns a topic into 3 structural directions', () => {
  const cfg = planDirections({ topic: 'Atlas 开源架构图', project: 'Atlas', points: '痛点,方法,案例,结论' });
  assert.equal(cfg.directions.length, 3);
  assert.deepEqual(cfg.directions.map((d) => d.id), ['A', 'B', 'C']);
  assert.equal(new Set(cfg.directions.map((d) => d.theme)).size, 3);
  assert.ok(cfg.directions[0].title.length === 2);
});

test('planner honors --themes', () => {
  const cfg = planDirections({ topic: '公众号排版', themes: 'dark,light,guofeng' });
  assert.deepEqual(cfg.directions.map((d) => d.theme), ['dark', 'light', 'guofeng']);
  assert.ok(cfg.directions[2].name.includes('国风墨朱'));
});

test('reference-style cases pass automated check', () => {
  for (const c of ['forest-stackbase', 'rose-mosaic', 'cream-agent', 'baize-baize', 'cyber-agentbench']) {
    const dir = join('examples/cases', c, 'out');
    const r = checkVersion(dir);
    assert.equal(r.errs.length, 0, c + ': ' + r.errs.join('; '));
  }
});

test('directions demo has 3 thumbnails and a gate', () => {
  for (const id of ['A', 'B', 'C']) {
    assert.ok(existsSync(join('examples/demo/directions', id + '.png')), 'missing direction ' + id);
  }
  assert.ok(existsSync('examples/demo/directions/directions.png'));
  assert.ok(existsSync('examples/demo/directions/方向确认.md'));
});
