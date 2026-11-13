// Teste de ponta a ponta do site já compilado (rode "npm run build" antes): npm run qa
// Sobe um servidor local que aplica os cabeçalhos do vercel.json, abre o site no Chromium (Playwright da raiz do repositório),
// confere seções, links, menu, carrossel, vídeo, FAQ, SEO e painel /admin, e salva screenshots em QA_OUT (padrão: ./qa-out).
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const { chromium } = await import('playwright');
const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const out = resolve(process.env.QA_OUT ?? join(root, 'qa-out'));
mkdirSync(out, { recursive: true });
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const site = JSON.parse(readFileSync(join(root, 'src/content/info.json'), 'utf8'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.yml': 'text/yaml', '.wasm': 'application/wasm' };

const server = createServer((req, res) => {
  let path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  if (!existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  const headers = { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' };
  for (const rule of vercel.headers ?? []) {
    if (new RegExp(`^${rule.source}$`).test(path)) for (const h of rule.headers) headers[h.key.toLowerCase()] = h.value;
  }
  res.writeHead(200, headers).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

let pass = 0;
const fails = [];
const check = (name, ok, detail = '') => {
  if (ok) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function open(viewport, mobile = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await ctx.route('https://wa.me/**', (r) => r.fulfill({ status: 200, body: 'wa' }));
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  await page.goto(base, { waitUntil: 'load' });
  return { ctx, page, problems };
}

async function scrollAll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

for (const [label, viewport, mobile] of [['desktop-1366', { width: 1366, height: 800 }, false], ['mobile-390', { width: 390, height: 844 }, true]]) {
  const { ctx, page, problems } = await open(viewport, mobile);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(out, `${label}-hero.png`) });
  await scrollAll(page);

  check(`${label}: um único H1`, (await page.locator('h1').count()) === 1);
  check(`${label}: H1 acessível`, ((await page.locator('h1').innerText()) || '').toLowerCase().includes('mais que um sorriso'));
  const h1Text = await page.locator('h1').evaluate((e) => e.textContent);
  check(`${label}: H1 menciona a cidade`, h1Text.includes('Cidade Exemplo'));
  for (const id of ['inicio', 'tratamentos', 'a-clinica', 'tecnologia', 'equipe', 'como-funciona', 'duvidas', 'contato']) {
    check(`${label}: seção #${id}`, (await page.locator(`#${id}`).count()) === 1);
  }
  check(`${label}: sem rolagem horizontal`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  const imgs = await page.$$eval('img', (list) => list.map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.getAttribute('loading'), prio: i.getAttribute('fetchpriority') })));
  check(`${label}: todas as imagens carregam`, imgs.every((i) => i.ok), imgs.filter((i) => !i.ok).map((i) => i.src).join(','));
  check(`${label}: alt, width e height em todas`, imgs.every((i) => i.alt !== null && i.w && i.h));
  check(`${label}: hero com fetchpriority high`, imgs.some((i) => i.prio === 'high'));
  check(`${label}: demais imagens lazy`, imgs.filter((i) => i.prio !== 'high').every((i) => i.lazy === 'lazy'));

  // links de WhatsApp
  const wa = await page.$$eval('a[href^="https://wa.me/"]', (l) => l.map((a) => a.href));
  check(`${label}: botões de WhatsApp (>= 8)`, wa.length >= 8, String(wa.length));
  check(`${label}: todos usam o mesmo número`, wa.every((u) => u.startsWith(`https://wa.me/${site.contact.whatsapp}?text=`)));
  check(`${label}: cartões levam o tratamento`, wa.filter((u) => /implantes/i.test(decodeURIComponent(u))).length >= 1);

  // header vira vidro ao rolar
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(500);
  check(`${label}: cabeçalho vira vidro ao rolar`, (await page.locator('header .glass-bar').count()) === 1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  check(`${label}: cabeçalho transparente no topo`, (await page.locator('header .glass-bar').count()) === 0);

  // vídeo
  await page.getByRole('button', { name: /abrir vídeo/i }).click();
  await page.waitForTimeout(200);
  check(`${label}: modal do vídeo abre`, (await page.getByRole('dialog').count()) === 1 && (await page.getByText('vídeo do cliente aqui').count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check(`${label}: Esc fecha o modal`, (await page.getByRole('dialog').count()) === 0);

  // FAQ
  const q2 = page.getByRole('button', { name: /Preciso levar algum exame/ });
  await q2.scrollIntoViewIfNeeded();
  await q2.click();
  check(`${label}: FAQ abre a resposta`, (await q2.getAttribute('aria-expanded')) === 'true');
  check(`${label}: FAQ fecha a anterior`, (await page.getByRole('button', { name: /Como agendo/ }).getAttribute('aria-expanded')) === 'false');

  // carrossel
  const track = page.locator('#tratamentos ul').first();
  await track.scrollIntoViewIfNeeded();
  const before = await track.evaluate((e) => e.scrollLeft);
  if (!mobile) {
    check(`${label}: seta anterior desativada no início`, await page.getByRole('button', { name: 'Tratamentos anteriores' }).isDisabled());
    await page.getByRole('button', { name: 'Próximos tratamentos' }).click();
    await page.waitForTimeout(900);
    check(`${label}: seta avança o carrossel`, (await track.evaluate((e) => e.scrollLeft)) > before);
  } else {
    await track.evaluate((e) => e.scrollBy({ left: 320 }));
    await page.waitForTimeout(500);
    check(`${label}: carrossel rola no toque`, (await track.evaluate((e) => e.scrollLeft)) > before);
  }

  // menu móvel
  if (mobile) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.waitForTimeout(300);
    check(`${label}: menu móvel abre`, (await page.getByRole('dialog', { name: 'Menu' }).count()) === 1);
    check(`${label}: foco dentro do menu`, await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')));
    await page.screenshot({ path: join(out, `${label}-menu.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    check(`${label}: Esc fecha o menu`, (await page.getByRole('dialog').count()) === 0);
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Contato' }).click();
    await page.waitForTimeout(500);
    check(`${label}: link do menu fecha e rola`, (await page.getByRole('dialog').count()) === 0 && (await page.evaluate(() => window.scrollY)) > 500);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, `${label}-full.png`), fullPage: true });
  check(`${label}: sem erros no console`, problems.length === 0, problems.join(' | '));
  await ctx.close();
}

// cabeçalhos, head e arquivos
{
  const { ctx, page } = await open({ width: 1366, height: 800 });
  const res = await page.request.get(base);
  const h = res.headers();
  check('cabeçalho X-Robots-Tag noindex', h['x-robots-tag'] === 'noindex, nofollow');
  check('cabeçalho CSP estrito', (h['content-security-policy'] ?? '').includes("script-src 'self'") && !(h['content-security-policy'] ?? '').includes('unsafe'));
  check('cabeçalhos de segurança', h['x-frame-options'] === 'DENY' && h['x-content-type-options'] === 'nosniff' && !!h['strict-transport-security'] && !!h['permissions-policy'] && !!h['referrer-policy']);
  check('meta robots noindex', (await page.locator('meta[name="robots"]').getAttribute('content')) === 'noindex, nofollow');
  check('canonical', (await page.locator('link[rel="canonical"]').getAttribute('href')).endsWith('/'));
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  check('JSON-LD Dentist', ld['@type'] === 'Dentist' && !ld.aggregateRating);
  check('sem atributos style inline no HTML', !/\sstyle="/.test(readFileSync(join(dist, 'index.html'), 'utf8')));
  for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', '.well-known/security.txt', 'og-image.jpg', 'favicon.svg', 'admin']) {
    check(`arquivo /${f}`, (await page.request.get(`${base}/${f}`)).ok());
  }
  const robots = await (await page.request.get(`${base}/robots.txt`)).text();
  check('robots.txt não bloqueia o protótipo', robots.includes('Allow: /') && !robots.includes('Disallow: /'));
  await ctx.close();
}

// painel /admin (painel próprio, modo demonstração)
for (const [label, viewport, mobile] of [['desktop', { width: 1366, height: 800 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  const { ctx, page, problems } = await open(viewport, mobile);
  await page.goto(`${base}/admin`, { waitUntil: 'load' });
  const pass0 = page.locator('#senha');
  await pass0.waitFor({ timeout: 10000 }).catch(() => {});
  check(`admin ${label}: tela de login`, (await pass0.count()) > 0);
  await page.screenshot({ path: join(out, `admin-login-${label}.png`) });
  await pass0.fill('errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  check(`admin ${label}: senha errada mostra erro`, (await page.getByText('Senha incorreta').count()) > 0);
  await pass0.fill('celeste123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByText('O que você quer mudar hoje?').waitFor({ timeout: 10000 }).catch(() => {});
  check(`admin ${label}: entra com a senha de demonstração`, (await page.getByText('O que você quer mudar hoje?').count()) > 0);
  check(`admin ${label}: noindex`, (await page.locator('meta[name="robots"]').getAttribute('content')) === 'noindex, nofollow');
  await page.screenshot({ path: join(out, `admin-inicio-${label}.png`), fullPage: true });

  for (const route of ['tratamentos', 'fotos', 'contato', 'equipe', 'perguntas', 'textos', 'numeros', 'inicio']) {
    await page.evaluate((r) => { location.hash = `#/${r}`; }, route);
    await page.waitForTimeout(250);
    check(`admin ${label}: página ${route} abre`, (await page.locator('main h1').count()) > 0, await page.locator('main').innerText().then((t) => t.slice(0, 60)).catch(() => ''));
    if (route !== 'inicio') await page.screenshot({ path: join(out, `admin-${route}-${label}.png`), fullPage: true });
  }

  if (label === 'desktop') {
    // editar o WhatsApp e conferir no site, no mesmo navegador
    await page.evaluate(() => { location.hash = '#/contato'; });
    const wa = page.getByLabel(/WhatsApp que recebe/);
    await wa.waitFor({ timeout: 5000 }).catch(() => {});
    await wa.fill('65 98888-7777');
    check('admin: barra de salvar aparece ao editar', (await page.getByText('Você tem alterações para salvar.').count()) > 0);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await page.getByText('Já aparece no site').first().waitFor({ timeout: 5000 }).catch(() => {});
    check('admin: salvar mostra aviso de confirmação', (await page.getByText('Já aparece no site').count()) > 0);
    const site = await ctx.newPage();
    await site.goto(base, { waitUntil: 'load' });
    await site.waitForTimeout(500);
    const hrefs = await site.locator('a[href*="wa.me"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    check('site reflete o novo WhatsApp', hrefs.length > 0 && hrefs.every((h) => h.includes('5565988887777')), hrefs[0] ?? 'sem links');

    // editar um texto do site
    await page.evaluate(() => { location.hash = '#/textos'; });
    const topo = page.getByRole('button', { name: /Topo do site/ });
    if ((await topo.getAttribute('aria-expanded')) !== 'true') await topo.click();
    const sub = page.getByLabel('Frase abaixo do título');
    await sub.waitFor({ timeout: 5000 }).catch(() => {});
    await sub.fill('Frase editada pelo painel.');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await page.waitForTimeout(300);
    await site.reload({ waitUntil: 'load' });
    await site.waitForTimeout(500);
    check('site reflete o texto editado', (await site.getByText('Frase editada pelo painel.').count()) > 0);

    // voltar tudo ao padrão
    await page.evaluate(() => { location.hash = '#/inicio'; });
    await page.getByRole('button', { name: 'Voltar tudo ao padrão' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Voltar ao padrão' }).click();
    await page.waitForTimeout(300);
    await site.reload({ waitUntil: 'load' });
    await site.waitForTimeout(500);
    check('voltar ao padrão restaura o site', (await site.getByText('Frase editada pelo painel.').count()) === 0);
    await site.close();

    // sair
    await page.getByRole('button', { name: 'Sair' }).click();
    check('admin: sair volta ao login', (await page.locator('#senha').count()) > 0);
  }
  check(`admin ${label}: sem erros no console`, problems.length === 0, problems.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log(`QA: ${pass} verificações ok, ${fails.length} falhas. Screenshots em ${out}`);
for (const f of fails) console.log(`  ✗ ${f}`);
process.exit(fails.length ? 1 : 0);
