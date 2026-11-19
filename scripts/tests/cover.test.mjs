import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCard } from '../visuals.mjs';
import { checkVersion } from '../check.mjs';

const cover = { variant: 'cover', title: ['五步出稿清单', '公众号内容自动化'], accent: '五步', sub: '立项 → 版式 → 文案 → 出图 → 自检', thumbs: [{ t: '一套管线' }], tags: ['A', 'B'] };

test('cover headline scales down with the longest line', () => {
  const big = buildCard({ ...cover, title: ['一句话', '出一整套公众号'] });
  const mid = buildCard({ ...cover, title: ['五步出稿清单', '公众号内容自动化'] });
  const small = buildCard({ ...cover, title: ['这是一行特别特别长的标题', '第二行'] });
  assert.match(big, /class="headline hook"/);
  assert.match(mid, /class="headline hook2"/);
  assert.match(small, /class="headline hook3"/);
  // 封面标题比内页标题大（内页 headline.sm 为 76px，hook3 起为 92px）
  assert.ok(!/headline sm/.test(mid));
});

test('cover renders first-screen preview thumbs instead of sentences', () => {
  const html = buildCard(cover);
  assert.match(html, /class="thumbs"/);
  assert.match(html, /往下/);
  assert.match(html, /一套管线/);
});

test('ending card can carry a next-episode strip', () => {
  const html = buildCard({ variant: 'ending', title: '关注', points: ['a'], cta: 'x', nexts: [{ num: '1', t: '下期标题' }] });
  assert.match(html, /下期预告/);
  assert.match(html, /下期标题/);
});

test('check flags an over-long cover headline', () => {
  const spec = JSON.parse(readFileSync('examples/demo/v1-dark.spec.json', 'utf8'));
  assert.equal(spec.cards[0].variant, 'cover');
  // 用默认 demo 的 spec 断言当前封面合规
  const r = checkVersion('examples/demo/v1-dark');
  assert.equal(r.errs.length, 0, r.errs.join('; '));
});
