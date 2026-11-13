import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import type { SiteConfig } from '../src/config/types';
import { buildHead, buildJsonLd, buildLlms, buildRobots, buildSitemap } from '../src/lib/seo';

const head = buildHead(site);
const jsonLd = (config: SiteConfig = site) => JSON.parse(buildJsonLd(config));

describe('SEO gerado a partir da configuração', () => {
  it('título e descrição', () => {
    expect(head).toContain('<title>Celeste Odontologia | Clínica odontológica em Cidade Exemplo - MT</title>');
    expect(site.seo.description.length).toBeLessThanOrEqual(155);
    expect(site.seo.description.length).toBeGreaterThan(80);
  });

  it('protótipo é noindex e a versão final é index', () => {
    expect(site.seo.indexable).toBe(false);
    expect(head).toContain('<meta name="robots" content="noindex, nofollow" />');
    const final = buildHead({ ...site, seo: { ...site.seo, indexable: true } });
    expect(final).toContain('content="index, follow"');
  });

  it('canonical, Open Graph e Twitter Card', () => {
    expect(head).toContain(`<link rel="canonical" href="${site.seo.url}/" />`);
    for (const tag of ['og:type', 'og:locale', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height']) {
      expect(head).toContain(`property="${tag}"`);
    }
    expect(head).toContain(`content="${site.seo.url}/og-image.jpg"`);
    expect(head).toContain('content="summary_large_image"');
    expect(head).toContain('rel="apple-touch-icon"');
  });

  it('JSON-LD é Dentist, sem aggregateRating e sem fechar a tag script', () => {
    const data = jsonLd();
    expect(data['@type']).toBe('Dentist');
    expect(data.name).toBe('Celeste Odontologia');
    expect(data.aggregateRating).toBeUndefined();
    expect(buildJsonLd({ ...site, brand: { ...site.brand, name: '</script><b>' } })).not.toContain('</script>');
  });

  it('JSON-LD usa os horários da configuração', () => {
    const spec = jsonLd().openingHoursSpecification;
    expect(spec).toHaveLength(2);
    expect(spec[0].dayOfWeek).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    expect(spec[1].dayOfWeek).toEqual(['Saturday']);
  });

  it('robots, sitemap e llms.txt', () => {
    expect(buildRobots(site)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${site.seo.url}/sitemap.xml\n`);
    const sitemap = buildSitemap(site, '2026-11-13');
    expect(sitemap).toContain(`<loc>${site.seo.url}/</loc>`);
    expect(sitemap).toContain('<lastmod>2026-11-13</lastmod>');
    const llms = buildLlms(site);
    expect(llms).toContain('# Celeste Odontologia');
    expect(llms).toContain('Estética dental');
    expect(llms).toContain('Aviso: ');
  });

  it('não promete resultado nem usa termos proibidos no texto do site', () => {
    const all = JSON.stringify([site.texts, site.treatments, site.technology, site.differentials, site.faq, site.team]).toLowerCase();
    for (const word of ['garantimos', 'garantia de', 'antes e depois', 'sem dor', 'melhor clínica', 'r$']) {
      expect(all).not.toContain(word);
    }
  });
});
