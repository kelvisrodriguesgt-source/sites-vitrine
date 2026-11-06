import { expect, test } from '@playwright/test';

const SITES = [
  { name: 'grupo-kr (produção)', base: 'http://127.0.0.1:4312' },
  { name: 'grupo-kr-motion (teste de movimento)', base: 'http://127.0.0.1:4311' }
];

for (const { name, base } of SITES) {
  test.describe(name, () => {
    test('SEO básico: título, descrição, canonical, noindex e dados estruturados', async ({ page }) => {
      await page.goto(`${base}/`);
      await expect(page).toHaveTitle(/Grupo KR/);
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toMatch(/Google Meu Neg/);
      expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe('noindex, nofollow');
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/^https:\/\//);
      expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toMatch(/og-image\.jpg$/);

      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocks).toHaveLength(2);
      const types = blocks.map((b) => JSON.parse(b)['@type']);
      expect(types).toEqual(['ProfessionalService', 'FAQPage']);
      const org = JSON.parse(blocks[0]);
      expect(org.telephone).toBe('+5565999034981');
      expect(org.hasOfferCatalog.itemListElement).toHaveLength(5);
    });

    test('cabeçalhos de segurança', async ({ request }) => {
      const res = await request.get(`${base}/`);
      const h = res.headers();
      expect(h['x-robots-tag']).toBe('noindex, nofollow');
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['x-frame-options']).toBe('DENY');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['strict-transport-security']).toMatch(/max-age=63072000/);
      expect(h['permissions-policy']).toMatch(/camera=\(\)/);
      expect(h['content-security-policy']).toMatch(/default-src 'self'/);
      expect(h['content-security-policy']).toMatch(/object-src 'none'/);
      expect(h['content-security-policy']).toMatch(/frame-ancestors 'none'/);
      expect(h['content-security-policy']).not.toMatch(/unsafe-inline|unsafe-eval/);
    });

    test('pacote de arquivos: robots, sitemap, llms.txt e security.txt', async ({ request }) => {
      for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/.well-known/security.txt']) {
        const res = await request.get(`${base}${path}`);
        expect(res.status(), path).toBe(200);
      }
      expect(await (await request.get(`${base}/robots.txt`)).text()).toMatch(/Sitemap:/);
    });

    test('HTML sem script ou estilo inline (a política de segurança fica estrita)', async ({ request }) => {
      for (const path of ['/', '/privacidade']) {
        const html = await (await request.get(`${base}${path}`)).text();
        expect(html, `${path} style inline`).not.toMatch(/\sstyle=/i);
        expect(html, `${path} onclick`).not.toMatch(/\son[a-z]+=/i);
        const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/gi)].map((m) => m[1]);
        for (const attrs of inlineScripts) expect(attrs).toMatch(/application\/ld\+json/);
      }
    });

    test('sem erros de console nem violações da política de segurança', async ({ page }) => {
      const problems = [];
      page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(m.text()));
      page.on('pageerror', (e) => problems.push(String(e)));
      for (const path of ['/', '/privacidade']) {
        await page.goto(`${base}${path}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(400);
      }
      expect(problems).toEqual([]);
    });

    test('todos os botões de WhatsApp levam ao número certo e abrem com segurança', async ({ page }) => {
      await page.goto(`${base}/`);
      const links = await page
        .locator('a[data-cta]')
        .evaluateAll((as) => as.map((a) => ({ href: a.href, rel: a.rel, target: a.target, cta: a.dataset.cta })));
      expect(links.length).toBeGreaterThanOrEqual(8);
      for (const l of links) {
        expect(l.href, l.cta).toMatch(/^https:\/\/wa\.me\/5565999034981\?text=/);
        expect(l.target).toBe('_blank');
        expect(l.rel).toMatch(/noopener/);
      }
      const ctas = links.map((l) => l.cta);
      expect(new Set(ctas).size).toBe(ctas.length);
    });

    test('política de privacidade identifica o responsável (CNPJ e e-mail) e cobre os direitos da LGPD', async ({
      page
    }) => {
      await page.goto(`${base}/privacidade`);
      const text = await page.locator('main').textContent();
      expect(text).toContain('51.839.003/0001-54');
      expect(text).toContain('kelvisrodriguesgt@gmail.com');
      expect(text).toMatch(/art\. 18/);
      expect(await page.locator('main h2').count()).toBe(10);
      expect(text).not.toMatch(/PENDENTE/);
    });
  });
}
