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
  for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', '.well-known/security.txt', 'og-image.jpg', 'favicon.svg', 'admin/config.yml']) {
    check(`arquivo /${f}`, (await page.request.get(`${base}/${f}`)).ok());
  }
  const robots = await (await page.request.get(`${base}/robots.txt`)).text();
  check('robots.txt não bloqueia o protótipo', robots.includes('Allow: /') && !robots.includes('Disallow: /'));
  await ctx.close();
}

// painel /admin (Decap, modo demonstração)
{
  const { ctx, page } = await open({ width: 1366, height: 800 });
  await page.goto(`${base}/admin`, { waitUntil: 'load' });
  const login = page.getByRole('button', { name: /entrar|login/i });
  await login.waitFor({ timeout: 20000 }).catch(() => {});
  check('admin: tela de login do Decap', (await login.count()) > 0);
  if ((await login.count()) > 0) {
    await login.click();
    await page.getByText('Dados da clínica').first().waitFor({ timeout: 20000 }).catch(() => {});
    check('admin: arquivos de conteúdo listados', (await page.getByText('Dados da clínica').count()) > 0 && (await page.getByText('Equipe').count()) > 0);
    await page.getByText('Equipe').first().click().catch(() => {});
    await page.waitForTimeout(1500);
    check('admin: formulário da equipe abre com dados', (await page.getByText('Dra. Helena Duarte').count()) > 0 || (await page.locator('input').count()) > 0);
    await page.screenshot({ path: join(out, 'admin.png') });
  }
  check('admin: noindex', (await page.locator('meta[name="robots"]').getAttribute('content')) === 'noindex, nofollow');
  await ctx.close();
}

await browser.close();
server.close();
console.log(`QA: ${pass} verificações ok, ${fails.length} falhas. Screenshots em ${out}`);
for (const f of fails) console.log(`  ✗ ${f}`);
process.exit(fails.length ? 1 : 0);
