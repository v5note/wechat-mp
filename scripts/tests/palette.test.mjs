import test from 'node:test';
import assert from 'node:assert/strict';
import { themeTable, comparePair, themeOf } from '../palette.mjs';

const pair = (a, b) => [{ theme: a, cards: [{ variant: 'cover' }], article: { sections: [{ h: 'A' }] } },
  { theme: b, cards: [{ variant: 'point' }], article: { sections: [{ h: 'B' }] } }];

test('every theme in tokens.css carries a light/dark tone', () => {
  const t = themeTable();
  const names = Object.keys(t);
  assert.ok(names.length >= 20, 'theme count ' + names.length);
  const unknown = names.filter((n) => !t[n].theme);
  assert.deepEqual(unknown, [], '无法判定明暗的主题：' + unknown.join(', '));
  assert.equal(t.dark.theme, 'dark');
  assert.equal(t.light.theme, 'light');
  assert.equal(t.ocean.theme, 'dark');
  assert.equal(t.aurora.theme, 'light');
});

test('default pair must be one light + one dark', () => {
  assert.equal(comparePair(pair('dark', 'light')).errs.length, 0);
  assert.equal(comparePair(pair('ocean', 'aurora')).errs.length, 0);
  const bad = comparePair(pair('aurora', 'sky')).errs;
  assert.ok(bad.some((m) => m.includes('同为「light」')), bad.join('; '));
});

test('two dark versions are rejected, same palette family is rejected', () => {
  const bad = comparePair(pair('ocean', 'midnight')).errs;
  assert.ok(bad.some((m) => m.includes('同为「dark」')), bad.join('; '));
});

test('themeOf returns null for unknown theme', () => {
  assert.equal(themeOf({ theme: 'not-a-theme' }), null);
});
