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
  'night-cyan': '深底青',
  'aurora': '浅蓝工具推荐',
  'forest': '深绿开源项目',
  'ocean': '深蓝工具发布',
  'cream': '米色架构图解',
  'cyber': '暗黑霓虹合集',
  'sky': '亮蓝清单干货',
  'rose': '浅红新开源',
  'midnight': '深紫夜',
  'baize': '白泽品牌紫',
  'ios': '手机风格（iOS）',
  'desk': '电脑风格（桌面）',
  'bento': '卡片风格（Bento）',
  'blueprint': '流程图风格',
  'promo': '产品宣传图'
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
