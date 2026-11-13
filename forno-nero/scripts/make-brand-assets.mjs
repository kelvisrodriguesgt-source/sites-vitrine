// Gera favicon.svg/png, apple-touch-icon.png e og-image.jpg (1200x630) a partir da marca e da pizza do topo.
// Uso: node scripts/make-brand-assets.mjs   (precisa do Playwright instalado na raiz do repositório)
// Rode de novo depois de trocar public/img/hero.webp ou o nome/cidade em src/content/info.json.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import('playwright');
const root = resolve(import.meta.dirname, '..');
const info = JSON.parse(readFileSync(resolve(root, 'src/content/info.json'), 'utf8'));
const city = `${info.address.city} - ${info.address.state}`;
const unbounded = resolve(root, 'node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2');
const inter = resolve(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const url = (p) => pathToFileURL(p).href;

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0B0B0B"/><g transform="translate(96 88) scale(20)"><path d="M16 30 3.6 8.4A18 18 0 0 1 28.4 8.4Z" fill="#E8751A"/><path d="M3.6 8.4A18 18 0 0 1 28.4 8.4l-1.7 2.9a14.6 14.6 0 0 0-21.4 0Z" fill="#F2B24A"/><circle cx="12.5" cy="14.5" r="2.4" fill="#E53935"/><circle cx="19.5" cy="13.5" r="2.1" fill="#E53935"/><circle cx="16" cy="20" r="2.2" fill="#E53935"/></g></svg>`;
writeFileSync(resolve(root, 'public/favicon.svg'), mark);

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:U;font-weight:100 900;src:url(${url(unbounded)})}
@font-face{font-family:I;font-weight:100 900;src:url(${url(inter)})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 78% 55%,#3a1210 0%,#0B0B0B 62%);color:#fff;font-family:I}
.pizza{position:absolute;right:-170px;top:-10px;width:760px;transform:rotate(-14deg);filter:drop-shadow(0 30px 40px rgba(0,0,0,.6))}
.box{position:absolute;left:78px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;max-width:620px}
.logo{display:flex;align-items:center;gap:18px;font-family:U;font-weight:800;font-size:30px;letter-spacing:-.02em}
.logo svg{width:56px;height:56px}
h1{margin-top:34px;font-family:U;font-weight:800;font-size:92px;line-height:1;letter-spacing:-.03em}
h1 span{display:block;color:#E8751A}
.sub{margin-top:22px;font-size:26px;color:#A3A3A3}
.cta{margin-top:34px;align-self:flex-start;background:#E53935;border-radius:999px;padding:18px 36px;font-weight:800;font-size:24px;text-transform:uppercase;letter-spacing:.04em}
</style>
<img class="pizza" src="${url(resolve(root, 'public/img/hero.webp'))}">
<div class="box"><div class="logo"><svg viewBox="0 0 32 32"><path d="M16 30 3.6 8.4A18 18 0 0 1 28.4 8.4Z" fill="#E8751A"/><path d="M3.6 8.4A18 18 0 0 1 28.4 8.4l-1.7 2.9a14.6 14.6 0 0 0-21.4 0Z" fill="#F2B24A"/><circle cx="12.5" cy="14.5" r="2.4" fill="#E53935"/><circle cx="19.5" cy="13.5" r="2.1" fill="#E53935"/><circle cx="16" cy="20" r="2.2" fill="#E53935"/></svg>${info.brand.name}</div>
<h1>Pizza<span>e muito mais!</span></h1><div class="sub">${info.brand.segment} · ${city}</div><div class="cta">Peça pelo WhatsApp</div></div>`;
const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const page = resolve(dir, 'og.html');
writeFileSync(page, html);
writeFileSync(resolve(dir, 'icon.html'), `<!doctype html><style>*{margin:0}svg{display:block;width:512px;height:512px}</style>${mark}`);

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
await r.setContent(`<!doctype html><style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${mark.replace('rx="112"', 'rx="0"')}`);
await r.screenshot({ path: resolve(root, 'public/apple-touch-icon.png') });
await browser.close();
console.log('Imagens da marca geradas em public/.');
