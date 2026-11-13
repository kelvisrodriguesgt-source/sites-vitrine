import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { buildHead, buildJsonLd, buildLlms, buildRobots, buildSitemap } from '../src/lib/seo';

describe('SEO a partir da configuração', () => {
  it('protótipo sai com noindex e canonical', () => {
    const head = buildHead(site);
    expect(head).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(head).toContain(`<link rel="canonical" href="${site.seo.url}/" />`);
    expect(head).toContain('og:image" content="https://forno-nero-self.vercel.app/og-image.jpg"');
    expect(head).toContain('twitter:card" content="summary_large_image"');
  });

  it('versão final vira index, follow', () => {
    expect(buildHead({ ...site, seo: { ...site.seo, indexable: true } })).toContain('content="index, follow"');
  });

  it('JSON-LD é válido, tipo Restaurant e sem avaliação própria', () => {
    const data = JSON.parse(buildJsonLd(site));
    expect(data['@type']).toBe('Restaurant');
    expect(data.address.addressLocality).toBe(site.address.city);
    expect(data.aggregateRating).toBeUndefined();
    expect(data.openingHoursSpecification[0].opens).toBe('18:00');
    expect(data.servesCuisine).toContain('Pizza');
    expect(data.hasMenu).toBe(`${site.seo.url}/#cardapio`);
  });

  it('robots, sitemap e llms usam a URL da configuração', () => {
    expect(buildRobots(site)).toContain(`Sitemap: ${site.seo.url}/sitemap.xml`);
    expect(buildSitemap(site, '2026-11-12')).toContain('<lastmod>2026-11-12</lastmod>');
    const llms = buildLlms(site);
    expect(llms).toContain('# FORNO NERO');
    expect(llms).toContain('Pepperoni (a partir de R$ 42,90)');
    expect(llms).toContain('Aviso:');
  });

  it('escapa aspas e sinais de menor no head', () => {
    const head = buildHead({ ...site, seo: { ...site.seo, title: 'A "b" <c>' } });
    expect(head).toContain('A &quot;b&quot; &lt;c&gt;');
  });

  it('título e descrição seguem o pacote de SEO', () => {
    expect(site.seo.title).toBe('Forno Nero Pizzaria | Pizzaria delivery em Cidade Exemplo - MT');
    expect(site.seo.description.length).toBeLessThanOrEqual(155);
    expect(site.seo.indexable).toBe(false);
    expect(site.seo.url).toMatch(/^https:\/\/[^/]+$/);
  });

  it('JSON-LD não escapa da tag script', () => {
    const ld = buildJsonLd({ ...site, brand: { ...site.brand, name: '</script><b>' } });
    expect(ld).not.toContain('</script>');
  });
});
