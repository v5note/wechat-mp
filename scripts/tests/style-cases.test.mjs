import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const list = JSON.parse(readFileSync('references/style-cases/cases.json', 'utf8'));

test('style cases are registered with every reference URL', () => {
  assert.ok(Array.isArray(list.cases) && list.cases.length === 35, 'expected 35 cases, got ' + (list.cases || []).length);
  const ids = new Set();
  for (const c of list.cases) {
    assert.match(c.url, /^https:\/\/mp\.weixin\.qq\.com\/s\/[A-Za-z0-9_-]+$/, 'bad url: ' + c.url);
    assert.ok(!ids.has(c.url), 'duplicate url ' + c.url);
    ids.add(c.url);
    assert.ok(c.style, 'missing style for ' + c.url);
    const style = list.styles.find((s) => s.id === c.style);
    assert.ok(style, 'unknown style ' + c.style + ' for ' + c.url);
    assert.ok(Array.isArray(style.recipe) && style.recipe.length >= 2, 'missing recipe for style ' + c.style);
  }
  assert.ok(list.styles.length >= 8, 'expected at least 8 distinct styles');
});

test('only the red/Pin UI lead image is stored as a reference crop', () => {
  for (const c of list.cases) {
    if (c.thumb) assert.ok(existsSync(c.thumb), 'missing thumb ' + c.thumb);
    else assert.equal(c.thumb, null);
  }
  const withThumb = list.cases.filter((c) => c.thumb);
  assert.ok(withThumb.every((c) => c.style === 'pin-red'), 'only pin-red may store a crop');
});
