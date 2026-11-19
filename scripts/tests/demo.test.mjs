import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkVersion } from '../check.mjs';
import { ARTICLE } from '../article-tokens.mjs';
import { planDirections } from '../directions-plan.mjs';
import { listThemes, themeLabel } from '../theme-registry.mjs';
import { route } from '../route.mjs';
import { qrMatrix, qrSvg } from '../qr.mjs';
import * as visualsModule from '../visuals.mjs';

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
  assert.match(s, /version:\s*"0\.1\.\d+"/);
  assert.ok(s.includes('2 个版本 × 2 种格式'));
  assert.ok(s.includes('4 个公众号样例'));
  assert.ok(s.includes('贴图') && s.includes('文章'));
  assert.ok(s.includes('style-catalog') && s.includes('video-format'), 'missing style/video docs');
  for (const f of ['facts.md', 'brand-spec.md', 'polish-log.md']) {
    assert.ok(s.includes(f), 'missing quality gate ' + f);
  }
});

test('article.html is a paste-ready fragment, not a full page', () => {
  for (const dir of [join(demo, 'v1-dark'), join(demo, 'v2-light'), 'examples/cases/wechat-mp-self/out/v2-sky', 'examples/cases/wechat-mp-self/out/v1-ocean']) {
    const html = readFileSync(join(dir, 'article', 'article.html'), 'utf8');
    assert.ok(!/<!(doctype|DOCTYPE)/.test(html), dir + ': 不应含 doctype');
    for (const tag of ['html', 'head', 'body', 'title', 'h1', 'h2', 'figure', 'figcaption', 'hr', 'table', 'blockquote', 'div']) {
      assert.ok(!new RegExp('<' + tag + '(\\s|>)').test(html), dir + ': 不应含 <' + tag + '>');
    }
    assert.ok(html.trimStart().startsWith('<section'), dir + ': 根节点应为 <section>');
    assert.ok(!/font-family|letter-spacing|max-width/.test(html), dir + ': 不应写微信会清理的属性');
  }
});

test('article-import.html is a rich-text copy page, not a raw dump', () => {
  for (const dir of [join(demo, 'v1-dark'), 'examples/cases/wechat-mp-self/out/v2-sky']) {
    const p = join(dir, 'article', 'article-import.html');
    assert.ok(existsSync(p), dir + ': 缺少 article-import.html');
    const html = readFileSync(p, 'utf8');
    assert.match(html, /<button[^>]*onclick="cp\(\)"/, dir + ': 缺「复制全文」按钮');
    assert.match(html, /id="wx"/, dir + ': 缺复制内容区 #wx');
    const inner = html.slice(html.indexOf('<div id="wx">'));
    assert.ok(inner.trimStart().startsWith('<div id="wx"><section'), dir + ': 复制区内应是片段');
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
  for (const t of ['magazine', 'guofeng', 'mono', 'night-cyan', 'aurora', 'forest', 'ocean', 'cream', 'cyber', 'sky', 'rose', 'midnight', 'baize', 'ios', 'desk', 'bento', 'blueprint', 'promo']) {
    assert.ok(existsSync('assets/style-specimens/sheet-' + t + '.png'), 'missing specimen ' + t);
  }
  assert.ok(existsSync('assets/style-specimens/overview.png'));
});

test('theme registry lists themes and specimens', () => {
  const themes = listThemes();
  assert.ok(themes.length >= 20, 'expected >=20 themes, got ' + themes.length);
  for (const t of ['ios', 'desk', 'bento', 'blueprint', 'promo']) {
    const f = themes.find((x) => x.name === t);
    assert.ok(f && f.hasSpecimen, 'device/style theme with specimen: ' + t);
  }
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
  const r3 = route('手机端 App 里怎么和助手对话');
  assert.equal(r3.genre, '移动端体验');
  assert.equal(r3.visualStyle, '手机风格');
  assert.equal(r3.theme, 'ios');
  const r4 = route('用流程图讲清审批分支');
  assert.equal(r4.genre, '流程拆解');
  assert.equal(r4.theme, 'blueprint');
  assert.ok(r4.cardVariants.includes('flowchart'));
  const r5 = route('新品发布宣传海报');
  assert.equal(r5.genre, '产品宣传');
  assert.equal(r5.theme, 'promo');
  assert.ok(r5.cardVariants.includes('promo'));
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
  for (const c of ['forest-stackbase', 'rose-mosaic', 'cream-agent', 'baize-baize', 'cyber-agentbench', 'style-gallery']) {
    const dir = join('examples/cases', c, 'out');
    const r = checkVersion(dir);
    assert.equal(r.errs.length, 0, c + ': ' + r.errs.join('; '));
  }
  // 自举案例：一期两版（v1-ocean 深色 / v2-sky 浅色），放在 out/ 的子目录里
  for (const v of ['v1-ocean', 'v2-sky']) {
    const dir = join('examples/cases/wechat-mp-self/out', v);
    const r = checkVersion(dir);
    assert.equal(r.errs.length, 0, 'wechat-mp-self/' + v + ': ' + r.errs.join('; '));
  }
});

test('qr encoder builds a well-formed version-2 matrix for short URLs', () => {
  const m = qrMatrix('https://atlas.dev');
  assert.equal(m.version, 2);
  assert.equal(m.size, 25);
  // 三个定位图形必须完整：7×7 深色外框 + 3×3 深色中心
  for (const [r0, c0] of [[0, 0], [0, 18], [18, 0]]) {
    for (let i = 0; i < 7; i++) {
      assert.equal(m.modules[r0][c0 + i], 1);
      assert.equal(m.modules[r0 + 6][c0 + i], 1);
      assert.equal(m.modules[r0 + i][c0 + 6], 1);
    }
    assert.equal(m.modules[r0 + 3][c0 + 3], 1);
  }
  assert.ok(m.modules.flat().filter(Boolean).length > 100);
});

test('qr encoder scales to longer URLs and svg has no stray markup', () => {
  const long = 'https://github.com/v5note/wechat-mp/blob/main/examples/cases/style-gallery/spec.json?ref=wechat';
  const m = qrMatrix(long);
  assert.ok(m.version >= 4 && m.size === m.version * 4 + 17);
  const svg = qrSvg('https://baize.v5ai.xin/', { logoText: '白' });
  assert.match(svg, /^<svg class="qrsvg"/);
  assert.ok(!svg.includes('undefined'));
  assert.ok((svg.match(/<rect/g) || []).length > 20);
});

test('ending card renders a real QR (not a placeholder) and check flags missing target', () => {
  const { buildCard } = require_visuals();
  const real = buildCard({ variant: 'ending', title: '现在就能试', points: ['一句话出图'], cta: 'atlas.dev', qr: { url: 'https://atlas.dev', label: '扫码打开' } });
  assert.ok(real.includes('qrsvg'));
  assert.ok(!real.includes('qr placeholder'));
  const missing = buildCard({ variant: 'ending', title: '现在就能试', cta: 'atlas.dev' });
  assert.ok(!missing.includes('qrsvg'));
});

function require_visuals() {
  return visualsModule;
}

test('directions demo has 3 thumbnails and a gate', () => {
  for (const id of ['A', 'B', 'C']) {
    assert.ok(existsSync(join('examples/demo/directions', id + '.png')), 'missing direction ' + id);
  }
  assert.ok(existsSync('examples/demo/directions/directions.png'));
  assert.ok(existsSync('examples/demo/directions/方向确认.md'));
});
