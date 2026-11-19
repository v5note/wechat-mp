#!/usr/bin/env node
// scripts/video-render.mjs — 把 spec.video 的分镜渲染成可上传的 mp4（1080×1920）
// 依赖：ffmpeg（libx264 + subtitles/libass）+ macOS 的 say（TTS 旁白，可选）
// 用法：
//   node scripts/video-render.mjs --spec <spec.json> --out <版本目录>
//   node scripts/video-render.mjs --spec <spec.json> --out <版本目录> --no-tts
// 产出：video/video.mp4、video/字幕.ass、video/渲染说明.md
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { ROOT } from './chrome.mjs';

const W = 1080;
const H = 1920;
const PAD = 120;

const { values } = parseArgs({
  options: {
    spec: { type: 'string' },
    out: { type: 'string' },
    voice: { type: 'string', default: 'Tingting' },
    'no-tts': { type: 'boolean', default: false },
  },
});
if (!values.spec || !values.out) {
  console.error('用法: node scripts/video-render.mjs --spec <spec.json> --out <版本目录> [--no-tts]');
  process.exit(1);
}

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'buffer', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}
function has(bin) {
  try { execFileSync('bash', ['-lc', 'command -v ' + bin], { stdio: 'ignore' }); return true; } catch { return false; }
}
function mediaDuration(file) {
  try {
    const out = sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).trim();
    const d = Number.parseFloat(out);
    return Number.isFinite(d) ? d : 0;
  } catch { return 0; }
}
function shotRange(at) {
  const m = String(at).match(/(\d+(?:\.\d+)?)\s*[^0-9.]+\s*(\d+(?:\.\d+)?)/);
  return m ? { start: Number(m[1]), end: Number(m[2]) } : null;
}
function pad2(n) { return String(n).padStart(2, '0'); }

function resolveAsset(shot, ctx) {
  const a = String(shot.asset || '').trim();
  const card = a.match(/^卡片\s*(\d+)$/);
  if (card) return join(ctx.cards, 'card-' + pad2(card[1]) + '.png');
  if (a === '结尾卡') {
    const files = readdirSync(ctx.cards).filter((f) => /^card-\d+\.png$/.test(f)).sort();
    return join(ctx.cards, files[files.length - 1]);
  }
  if (a === '封面同款' || a === '封面') return ctx.cover;
  const fig = a.match(/^图\s*(\d+)$/);
  if (fig) return join(ctx.figs, 'fig' + fig[1] + '.png');
  if (existsSync(join(ROOT, a))) return join(ROOT, a);
  return ctx.cover;
}

function assTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h + ':' + pad2(m) + ':' + s.toFixed(2).padStart(5, '0');
}
function escAss(text) {
  return String(text).split('\\').join('\\\\').split('{').join('\\{').split('}').join('\\}').split('\n').join('\\N');
}

function buildAss(segs, footer, total) {
  const head = [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: ' + W,
    'PlayResY: ' + H,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Sub,Hiragino Sans GB,64,&H00FFFFFF,&H00FFFFFF,&H00181208,&H99000000,-1,0,0,0,100,100,1,0,3,9,0,2,80,80,150,1',
    'Style: Foot,Hiragino Sans GB,34,&H00B8C4D8,&H00FFFFFF,&H00181208,&H99000000,0,0,0,0,100,100,0,0,3,4,0,2,80,80,86,1',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
  const body = segs.map((s) => 'Dialogue: 0,' + assTime(s.start) + ',' + assTime(s.end) + ',Sub,,0,0,0,,' + escAss(s.sub));
  if (footer) body.push('Dialogue: 0,' + assTime(0) + ',' + assTime(total) + ',Foot,,0,0,0,,' + escAss(footer));
  return head.concat(body).join('\n') + '\n';
}

function main() {
  const spec = JSON.parse(readFileSync(values.spec, 'utf8'));
  const video = spec.video;
  if (!video || !Array.isArray(video.shots) || video.shots.length === 0) {
    console.error('spec.video.shots 为空，无法渲染');
    process.exit(1);
  }
  if (!has('ffmpeg') || !has('ffprobe')) {
    console.error('未安装 ffmpeg / ffprobe，无法渲染视频');
    process.exit(1);
  }
  const outDir = resolve(values.out);
  const vdir = join(outDir, 'video');
  mkdirSync(vdir, { recursive: true });
  const ctx = { cards: join(outDir, 'cards'), figs: join(outDir, 'article', 'images'), cover: join(vdir, 'cover.png') };
  const work = join(vdir, 'build');
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  const tts = !values['no-tts'] && has('say');
  const segs = [];
  let cursor = 0;
  video.shots.forEach(function (shot, i) {
    const n = pad2(i + 1);
    const img = resolveAsset(shot, ctx);
    if (!existsSync(img)) {
      console.error('分镜 ' + n + ' 找不到素材：' + shot.asset);
      process.exit(1);
    }
    const r = shotRange(shot.at) || { start: cursor, end: cursor + 3 };
    let dur = Math.max(2.2, r.end - r.start);
    let voiceFile = null;
    if (tts && shot.voice) {
      voiceFile = join(work, 'voice-' + n + '.aiff');
      try {
        sh('say', ['-v', values.voice, '-r', '190', '-o', voiceFile, shot.voice]);
        // 镜头时长 = max(分镜计划时长, 语音 + 0.5s)；旁白说完后画面仍停留计划时长，观众有时间读字
        const vd = Math.round((mediaDuration(voiceFile) + 0.5) * 10) / 10;
        dur = Math.max(2.6, r.end - r.start, vd);
      } catch {
        voiceFile = null;
      }
    }
    segs.push({ n: n, img: img, dur: dur, start: cursor, end: cursor + dur, sub: shot.sub || '', scene: shot.scene || '', voiceFile: voiceFile });
    cursor += dur;
  });

  // 每镜一张 1080×1920 画帧：卡图等比缩放居中，不裁切文字
  segs.forEach(function (s) {
    s.frame = join(work, 'frame-' + s.n + '.png');
    sh('ffmpeg', ['-y', '-v', 'error', '-i', s.img,
      '-vf', 'scale=' + (W - PAD * 2) + ':-2:flags=lanczos,pad=' + W + ':' + H + ':(ow-iw)/2:(oh-ih)/2:color=0x0B1020',
      '-frames:v', '1', s.frame]);
  });

  const listFile = join(work, 'list.txt');
  const listLines = segs.map(function (s) { return "file '" + s.frame.split("'").join("'\\''") + "'\nduration " + s.dur.toFixed(2); });
  listLines.push("file '" + segs[segs.length - 1].frame.split("'").join("'\\''") + "'");
  writeFileSync(listFile, listLines.join('\n') + '\n');

  const assPath = join(vdir, '字幕.ass');
  writeFileSync(assPath, buildAss(segs, (video.ctaKicker || '开源 · wechat-mp'), cursor));

  let audioPath = null;
  if (tts && segs.some(function (s) { return s.voiceFile; })) {
    const inputs = [];
    const filters = [];
    segs.forEach(function (s, i) {
      let src = s.voiceFile;
      if (!src) {
        src = join(work, 'sil-' + s.n + '.aiff');
        sh('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', s.dur.toFixed(2), src]);
      }
      inputs.push('-i', src);
      filters.push('[' + i + ':a]aresample=44100,aformat=sample_fmts=s16:channel_layouts=mono[a' + i + ']');
    });
    filters.push(segs.map(function (_, i) { return '[a' + i + ']'; }).join('') + 'concat=n=' + segs.length + ':v=0:a=1[out]');
    audioPath = join(work, 'voice.wav');
    sh('ffmpeg', ['-y', '-v', 'error'].concat(inputs, ['-filter_complex', filters.join(';'), '-map', '[out]', audioPath]));
    if (!existsSync(audioPath)) audioPath = null;
  }

  const mp4 = join(vdir, 'video.mp4');
  const subPath = assPath.split('\\').join('/').split(':').join('\\:').split("'").join("\\'");
  const vf = "subtitles='" + subPath + "':fontsdir=/System/Library/Fonts";
  const args = ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', listFile];
  if (audioPath) args.push('-i', audioPath);
  else args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
  args.push('-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4);
  sh('ffmpeg', args);

  const size = (readFileSync(mp4).length / 1024 / 1024).toFixed(1);
  const info = {
    duration: Math.round(cursor * 10) / 10,
    size: size,
    audio: audioPath ? 'TTS 旁白（' + values.voice + '，机器音）' : '无旁白（静音音轨）',
    shots: segs.map(function (s) { return '| ' + s.n + ' | ' + s.start.toFixed(1) + '–' + s.end.toFixed(1) + 's | ' + s.scene + ' | ' + s.sub + ' |'; }),
  };
  writeFileSync(join(vdir, '渲染说明.md'), [
    '# 视频渲染说明', '',
    '- 文件：video/video.mp4',
    '- 时长：' + info.duration + 's　画幅：1080×1920（9:16）　大小：' + info.size + ' MB',
    '- 音频：' + info.audio,
    '- 字幕：video/字幕.ass（单屏 ≤12 字，位于底部安全区之上）',
    audioPath ? '- 说明：TTS 为机器音，正式发布建议照同一份口播稿真人重录（见 口播稿.md）。' : '- 说明：图文轮播不配旁白；如需口播，照 口播稿.md 录音后替换音轨即可。',
    '',
    '## 分镜时间轴', '', '| 镜号 | 时间 | 画面 | 字幕 |', '|---|---|---|---|',
    info.shots.join('\n'), '',
    '重渲染：node scripts/video-render.mjs --spec <spec.json> --out <版本目录>', '',
  ].join('\n'));
  rmSync(work, { recursive: true, force: true });
  console.log('video: ' + mp4);
  console.log('  ' + info.duration + 's · ' + info.size + ' MB · ' + info.audio);
}

main();
