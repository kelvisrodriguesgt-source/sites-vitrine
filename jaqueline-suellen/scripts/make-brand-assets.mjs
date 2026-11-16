// Gera favicon.svg/png, apple-touch-icon.png e og-image.jpg (1200x630) a partir do monograma e do nome da marca.
// Uso: npm run assets   (precisa do Playwright instalado na raiz do repositório; CHROMIUM_PATH opcional)
// Rode de novo depois de trocar nome/cidade em src/config/site.ts ou as cores.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import('playwright');
const root = resolve(import.meta.dirname, '..');
const { site } = await import(pathToFileURL(resolve(root, 'src/config/site.ts')).href).catch(async () => {
  // Fora do Vite/tsx, lê as cores e o nome direto do arquivo (formato simples e estável).
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(resolve(root, 'src/config/site.ts'), 'utf8');
  const pick = (re, d) => (src.match(re) ?? [, d])[1];
  return { site: { brand: { professional: pick(/professional: '([^']+)'/, 'Jaqueline Suellen'), initials: pick(/initials: '([^']+)'/, 'JS') }, address: { city: pick(/city: '([^']+)'/, 'Vilhena'), state: pick(/state: '([^']+)'/, 'RO') } } };
});
const C = { nude: '#E9DED3', offwhite: '#F8F5F0', champagne: '#B59B85', taupe: '#766052', cocoa: '#292421' };
const city = `${site.address.city} - ${site.address.state}`;
const font = (name, file) => pathToFileURL(resolve(root, `node_modules/@fontsource-variable/${name}/files/${file}`)).href;
const cormorant = font('cormorant-garamond', 'cormorant-garamond-latin-wght-normal.woff2');
const montserrat = font('montserrat', 'montserrat-latin-wght-normal.woff2');

const mark = (rx = 112) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${rx}" fill="${C.cocoa}"/><circle cx="256" cy="256" r="196" fill="none" stroke="${C.champagne}" stroke-width="6"/><circle cx="256" cy="256" r="178" fill="none" stroke="${C.champagne}" stroke-width="2" opacity=".6"/><text x="256" y="302" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="190" font-weight="600" letter-spacing="4" fill="${C.offwhite}">${site.brand.initials}</text></svg>`;
writeFileSync(resolve(root, 'public/favicon.svg'), mark());

const ring = (color) => `<svg viewBox="0 0 200 200" width="420" height="420"><circle cx="100" cy="100" r="96" fill="none" stroke="${color}" stroke-width="1.2"/><circle cx="100" cy="100" r="88" fill="none" stroke="${color}" stroke-width=".5" opacity=".6"/><text x="100" y="122" text-anchor="middle" font-family="C" font-size="78" font-weight="500" letter-spacing="2" fill="${color}">${site.brand.initials}</text></svg>`;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:C;font-weight:300 700;src:url(${cormorant})}
@font-face{font-family:M;font-weight:100 900;src:url(${montserrat})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:linear-gradient(135deg,${C.offwhite} 0%,${C.nude} 100%);color:${C.cocoa};font-family:M}
.ring{position:absolute;right:70px;top:105px;opacity:.55}
.box{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;max-width:720px}
.logo{font-family:C;font-weight:600;font-size:34px;letter-spacing:.2em;text-transform:uppercase}
.sub{margin-top:8px;font-size:15px;font-weight:500;letter-spacing:.34em;text-transform:uppercase;color:${C.taupe}}
.rule{width:64px;height:1px;background:${C.champagne};margin:44px 0 36px}
h1{font-family:C;font-weight:500;font-size:84px;line-height:1.04;letter-spacing:.03em;text-transform:uppercase}
.city{margin-top:30px;font-size:24px;letter-spacing:.06em;color:${C.taupe}}
.line{position:absolute;left:0;right:0;bottom:0;height:10px;background:${C.champagne}}
</style>
<div class="ring">${ring(C.champagne)}</div>
<div class="box"><div class="logo">${site.brand.professional}</div><div class="sub">Estética e bem-estar</div><div class="rule"></div><h1>Sua beleza merece<br>um cuidado especial.</h1><div class="city">Esteticista em ${city}</div></div><div class="line"></div>`;
const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const page = resolve(dir, 'og.html');
writeFileSync(page, html);
writeFileSync(resolve(dir, 'icon.html'), `<!doctype html><style>@font-face{font-family:"Cormorant Garamond";font-weight:300 700;src:url(${cormorant})}*{margin:0}svg{display:block;width:512px;height:512px}</style>${mark()}`);
writeFileSync(resolve(dir, 'apple.html'), `<!doctype html><style>@font-face{font-family:"Cormorant Garamond";font-weight:300 700;src:url(${cormorant})}*{margin:0}svg{display:block;width:180px;height:180px}</style>${mark(0)}`);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const shot = async (file, w, h, out, opts = {}) => {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(file).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState('load');
  await p.screenshot({ path: resolve(root, out), ...opts });
};
await shot(page, 1200, 630, 'public/og-image.jpg', { type: 'jpeg', quality: 88 });
await shot(resolve(dir, 'icon.html'), 512, 512, 'public/favicon.png', { omitBackground: true });
await shot(resolve(dir, 'apple.html'), 180, 180, 'public/apple-touch-icon.png');
await browser.close();
console.log('Imagens da marca geradas em public/.');
