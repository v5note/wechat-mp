// scripts/chrome.mjs — 无头 Chrome 渲染 + 资源注入（供 render.mjs / build.mjs 共用）
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..');

const CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
];

export function chromePath() {
  for (const c of CANDIDATES) {
    if (!c) continue;
    try {
      if (c.includes('/') && existsSync(c)) return c;
      if (!c.includes('/')) {
        const out = execFileSync('bash', ['-lc', 'command -v ' + c], { encoding: 'utf8' }).trim();
        if (out) return out;
      }
    } catch { /* keep looking */ }
  }
  throw new Error('找不到 Chrome/Chromium。请安装 Chrome，或用 CHROME_BIN=/path/to/chrome 指定。');
}

export function injectAssets(html, extraCss = '') {
  const tokens = readFileSync(join(ROOT, 'assets/tokens.css'), 'utf8');
  const sprite = readFileSync(join(ROOT, 'assets/icons.svg'), 'utf8');
  let out = html
    .split('{{BASE_CSS}}').join(tokens + (extraCss ? '\n' + extraCss : ''))
    .split('{{ICON_SPRITE}}').join(sprite)
    .split('<!--ICON_SPRITE-->').join(sprite);
  return out;
}

// render an HTML string; temp file written next to outPath so relative <img> resolves
export function renderHtml(html, outPath, width, height, extraCss = '') {
  const bin = chromePath();
  const outAbs = resolve(outPath);
  mkdirSync(dirname(outAbs), { recursive: true });
  const tmp = join(dirname(outAbs), '.render-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.html');
  writeFileSync(tmp, injectAssets(html, extraCss), 'utf8');
  try {
    execFileSync(bin, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--force-device-scale-factor=1', '--disable-extensions',
      '--window-size=' + width + ',' + height,
      '--screenshot=' + outAbs,
      '--virtual-time-budget=1500',
      'file://' + tmp,
    ], { stdio: 'ignore' });
  } finally {
    try { rmSync(tmp, { force: true }); } catch {}
  }
  if (!existsSync(outAbs)) throw new Error('渲染失败，未生成: ' + outAbs);
  return outAbs;
}

export function renderFile(inPath, outPath, width, height, extraCss = '') {
  const html = readFileSync(inPath, 'utf8');
  return renderHtml(html, outPath, width, height, extraCss);
}
