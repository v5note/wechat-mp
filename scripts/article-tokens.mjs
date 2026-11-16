// scripts/article-tokens.mjs — 文章内联样式的唯一来源
// 微信会剥离 <style>/外链，所以最终 article.html 全部内联；这里集中管理所有色值/间距，
// scripts/article.mjs 与 scripts/gen-article-body.mjs 都从这里取。

export const ARTICLE = {
  wrap: 'max-width:680px;margin:0 auto;padding:8px 0;font-size:16px;line-height:1.75;color:#3F3F3F;letter-spacing:.5px;font-family:-apple-system,"PingFang SC",sans-serif',
  topbar: 'margin:0 0 20px;padding:10px 14px;background:#F3F6FF;border-radius:8px;font-size:13px;color:#5B667A;letter-spacing:.5px',
  h1: 'margin:0 0 12px;font-size:24px;line-height:1.4;font-weight:800;color:#101828',
  meta: 'margin:0 0 22px;font-size:13px;color:#98A2B3',
  lead: 'margin:0 0 20px;font-size:16px;line-height:1.78;color:#6B6B6B',
  p: 'margin:0 0 19px;font-size:16px;line-height:1.78;color:#3F3F3F;letter-spacing:.5px',
  h2: 'margin:34px 0 14px;font-size:19px;font-weight:800;color:#2563EB;line-height:1.4',
  quote: 'margin:0 0 22px;padding:14px 16px;background:#F7F8FA;border-left:4px solid #2563EB;border-radius:0 8px 8px 0;font-size:15px;line-height:1.7;color:#4B5563',
  fig: 'margin:0 0 24px;text-align:center',
  img: 'width:100%;border-radius:10px;display:block',
  cap: 'margin-top:8px;font-size:13px;color:#9A9A9A',
  th: 'background:#2563EB;color:#fff;padding:10px 12px;text-align:left;font-weight:700',
  td: 'padding:10px 12px;border-bottom:1px solid #EEF1F6',
  tdc: 'padding:10px 12px;border-bottom:1px solid #EEF1F6;color:#5B667A',
  hr: 'height:1px;background:#E5E7EB;margin:28px 0;border:none',
  link: 'margin:0 0 8px;font-size:15px;line-height:1.8;color:#3F3F3F',
  cta: 'margin:18px 0 0;padding:14px 16px;background:#EEF4FF;border-radius:10px;font-size:14px;color:#2563EB;text-align:center',
  li: 'margin:0 0 10px;font-size:16px;line-height:1.7;color:#3F3F3F',
  tocBox: 'margin:0 0 24px;padding:16px 18px;background:#F7F9FC;border:1px solid #E7ECF5;border-radius:10px',
  tocTitle: 'margin:0 0 8px;font-size:13px;font-weight:700;color:#98A2B3;letter-spacing:1px',
  tocItem: 'margin:0;font-size:14px;line-height:1.9;color:#2563EB',
  highlight: 'background:#FFF3C4;padding:1px 5px;border-radius:4px',
  zebra: 'background:#F7F9FC'
};
