import { expect, test } from '@playwright/test';

const BASE = 'http://127.0.0.1:4311';

test.describe('movimento: carregamento, skeleton, entrada e progresso', () => {
  test('skeleton do cartão de conversa aparece enquanto a fonte carrega e some quando está pronta', async ({
    page
  }) => {
    await page.route('**/fonts/inter-latin-400*', async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.continue();
    });
    await page.goto(BASE, { waitUntil: 'commit' });
    const chat = page.locator('.chat');
    await expect(chat).toBeAttached();
    await expect(chat).not.toHaveClass(/is-ready/);
    // no celular o cartão fica abaixo da dobra e só hidrata ao chegar na tela
    await chat.scrollIntoViewIfNeeded();
    await expect(chat).toHaveClass(/is-ready/, { timeout: 5000 });
  });

  test('progresso de carregamento chega a 100% e dá lugar à barra de rolagem', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.load-bar')).toHaveClass(/is-done/);
    await expect(page.locator('.scroll-bar')).toHaveClass(/is-active/);
    expect(await page.locator('.load-bar').evaluate((el) => el.style.getPropertyValue('--p'))).toBe('1');
  });

  test('barra de rolagem acompanha a posição da página', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'));
    const scale = () => page.locator('.scroll-bar i').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    const start = await scale();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(scale).toBeGreaterThan(start + 0.8);
  });

  test('cartões de serviço ficam em skeleton até chegar na tela e então viram conteúdo', async ({ page }) => {
    await page.goto(BASE);
    const cards = page.locator('.card[data-skel]');
    await expect(cards).toHaveCount(5);
    expect(await page.locator('.card.is-ready').count()).toBe(0);
    await page.locator('#servicos').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 300));
    await expect(page.locator('.card.is-ready').first()).toBeVisible();
    await page.locator('#perguntas').scrollIntoViewIfNeeded();
    await expect(page.locator('details.is-ready').first()).toBeVisible();
  });

  test('sem salto de layout: CLS abaixo de 0,1 durante carregamento e rolagem', async ({ page }) => {
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(BASE);
    for (const y of [400, 900, 1600, 2400, 3200]) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(250);
    }
    expect(await page.evaluate(() => window.__cls)).toBeLessThan(0.1);
  });

  test('FAQ abre com o mouse e com o teclado', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#perguntas').scrollIntoViewIfNeeded();
    const first = page.locator('details').first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('p')).toBeVisible();
    const second = page.locator('details').nth(1);
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
  });

  test('clique no WhatsApp mostra estado de carregamento e volta ao normal', async ({ page, context }) => {
    await context.route('https://wa.me/**', (r) => r.abort());
    await page.goto(BASE);
    const btn = page.locator('.hero a[data-cta="hero"]');
    await btn.click();
    await expect(btn).toHaveClass(/is-loading/);
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#status')).toHaveText('Abrindo o WhatsApp…');
    await expect(btn).not.toHaveClass(/is-loading/, { timeout: 3000 });
    await expect(page.locator('#status')).toHaveText('');
  });

  test('aviso de cookies entra animado e sai animado (?motion-demo)', async ({ page }) => {
    await page.goto(`${BASE}/?motion-demo`);
    const banner = page.locator('.consent');
    await expect(banner).toBeVisible();
    const names = await banner.evaluate((el) => el.getAnimations().map((a) => a.animationName));
    expect(names).toContain('consent-in');
    await banner.locator('.btn-deny').click();
    await expect(banner).toHaveClass(/is-leaving/);
    await expect(banner).toHaveCount(0, { timeout: 2000 });
    expect(await page.evaluate(() => localStorage.getItem('kr_consent_v1'))).toBeNull();
  });

  test('barra fixa do celular some quando o CTA final aparece', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'barra fixa só existe no celular');
    await page.goto(BASE);
    const sticky = page.locator('.sticky');
    await expect(sticky).not.toHaveClass(/is-hidden/);
    await page.locator('#contato').scrollIntoViewIfNeeded();
    await expect(sticky).toHaveClass(/is-hidden/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(sticky).not.toHaveClass(/is-hidden/);
  });

  test('navegação para a política de privacidade carrega e volta', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('footer a.legal').click();
    await expect(page).toHaveURL(/\/privacidade$/);
    await expect(page.locator('h1')).toHaveText('Política de Privacidade');
    await expect(page.locator('header .btn')).toBeVisible(); // o botão de voltar também aparece no celular
    await page.locator('header .btn').click();
    await expect(page).toHaveURL(`${BASE}/`);
  });
});

test.describe('movimento: quem pede menos animação', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tudo vem pronto: sem skeleton, sem animações rodando, barra de rolagem funcionando', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ok'));
    expect(await page.locator('[data-skel]:not(.is-ready)').count()).toBe(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(page.locator('.card').first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect
      .poll(() => page.locator('.scroll-bar i').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
      .toBeGreaterThan(0.8);
  });

  test('aviso de cookies sai na hora', async ({ page }) => {
    await page.goto(`${BASE}/?motion-demo`);
    await page.locator('.consent .btn-deny').click();
    await expect(page.locator('.consent')).toHaveCount(0, { timeout: 500 });
  });
});

test.describe('movimento: planos B', () => {
  test('sem JavaScript, todo o conteúdo aparece', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(BASE);
    await expect(page.locator('html')).not.toHaveClass(/js/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.card').first()).toBeVisible();
    await expect(page.locator('.card h3').first()).toBeVisible();
    await expect(page.locator('details summary').first()).toBeVisible();
    await context.close();
  });

  test('se o script de movimento falhar, em 4s o conteúdo é liberado sem skeleton', async ({ page }) => {
    await page.route('**/js/main.js', (r) => r.abort());
    await page.goto(BASE);
    await expect(page.locator('html')).toHaveClass(/motion-timeout/, { timeout: 6000 });
    await page.locator('#servicos').scrollIntoViewIfNeeded();
    await expect(page.locator('.card h3').first()).toBeVisible();
    expect(
      await page
        .locator('.card h3')
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    ).toBe('1');
  });
});
