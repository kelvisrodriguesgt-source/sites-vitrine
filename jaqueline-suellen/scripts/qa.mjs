// QA ponta a ponta do build de produção: serve dist/ com os cabeçalhos do vercel.json (incluindo a CSP),
// percorre os fluxos principais no Chromium (1366 px e 390 px) e salva capturas em qa-screenshots/.
// Uso: npm run build && npm run qa   (CHROMIUM_PATH aponta para um Chrome/Chromium, se necessário)
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const out = join(root, 'qa-screenshots');
mkdirSync(out, { recursive: true });

const { chromium } = await import('playwright');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const globalHeaders = Object.fromEntries(vercel.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key.toLowerCase(), h.value]));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return void res.writeHead(404, { 'content-type': 'text/plain' }).end('404');
  res.writeHead(200, { ...globalHeaders, 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'OK  ' : 'FALHOU'} ${name}${ok ? '' : detail ? ` -> ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

function track(page, label) {
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    if (!/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  return () => check(`${label}: sem erros no console, sem violação de CSP, sem requisições falhas`, problems.length === 0, problems.join(' | '));
}

const scrollAll = async (page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
  });
  // As animações de entrada só rodam quando o observador dispara: espera todas terminarem.
  await page.waitForFunction(() => document.querySelectorAll('.will-reveal:not(.in)').length === 0, null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
};

const WA = '5569933004605';
const IG = 'https://www.instagram.com/jaquelinesuellen.estetica/';

try {
  // ---------- HTML estático e arquivos de SEO ----------
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  check('HTML pré-renderizado tem um único H1 com "Esteticista em Vilhena - RO"', (html.match(/<h1[\s>]/g) ?? []).length === 1 && /<h1[^>]*>[\s\S]*Esteticista em Vilhena - RO[\s\S]*<\/h1>/.test(html));
  check('HTML sem atributo style inline (CSP)', !/\sstyle="/.test(html));
  check('noindex no head', html.includes('content="noindex, nofollow"'));
  check('title correto', html.includes('<title>Esteticista em Vilhena - RO | Jaqueline Suellen Estética</title>'));
  check('JSON-LD BeautySalon sem aggregateRating', html.includes('"@type": "BeautySalon"') && !html.includes('aggregateRating'));
  check('canonical, og:image e twitter:card presentes', /rel="canonical"/.test(html) && /property="og:image"/.test(html) && /twitter:card/.test(html));
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  check('toda <img> tem alt, width e height', imgs.every((t) => /\salt="/.test(t) && /\swidth="/.test(t) && /\sheight="/.test(t)));
  for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'favicon.png', 'favicon.svg', 'apple-touch-icon.png', 'og-image.jpg', '.well-known/security.txt']) check(`dist/${f} existe`, existsSync(join(dist, f)));
  check('robots.txt permite rastrear (para o Google ler o noindex)', /Allow: \//.test(readFileSync(join(dist, 'robots.txt'), 'utf8')));
  check('cabeçalho X-Robots-Tag noindex e CSP configurados', globalHeaders['x-robots-tag'] === 'noindex, nofollow' && Boolean(globalHeaders['content-security-policy']));
  for (const id of ['inicio', 'tratamentos', 'profissional', 'sobre', 'resultados', 'depoimentos', 'instagram', 'agendar', 'contato']) check(`seção #${id} existe`, html.includes(`id="${id}"`));
  const waLinks = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1]);
  check(`todos os ${waLinks.length} links de WhatsApp usam o número ${WA}`, waLinks.length >= 10 && waLinks.every((u) => u.startsWith(`https://wa.me/${WA}`)), waLinks.find((u) => !u.startsWith(`https://wa.me/${WA}`)));
  const igLinks = [...html.matchAll(/href="(https:\/\/www\.instagram\.com[^"]*)"/g)].map((m) => m[1]);
  check('links do Instagram apontam para o perfil correto', igLinks.length >= 3 && igLinks.every((u) => u === IG));
  check('links externos têm rel noopener', [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].every((m) => /rel="noopener noreferrer"/.test(m[0])));
  for (const txt of ['Excelente profissional, bom atendimento e com pontualidade, super indico.', 'Solange Machado', '5,0 estrelas · 1 avaliação no Google', 'Deofo Antônio geremias', '(69) 93300-4605']) check(`texto real presente: ${txt.slice(0, 40)}`, html.includes(txt));
  check('sem depoimentos ou números inventados (lorem, "clientes atendidas")', !/lorem|clientes atendid|anos de experi/i.test(html));

  // ---------- Desktop ----------
  const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  await desktop.route('https://wa.me/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }));
  const d = await desktop.newPage();
  const finishD = track(d, 'Desktop');
  await d.goto(base, { waitUntil: 'networkidle' });
  await d.screenshot({ path: join(out, 'desktop-topo.png') });
  const bgTop = await d.evaluate(() => getComputedStyle(document.querySelector('header')).backgroundColor);
  await d.evaluate(() => window.scrollTo(0, 900));
  await d.waitForTimeout(500);
  const bgScrolled = await d.evaluate(() => getComputedStyle(document.querySelector('header')).backgroundColor);
  check('Cabeçalho transparente no topo e off-white ao rolar', /rgba\(0, 0, 0, 0\)|transparent/.test(bgTop) && !/rgba\(0, 0, 0, 0\)/.test(bgScrolled), `${bgTop} -> ${bgScrolled}`);
  await scrollAll(d);
  await d.screenshot({ path: join(out, 'desktop-completa.png'), fullPage: true });
  check('Desktop: sem rolagem horizontal', await d.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  check('Desktop: um único H1', (await d.locator('h1').count()) === 1);
  check('Desktop: menu com os 6 itens do briefing', (await d.locator('nav[aria-label="Principal"] a').allTextContents()).map((t) => t.trim().toUpperCase()).join('|') === 'INÍCIO|SOBRE|TRATAMENTOS|A PROFISSIONAL|RESULTADOS|CONTATO');
  check('Desktop: 6 cartões de tratamento', (await d.locator('#tratamentos article').count()) === 6);

  // Saiba mais
  const more = d.locator('#tratamentos article').first().getByRole('button', { name: /Saiba mais/ });
  check('"Saiba mais" começa fechado', (await more.getAttribute('aria-expanded')) === 'false');
  await more.click();
  check('"Saiba mais" abre o texto do tratamento', (await more.getAttribute('aria-expanded')) === 'true' && (await d.locator('#mais-limpeza-de-pele').isVisible()));

  // Link do cartão leva ao WhatsApp com o tratamento
  const cardHref = await d.locator('#tratamentos article').nth(1).locator('a[href^="https://wa.me/"]').getAttribute('href');
  check('Botão do cartão monta mensagem com o nome do tratamento', decodeURIComponent(cardHref ?? '').includes('Depilação a laser'));

  // Formulário: validação
  await d.locator('#agendar').scrollIntoViewIfNeeded();
  await d.getByRole('button', { name: /Enviar pelo WhatsApp/ }).click();
  const errTexts = await d.locator('#agendar [id$="-erro"]').allTextContents();
  check('Formulário vazio mostra 4 erros e não abre o WhatsApp', errTexts.length === 4 && (await desktop.pages()).length === 1, String(errTexts.length));
  check('Foco vai para o primeiro campo inválido', (await d.evaluate(() => document.activeElement?.getAttribute('name'))) === 'name');
  await d.locator('#agendar input[name="name"]').fill('Maria Teste');
  await d.locator('#agendar input[name="phone"]').fill('69123');
  await d.getByRole('button', { name: /Enviar pelo WhatsApp/ }).click();
  check('Telefone incompleto é recusado', /telefone com DDD/i.test((await d.locator('#agendar [id$="phone-erro"]').textContent()) ?? ''));
  await d.locator('#agendar input[name="phone"]').fill('69999990000');
  check('Máscara de telefone aplicada', (await d.locator('#agendar input[name="phone"]').inputValue()) === '(69) 99999-0000');
  await d.locator('#agendar select[name="procedure"]').selectOption('Massoterapia');
  await d.locator('#agendar select[name="day"]').selectOption('Quinta-feira');
  await d.locator('#agendar textarea[name="message"]').fill('Prefiro a tarde.');
  const popupPromise = desktop.waitForEvent('page');
  await d.getByRole('button', { name: /Enviar pelo WhatsApp/ }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  const popupUrl = decodeURIComponent(popup.url());
  check('Formulário válido abre wa.me com mensagem organizada', popupUrl.startsWith(`https://wa.me/${WA}?text=`) && ['Maria Teste', '(69) 99999-0000', 'Massoterapia', 'Quinta-feira', 'Prefiro a tarde.'].every((s) => popupUrl.includes(s)), popupUrl);
  const feedback = (await d.locator('#agendar [role="status"]').textContent()) ?? '';
  check('Feedback não afirma confirmação do horário', /só será confirmado pela profissional/.test(feedback) && !/agendamento confirmado|horário confirmado/i.test(feedback), feedback);
  await popup.close();

  await d.locator('#contato').scrollIntoViewIfNeeded();
  await d.waitForTimeout(500);
  await d.screenshot({ path: join(out, 'desktop-contato.png') });
  check('Contato: botões COMO CHEGAR e FALAR PELO WHATSAPP', (await d.getByRole('link', { name: /Como chegar/i }).count()) === 1 && (await d.getByRole('link', { name: /Falar pelo WhatsApp/i }).count()) === 1);
  check('Botão flutuante de WhatsApp visível', await d.getByRole('link', { name: /Falar com a Jaqueline pelo WhatsApp/ }).isVisible());
  finishD();

  // ---------- Mobile ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const m = await mobile.newPage();
  const finishM = track(m, 'Mobile');
  await m.goto(base, { waitUntil: 'networkidle' });
  await m.screenshot({ path: join(out, 'mobile-topo.png') });
  await scrollAll(m);
  await m.screenshot({ path: join(out, 'mobile-completa.png'), fullPage: true });
  check('Mobile: sem rolagem horizontal', await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), String(await m.evaluate(() => document.documentElement.scrollWidth)));
  const burger = m.getByRole('button', { name: 'Abrir menu' });
  await burger.click();
  check('Mobile: menu abre com os 6 itens + botão de agendar', (await m.locator('#menu-mobile a').count()) === 7);
  await m.screenshot({ path: join(out, 'mobile-menu.png') });
  await m.locator('#menu-mobile a', { hasText: 'Tratamentos' }).click();
  await m.waitForTimeout(700);
  check('Mobile: menu fecha ao escolher um item', (await m.locator('#menu-mobile').count()) === 0);
  const small = await m.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('a, button, input, select, textarea')) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || el.closest('[hidden]') || el.classList.contains('sr-only')) continue;
      if (r.height < 36 || r.width < 36) bad.push(`${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return bad;
  });
  check('Mobile: alvos de toque com pelo menos 36 px', small.length === 0, small.slice(0, 5).join(' | '));
  finishM();
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram.`);
if (failed.length) process.exit(1);
