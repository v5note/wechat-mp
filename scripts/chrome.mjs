// scripts/chrome.mjs — 无头 Chrome 渲染 + 资源注入（供 render.mjs / build.mjs / preview.mjs 共用）
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..');

const CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'msedge',
];

export function chromePath() {
  for (const c of CANDIDATES) {
    if (!c) continue;
    try {
      if (c.includes('/')) { if (existsSync(c)) return c; continue; }
      const out = execFileSync('bash', ['-lc', 'command -v ' + c], { encoding: 'utf8' }).trim();
      if (out) return out;
    } catch { /* keep looking */ }
  }
  throw new Error('找不到 Chrome/Chromium/Edge。请安装浏览器，或用 CHROME_BIN=/path/to/chrome 指定。');
}

export function injectAssets(html, extraCss = '') {
  const tokens = readFileSync(join(ROOT, 'assets/tokens.css'), 'utf8');
  const sprite = readFileSync(join(ROOT, 'assets/icons.svg'), 'utf8');
  return html
    .split('{{BASE_CSS}}').join(tokens + (extraCss ? '\n' + extraCss : ''))
    .split('{{ICON_SPRITE}}').join(sprite)
    .split('<!--ICON_SPRITE-->').join(sprite);
}

function extraFlags() {
  return String(process.env.CHROME_FLAGS || '').split(/\s+/).filter(Boolean);
}

function baseArgs(width, height, outAbs, tmp) {
  return [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--force-device-scale-factor=1', '--disable-extensions',
    '--window-size=' + width + ',' + height,
    '--screenshot=' + outAbs,
    '--virtual-time-budget=1500',
    ...extraFlags(),
    'file://' + tmp,
  ];
}

// Render an HTML string to a PNG. Relative <img> files resolve because the
// temp HTML is written next to outPath.
//
// Some sandboxed/CI environments reject the default profile/sandbox. If the
// first attempt fails we retry once with --no-sandbox and a fresh writable
// --user-data-dir, so build.mjs works without the caller configuring flags.
let forceFallback = false;

export function renderHtml(html, outPath, width, height, extraCss = '') {
  const bin = chromePath();
  const outAbs = resolve(outPath);
  mkdirSync(dirname(outAbs), { recursive: true });
  const tmp = join(dirname(outAbs), '.render-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.html');
  writeFileSync(tmp, injectAssets(html, extraCss), 'utf8');

  let lastErr = null;
  for (let attempt = forceFallback ? 1 : 0; attempt < 2; attempt++) {
    let profileDir = null;
    let args = baseArgs(width, height, outAbs, tmp);
    if (attempt === 1) {
      profileDir = mkdtempSync(join(tmpdir(), 'wechat-mp-chrome-'));
      args = args.concat(['--no-sandbox', '--disable-crash-reporter', '--disable-breakpad', '--user-data-dir=' + profileDir]);
    }
    try {
      rmSync(outAbs, { force: true });
      execFileSync(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
      if (existsSync(outAbs)) {
        rmSync(tmp, { force: true });
        if (profileDir) rmSync(profileDir, { recursive: true, force: true });
        return outAbs;
      }
    } catch (e) {
      lastErr = e;
      if (attempt === 0) forceFallback = true;
      // 有些环境 Chrome 写完截图后 teardown/crashpad 仍以非零码退出，文件已经生成即算成功
      if (existsSync(outAbs)) {
        rmSync(tmp, { force: true });
        return outAbs;
      }
      if (e && e.stderr) {
        const tail = String(e.stderr).trim().split('\n').slice(-2).join(' | ');
        if (tail) process.stderr.write('[chrome] ' + tail + '\n');
      }
    } finally {
      if (profileDir) { try { rmSync(profileDir, { recursive: true, force: true }); } catch {} }
    }
  }
  rmSync(tmp, { force: true });
  const detail = lastErr && lastErr.stderr ? String(lastErr.stderr).trim().slice(-800) : '';
  throw new Error('渲染失败，未生成: ' + outAbs + (detail ? '\n' + detail : '') +
    '\n提示：可设置 CHROME_BIN 指定浏览器，或设置 CHROME_FLAGS（例如 --no-sandbox --user-data-dir=/tmp/chrome-profile）。');
}

export function renderFile(inPath, outPath, width, height, extraCss = '') {
  return renderHtml(readFileSync(inPath, 'utf8'), outPath, width, height, extraCss);
}
