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
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path === '/admin') path = '/admin/index.html';
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
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
};

try {
  // ---------- HTML estático e arquivos de SEO ----------
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  check('HTML pré-renderizado tem um único H1 com "Pizzaria delivery em Cidade Exemplo"', (html.match(/<h1[\s>]/g) ?? []).length === 1 && /<h1[^>]*>[\s\S]*Pizzaria delivery em Cidade Exemplo[\s\S]*<\/h1>/.test(html));
  check('HTML sem atributo style inline (CSP)', !/\sstyle="/.test(html));
  check('noindex no head', html.includes('content="noindex, nofollow"'));
  check('title correto', html.includes('<title>Forno Nero Pizzaria | Pizzaria delivery em Cidade Exemplo - MT</title>'));
  check('JSON-LD Restaurant sem aggregateRating', html.includes('"@type": "Restaurant"') && !html.includes('aggregateRating'));
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  check('toda <img> tem alt, width e height', imgs.every((t) => /\salt="/.test(t) && /\swidth="/.test(t) && /\sheight="/.test(t)), imgs.filter((t) => !/\salt="/.test(t) || !/\swidth="/.test(t) || !/\sheight="/.test(t)).slice(0, 2).join(' '));
  check('imagem principal com fetchpriority=high', /<img[^>]*fetchpriority="high"/i.test(html) || /<img[^>]*fetchPriority="high"/.test(html));
  for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'favicon.png', 'og-image.jpg', '.well-known/security.txt']) check(`dist/${f} existe`, existsSync(join(dist, f)));
  check('robots.txt permite rastrear (para o Google ler o noindex)', /Allow: \//.test(readFileSync(join(dist, 'robots.txt'), 'utf8')));
  check('cabeçalho X-Robots-Tag noindex e CSP configurados', globalHeaders['x-robots-tag'] === 'noindex, nofollow' && Boolean(globalHeaders['content-security-policy']));

  // ---------- Desktop ----------
  const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  const d = await desktop.newPage();
  const finishD = track(d, 'Desktop');
  await d.goto(base, { waitUntil: 'networkidle' });
  await scrollAll(d);
  await d.screenshot({ path: join(out, 'desktop-topo.png') });
  await d.screenshot({ path: join(out, 'desktop-completa.png'), fullPage: true });
  check('Desktop: sem rolagem horizontal', await d.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  check('Desktop: um único H1 na página', (await d.locator('h1').count()) === 1);

  const countCards = () => d.locator('#itens li').count();
  const first = await countCards();
  await d.getByRole('button', { name: /Ver todo o cardápio/i }).click();
  const total = await countCards();
  check('Cardápio abre com 6 itens e "Ver todo o cardápio" mostra os 23', first === 6 && total === 23, `${first}/${total}`);

  // filtro por categoria
  await d.getByRole('group', { name: 'Categorias' }).getByRole('button', { name: /^Esfihas/ }).click();
  check('Filtro por categoria (Esfihas = 3)', (await countCards()) === 3, String(await countCards()));
  await d.getByRole('group', { name: 'Categorias' }).getByRole('button', { name: /^Todos/ }).click();

  // busca sem acento por ingrediente
  await d.locator('#busca').fill('gorgonzola');
  await d.getByRole('search').getByRole('button', { name: 'Buscar' }).click();
  const found = await countCards();
  check('Busca por ingrediente "gorgonzola" encontra Quatro Queijos', found >= 1 && found < 5 && (await d.locator('#itens').innerText()).includes('Quatro Queijos'), String(found));
  await d.locator('#busca').fill('xyzxyz');
  await d.getByRole('search').getByRole('button', { name: 'Buscar' }).click();
  check('Busca sem resultado mostra mensagem (nenhum card)', (await countCards()) === 0);
  await d.locator('#busca').fill('');
  await d.getByRole('search').getByRole('button', { name: 'Buscar' }).click();

  // tamanho obrigatório + adicionar
  const pep = d.locator('#itens li', { has: d.getByRole('heading', { name: 'Pepperoni', exact: true }) });
  await pep.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  check('Pizza sem tamanho não entra no carrinho e pede o tamanho', (await d.locator('[aria-label^="Abrir pedido, 0"]').count()) > 0);
  await pep.getByRole('button', { name: /^Grande/ }).click();
  check('Escolher G troca "a partir de" pelo preço exato R$ 76,90', (await pep.innerText()).includes('R$ 76,90') && !(await pep.innerText()).includes('a partir de'));
  await pep.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await pep.getByRole('button', { name: /^Média/ }).click();
  await pep.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await d.getByRole('button', { name: /^Abrir pedido/ }).first().click();
  const cart = d.getByRole('dialog', { name: 'Seu pedido' });
  await cart.waitFor();
  check('Carrinho: pepperoni G e M são linhas distintas', (await cart.getByTestId('cart-line').count()) === 2);
  check('Carrinho: total R$ 136,80 (76,90 + 59,90)', (await cart.innerText()).includes('R$ 136,80'));
  await d.screenshot({ path: join(out, 'desktop-carrinho.png') });

  // checkout
  await cart.getByRole('button', { name: /Aumentar quantidade de Pepperoni \(M\)/ }).click();
  check('Carrinho: aumentar quantidade soma (R$ 196,70)', (await cart.innerText()).includes('R$ 196,70'));
  await cart.getByRole('button', { name: /Remover Pepperoni \(M\)/ }).click();
  check('Carrinho: remover item', (await cart.getByTestId('cart-line').count()) === 1);
  await cart.getByRole('button', { name: 'Finalizar pedido' }).click();
  // tentativa inválida
  await cart.locator('button[type="submit"]').click();
  check('Checkout inválido mostra erros e não abre o WhatsApp', (await cart.locator('[role="alert"]').count()) >= 2);
  await d.locator('#co-name').fill('Ana Teste');
  await d.locator('#co-address').fill('Rua das Flores, 100');
  await d.locator('#co-pay').selectOption('Dinheiro');
  await d.locator('#co-change').fill('50');
  await cart.locator('button[type="submit"]').click();
  check('Troco menor que o total é recusado', (await cart.locator('[role="alert"]').count()) >= 1);
  await d.locator('#co-change').fill('');
  await d.locator('#co-pay').selectOption('Pix');
  await d.context().route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: 'wa' }));
  const [popup] = await Promise.all([
    d.context().waitForEvent('page', { timeout: 8000 }).catch(() => null),
    cart.locator('button[type="submit"]').click()
  ]);
  const waUrl = popup ? popup.url() : '';
  check('Tela "WhatsApp aberto" mostra o número do pedido', (await cart.innerText()).includes('Pedido #'));
  check('Checkout abre wa.me do número configurado', waUrl.startsWith('https://wa.me/5565999034981?text='), waUrl);
  const waText = decodeURIComponent(waUrl.split('text=')[1] ?? '');
  check('Mensagem tem cliente, item com tamanho e total', waText.includes('Ana Teste') && waText.includes('1x Pepperoni (G)') && waText.includes('R$ 76,90'), waText);
  if (popup) await popup.close();

  // meio a meio
  await d.goto(base, { waitUntil: 'networkidle' });
  await d.locator('#itens li').first().getByRole('button', { name: 'Meio a meio' }).click();
  const half = d.getByRole('dialog', { name: 'Pizza meio a meio' });
  await half.waitFor();
  await d.locator('#half-1').selectOption({ label: 'Calabresa' });
  await d.locator('#half-2').selectOption({ label: 'Quatro Queijos' });
  await half.getByRole('button', { name: /^G\s*8 fatias/ }).click();
  check('Meio a meio mostra o preço do sabor mais caro (R$ 74,90)', (await half.innerText()).includes('74,90'), await half.innerText());
  await d.screenshot({ path: join(out, 'desktop-meio-a-meio.png') });
  await half.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await d.getByRole('button', { name: /^Abrir pedido/ }).first().click();
  const cart2 = d.getByRole('dialog', { name: 'Seu pedido' });
  const cart2Text = await cart2.innerText();
  check('Carrinho mostra a pizza G meio a meio com os dois sabores e R$ 74,90', cart2Text.includes('Pizza G meio a meio') && cart2Text.includes('Calabresa / Quatro Queijos') && cart2Text.includes('R$ 74,90'), cart2Text.slice(0, 300));
  await d.keyboard.press('Escape');

  // minijogo
  await d.locator('#jogo').scrollIntoViewIfNeeded();
  await d.getByRole('button', { name: /Jogar/ }).first().click();
  const game = d.getByRole('dialog');
  await game.waitFor();
  await d.screenshot({ path: join(out, 'desktop-jogo-inicio.png') });
  await game.getByRole('button', { name: /Começar|Jogar/ }).click();
  await d.mouse.move(683, 600);
  await d.waitForTimeout(2200);
  const time = await game.getByTestId('game-time').innerText();
  check('Minijogo roda: o tempo diminui a partir de 30s', Number.parseInt(time, 10) < 30, time);
  await d.keyboard.down('ArrowLeft');
  await d.waitForTimeout(400);
  await d.keyboard.up('ArrowLeft');
  await d.screenshot({ path: join(out, 'desktop-jogo.png') });
  await d.keyboard.press('Escape');
  check('Minijogo fecha com Esc', (await d.getByRole('dialog').count()) === 0);

  // avaliações: nunca inventadas
  const reviewsText = await d.locator('#avaliacoes').innerText();
  check('Avaliações: estado vazio honesto, sem depoimentos inventados', reviewsText.includes('Avaliações do Google aparecem aqui'));

  // rodapé demonstrativo
  const footer = await d.locator('footer').innerText();
  check('Rodapé: aviso demonstrativo e crédito Grupo KR', footer.includes('Site demonstrativo — Grupo KR') && footer.includes('Site desenvolvido por Grupo KR') && footer.includes('Imagens meramente ilustrativas'));
  finishD();

  // ---------- Painel admin: edição reflete no site ----------
  const a = await desktop.newPage();
  const finishA = track(a, 'Admin');
  await a.goto(`${base}/admin`, { waitUntil: 'networkidle' });
  await a.screenshot({ path: join(out, 'admin-login.png') });
  await a.locator('#senha').fill('errada');
  await a.locator('button[type="submit"]').click();
  check('Admin: senha errada é recusada', (await a.locator('#senha-erro').count()) === 1);
  await a.locator('#senha').fill('forno123');
  await a.locator('button[type="submit"]').click();
  await a.waitForSelector('text=Dashboard', { timeout: 8000 });
  await a.waitForTimeout(500);
  await a.screenshot({ path: join(out, 'admin-dashboard.png') });
  check('Admin: entra com a senha de demonstração', true);
  await a.goto(`${base}/admin#/pedidos`);
  await a.waitForTimeout(500);
  await a.screenshot({ path: join(out, 'admin-pedidos.png') });
  await a.goto(`${base}/admin#/produtos`);
  await a.getByRole('button', { name: 'Editar Pepperoni' }).click();
  const dlg = a.getByRole('dialog', { name: 'Editar produto' });
  await dlg.waitFor();
  await a.getByLabel('Preço do tamanho Pequena').fill('39,90');
  await a.screenshot({ path: join(out, 'admin-produto.png') });
  await dlg.getByRole('button', { name: 'Salvar alterações' }).click();
  await a.waitForTimeout(500);
  const site2 = await desktop.newPage();
  await site2.goto(base, { waitUntil: 'networkidle' });
  const pepAfter = site2.locator('#itens li', { has: site2.getByRole('heading', { name: 'Pepperoni', exact: true }) });
  check('Admin: preço do tamanho P alterado aparece no site (a partir de R$ 39,90)', (await pepAfter.innerText()).includes('39,90'), await pepAfter.innerText());
  // novo pedido no site aparece no painel
  await pepAfter.getByRole('button', { name: /^Pequena/ }).click();
  await pepAfter.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await site2.getByRole('button', { name: /^Abrir pedido/ }).first().click();
  await site2.getByRole('dialog', { name: 'Seu pedido' }).getByRole('button', { name: 'Finalizar pedido' }).click();
  await site2.locator('#co-name').fill('Cliente QA');
  await site2.locator('#co-address').fill('Av. Teste, 1');
  await site2.locator('#co-pay').selectOption('Pix');
  await site2.context().route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: 'wa' }));
  await Promise.all([site2.context().waitForEvent('page', { timeout: 8000 }).then((p) => p.close()).catch(() => null), site2.getByRole('dialog', { name: 'Seu pedido' }).locator('button[type="submit"]').click()]);
  await a.goto(`${base}/admin#/pedidos`);
  await a.reload();
  await a.locator('#senha').fill('forno123').catch(() => null);
  await a.waitForTimeout(800);
  check('Admin: pedido feito no site aparece em Pedidos', (await a.locator('body').innerText()).includes('Cliente QA'));
  finishA();
  await site2.close();

  // ---------- Celular ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const m = await mobile.newPage();
  const finishM = track(m, 'Mobile');
  await m.goto(base, { waitUntil: 'networkidle' });
  await scrollAll(m);
  await m.screenshot({ path: join(out, 'mobile-topo.png') });
  await m.screenshot({ path: join(out, 'mobile-completa.png'), fullPage: true });
  check('Mobile: sem rolagem horizontal', await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const small = await m.evaluate(() => [...document.querySelectorAll('a[href],button,select,input')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && (r.height < 36 || r.width < 36) && getComputedStyle(e).visibility !== 'hidden' && !e.classList.contains('sr-only');
  }).map((e) => `${e.tagName}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)}`));
  check('Mobile: alvos de toque com pelo menos 36 px', small.length === 0, small.slice(0, 5).join(', '));
  await m.getByRole('button', { name: /^Abrir menu/ }).click();
  await m.screenshot({ path: join(out, 'mobile-menu.png') });
  await m.getByRole('button', { name: /^Fechar menu/ }).click();
  const mpep = m.locator('#itens li').nth(5);
  await mpep.scrollIntoViewIfNeeded();
  await mpep.getByRole('button', { name: /^Grande/ }).tap();
  await mpep.getByRole('button', { name: 'Adicionar ao carrinho' }).tap();
  await m.getByRole('button', { name: /^Abrir pedido/ }).last().tap();
  await m.getByRole('dialog', { name: 'Seu pedido' }).waitFor();
  await m.waitForTimeout(400);
  await m.screenshot({ path: join(out, 'mobile-carrinho.png') });
  check('Mobile: carrinho abre e lista o item', (await m.getByTestId('cart-line').count()) === 1);
  finishM();

  // Reduced motion: pepperonis sem parallax
  const calm = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const r = await calm.newPage();
  await r.goto(base, { waitUntil: 'networkidle' });
  await r.evaluate(() => window.scrollTo(0, 500));
  await r.waitForTimeout(300);
  const py = await r.evaluate(() => [...document.querySelectorAll('.parallax')].map((e) => getComputedStyle(e).translate));
  check('prefers-reduced-motion desliga o parallax', py.every((t) => t === 'none' || t === '0px' || t === '0px 0px' || t === ''), py.join('|'));
} catch (e) {
  check('QA concluído sem exceção', false, e instanceof Error ? e.stack : String(e));
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram.`);
process.exit(failed.length ? 1 : 0);
