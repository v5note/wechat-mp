// scripts/video.mjs — 视频号（可选产出）：口播稿 + 分镜表 + 竖版封面数据
// 规范见 references/video-format.md
import { esc, hl, chip, hero } from './visuals.mjs';

function line(t){ return String(t == null ? '' : t); }

export function buildVideoScriptMd(v){
  var L = [];
  L.push('# ' + line(v.title || '视频号口播稿') + ' · 口播稿');
  L.push('');
  L.push('- 时长：' + line(v.duration || '45s') + '　形式：' + line(v.format || '口播干货') + '　画幅：9:16（1080×1920）');
  L.push('');
  if(v.hook){ L.push('> 钩子（前 3 秒）：' + line(v.hook)); L.push(''); }
  L.push('## 口播全文');
  L.push('');
  var script = v.script || (v.shots || []).map(function(s){ return s.voice; }).filter(Boolean);
  script.forEach(function(p){ if(p){ L.push(line(p)); L.push(''); } });
  if(v.subtitles && v.subtitles.length){
    L.push('## 字幕要点（逐屏）');
    L.push('');
    v.subtitles.forEach(function(s){ L.push('- ' + line(s)); });
    L.push('');
  }
  if(v.tags && v.tags.length){ L.push('## 话题标签'); L.push(''); L.push(v.tags.join(' ')); L.push(''); }
  if(v.cta){ L.push('## CTA'); L.push(''); L.push(line(v.cta)); L.push(''); }
  return L.join('\n');
}

export function buildStoryboardMd(v){
  var L = [];
  L.push('# ' + line(v.title || '视频号') + ' · 分镜表');
  L.push('');
  L.push('> 时长 ' + line(v.duration || '45s') + ' · 形式 ' + line(v.format || '口播干货') + ' · 9:16 竖版');
  L.push('');
  L.push('| 镜号 | 时间 | 画面 | 口播 | 字幕 | 素材 |');
  L.push('|---|---|---|---|---|---|');
  (v.shots || []).forEach(function(s, i){
    L.push('| ' + (i + 1) + ' | ' + line(s.at) + ' | ' + line(s.scene).replace(/\|/g, '/') +
      ' | ' + line(s.voice).replace(/\|/g, '/') + ' | ' + line(s.sub).replace(/\|/g, '/') +
      ' | ' + line(s.asset) + ' |');
  });
  L.push('');
  L.push('## 拍摄 / 制作提示');
  L.push('');
  ['前 3 秒必须出现钩子画面与大字幕，决定完播率。',
   '每镜只讲一个信息点，字幕与口播同步，单屏不超过 12 字。',
   '竖版画幅 1080×1920，主体避开顶部 220px（状态栏）与底部 360px（评论/操作区）。',
   '封面用 video/cover.png；首帧与封面同款，避免标题党落差。',
   '结尾 3 秒给关注/收藏 CTA，别堆多个。'].forEach(function(t){ L.push('- ' + t); });
  L.push('');
  return L.join('\n');
}

// 供 build.mjs 填充 templates/video-cover.html
export function videoCoverFields(v, brand){
  var cv = v.cover || {};
  var title = (cv.title || [v.title || '']).map(function(l){ return hl(l, cv.accent || v.accent); }).join('<br>');
  return {
    LOGO: esc((brand && brand.logo) || ((brand && brand.name || 'A').charAt(0))),
    BRAND: esc((brand && brand.name) || ''),
    COLUMN: esc((brand && brand.column) || ''),
    KICKER: esc(cv.kicker || v.kicker || v.format || '视频号'),
    TITLE: title,
    SUB: esc(cv.sub || v.hook || ''),
    VISUAL: hero(cv.hero || v.hero || { type: 'tiles', items: [{ icon: 'play', t: '看视频' }, { icon: 'bolt', t: '3 分钟' }] }),
    DURATION: esc(v.duration || '45s'),
    TAGS: (cv.tags || v.tags || []).slice(0, 3).map(chip).join('')
  };
}
