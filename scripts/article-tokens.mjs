// scripts/article-tokens.mjs — 文章内联样式的唯一来源
// 微信会剥离 <style>/外链，并只保留标签/属性白名单内的写法，所以最终 article.html：
//   1) 全部内联样式；2) 只用一个根 <section>，不输出 doctype/html/head/body；
//   3) 只用 p / span / strong / img / br（h1/h2/figure/figcaption/hr/table/blockquote 一律改写）。
// 这里集中管理所有色值/间距，scripts/article.mjs 与 scripts/gen-article-body.mjs 都从这里取。

export const ARTICLE = {
  // 根节点：不带 max-width / margin auto（微信不保留，且会挤压正文宽度）
  wrap: 'font-size:16px;line-height:1.75;color:#3F3F3F',
  topbar: 'margin:0 0 20px;padding:10px 14px;background:#F3F6FF;border-radius:8px;font-size:13px;color:#5B667A',
  // 标题用段落模拟：h1/h2 会被编辑器剥掉或改写
  h1: 'margin:0 0 12px;font-size:24px;line-height:1.4;font-weight:800;color:#101828',
  meta: 'margin:0 0 22px;font-size:13px;color:#98A2B3',
  lead: 'margin:0 0 20px;font-size:16px;line-height:1.78;color:#6B6B6B',
  p: 'margin:0 0 19px;font-size:16px;line-height:1.78;color:#3F3F3F',
  h2: 'margin:34px 0 14px;font-size:19px;font-weight:800;color:#2563EB;line-height:1.4',
  // 引用：blockquote 会被丢弃，用带左边框的段落代替
  quote: 'margin:0 0 22px;padding:14px 16px;background:#F7F8FA;border-left:4px solid #2563EB;border-radius:0 8px 8px 0;font-size:15px;line-height:1.7;color:#4B5563',
  // 图：figure/figcaption 不保留，用 p>img + p 图注；png 自带画布，不做圆角
  fig: 'margin:0 0 8px;text-align:center',
  img: 'width:100%;height:auto;display:block',
  cap: 'margin:0 0 24px;font-size:13px;line-height:1.6;color:#9A9A9A;text-align:center',
  // 表头：表格会丢，改成「加粗小标题 + 分条列表」
  th: 'margin:20px 0 8px;font-size:15px;line-height:1.6;font-weight:700;color:#2563EB',
  td: 'margin:0 0 10px;font-size:14px;line-height:1.7;color:#3F3F3F;padding-left:14px',
  tdc: 'margin:0 0 10px;font-size:14px;line-height:1.7;color:#5B667A;padding-left:14px',
  // 分割线：hr 会丢，用 1px 空段落代替
  hr: 'margin:28px 0;height:1px;line-height:1px;font-size:1px;border-top:1px solid #E5E7EB',
  link: 'margin:0 0 8px;font-size:15px;line-height:1.8;color:#3F3F3F;word-break:break-all',
  cta: 'margin:18px 0 0;padding:14px 16px;background:#EEF4FF;border-radius:10px;font-size:14px;color:#2563EB;text-align:center',
  li: 'margin:0 0 10px;font-size:16px;line-height:1.7;color:#3F3F3F',
  tocBox: 'margin:0 0 24px;padding:16px 18px;background:#F7F9FC;border:1px solid #E7ECF5;border-radius:10px',
  tocTitle: 'margin:0 0 8px;font-size:13px;font-weight:700;color:#98A2B3',
  tocItem: 'margin:0;font-size:14px;line-height:1.9;color:#2563EB',
  highlight: 'background:#FFF3C4;padding:1px 5px;border-radius:4px',
  accentText: 'color:#2563EB',
  zebra: 'background:#F7F9FC'
};

// 微信编辑器可安全接收的标签白名单（article.html 里除这些外不应出现别的标签）
export const MP_SAFE_TAGS = ['section', 'p', 'span', 'strong', 'b', 'em', 'i', 'img', 'br'];

// 微信会清理、写在 HTML 里会「看着有、粘过去没了」的属性
export const MP_DROP_ATTRS = ['font-family', 'letter-spacing', 'max-width', 'margin-left:auto', 'margin-right:auto'];
