// scripts/theme-registry.mjs — 从 assets/tokens.css 读取主题，并关联样张
// 让方向提案真正“依赖样张和主题体系”，而不是再维护一份主题名单。
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_PATH = join(ROOT, 'assets', 'tokens.css');

const LABELS = {
  'dark': '深色科技',
  'light': '浅色清新',
  'magazine': '杂志米色',
  'guofeng': '国风墨朱',
  'mono': '极简黑白',
  'night-cyan': '深底青'
};

function specimenPath(name) {
  return join(ROOT, 'assets', 'style-specimens', 'sheet-' + name + '.png');
}

export function listThemes() {
  const css = readFileSync(CSS_PATH, 'utf8');
  const names = [];
  const re = /\.t-([a-z0-9-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    if (!names.includes(m[1])) names.push(m[1]);
  }
  return names.map((name) => {
    const specimen = specimenPath(name);
    return { name: name, label: LABELS[name] || name, specimen: specimen, hasSpecimen: existsSync(specimen) };
  });
}

export function themeLabel(name) {
  const t = listThemes().find((x) => x.name === name);
  return t ? t.label : name;
}

export function requireTheme(name) {
  const t = listThemes().find((x) => x.name === name);
  if (!t) throw new Error('未知主题「' + name + '」，可用：' + listThemes().map((x) => x.name).join(', '));
  return t;
}
