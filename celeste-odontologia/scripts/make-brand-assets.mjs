// Gera favicon.svg/png, apple-touch-icon.png e og-image.jpg (1200x630) a partir da marca e da foto da recepção.
// Uso: node scripts/make-brand-assets.mjs   (precisa do Playwright instalado na raiz do repositório)
// Rode de novo depois de trocar public/img/recepcao.webp ou o nome/cidade em src/content/info.json.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import('playwright');
const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'src/content/info.json'), 'utf8'));
const first = info.brand.name.split(' ')[0].toUpperCase();
const city = `${info.address.city} - ${info.address.state}`;
const fonts = resolve(root, 'node_modules/@fontsource/cormorant-garamond/files');
const jost = resolve(root, 'node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2');
const url = (p) => pathToFileURL(p).href;

const mark = (stroke) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="120" fill="#0E2338"/><path d="M340 168a132 132 0 1 0 0 176" fill="none" stroke="${stroke}" stroke-width="34" stroke-linecap="round"/><circle cx="352" cy="256" r="14" fill="${stroke}"/></svg>`;
writeFileSync(resolve(root, 'public/favicon.svg'), mark('#EFE2CF'));

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:C;font-weight:600;src:url(${url(fonts + '/cormorant-garamond-latin-600-normal.woff2')})}
@font-face{font-family:C;font-weight:500;font-style:italic;src:url(${url(fonts + '/cormorant-garamond-latin-500-italic.woff2')})}
@font-face{font-family:J;font-weight:100 900;src:url(${url(jost)})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:#0E2338;color:#fff;font-family:J}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ov{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,25,43,.92) 0%,rgba(8,25,43,.55) 60%,rgba(8,25,43,.25) 100%)}
.box{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.logo{font-family:C;font-weight:600;font-size:92px;letter-spacing:.3em;line-height:1}
.seg{margin-top:14px;font-size:20px;letter-spacing:.5em;text-transform:uppercase;opacity:.85}
.line{width:72px;height:2px;background:#EFE2CF;margin:36px 0 28px}
.tag{font-family:C;font-style:italic;font-weight:500;font-size:40px;color:#EFE2CF}
.city{margin-top:18px;font-size:20px;letter-spacing:.2em;text-transform:uppercase;opacity:.8}
</style><img src="${url(resolve(root, 'public/img/recepcao.webp'))}"><div class="ov"></div>
<div class="box"><div class="logo">${first}</div><div class="seg">${info.brand.segment}</div><div class="line"></div>
<div class="tag">Mais que um sorriso.</div><div class="city">${city}</div></div>`;
const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const page = resolve(dir, 'og.html');
writeFileSync(page, html);
writeFileSync(resolve(dir, 'icon.html'), `<!doctype html><style>*{margin:0}svg{display:block;width:512px;height:512px}</style>${mark('#EFE2CF')}`);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(url(page));
await p.evaluate(() => document.fonts.ready);
await p.waitForLoadState('load');
await p.screenshot({ path: resolve(root, 'public/og-image.jpg'), type: 'jpeg', quality: 86 });
const q = await browser.newPage({ viewport: { width: 512, height: 512 } });
await q.goto(url(resolve(dir, 'icon.html')));
await q.screenshot({ path: resolve(root, 'public/favicon.png'), omitBackground: true });
const r = await browser.newPage({ viewport: { width: 180, height: 180 } });
await r.setContent(`<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${mark('#EFE2CF').replace('rx="120"', 'rx="0"')}`);
await r.screenshot({ path: resolve(root, 'public/apple-touch-icon.png') });
await browser.close();
console.log('Marca gerada: favicon.svg, favicon.png, apple-touch-icon.png, og-image.jpg');
