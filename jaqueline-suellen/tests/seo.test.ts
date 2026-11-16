import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { buildHead, buildJsonLd, buildLlms, buildRobots, buildSitemap } from '../src/lib/seo';

describe('SEO', () => {
  const head = buildHead(site);
  it('title com serviço, cidade e nome', () => expect(head).toContain('<title>Esteticista em Vilhena - RO | Jaqueline Suellen Estética</title>'));
  it('descrição com até 155 caracteres', () => expect(site.seo.description.length).toBeLessThanOrEqual(155));
  it('noindex enquanto protótipo', () => expect(head).toContain('content="noindex, nofollow"'));
  it('vira index quando indexable = true', () => expect(buildHead({ ...site, seo: { ...site.seo, indexable: true } })).toContain('content="index, follow"'));
  it('canonical, Open Graph e Twitter', () => {
    expect(head).toContain(`<link rel="canonical" href="${site.seo.url}/" />`);
    expect(head).toContain('property="og:image" content="https://jaqueline-suellen.vercel.app/og-image.jpg"');
    expect(head).toContain('twitter:card" content="summary_large_image"');
    expect(head).toContain('og:locale" content="pt_BR"');
  });
  it('JSON-LD BeautySalon com dados reais e sem aggregateRating', () => {
    const ld = JSON.parse(buildJsonLd(site));
    expect(ld['@type']).toBe('BeautySalon');
    expect(ld.telephone).toBe('+5569933004605');
    expect(ld.address.addressLocality).toBe('Vilhena');
    expect(ld.makesOffer).toHaveLength(6);
    expect(ld.sameAs).toEqual([site.contact.instagramUrl]);
    expect(JSON.stringify(ld)).not.toContain('aggregateRating');
    expect(ld.openingHours).toBeUndefined();
  });
  it('JSON-LD nunca fecha a tag script', () => expect(buildJsonLd({ ...site, brand: { ...site.brand, name: '</script><b>' } })).not.toContain('</script>'));
  it('escapa aspas e sinais no head', () => expect(buildHead({ ...site, seo: { ...site.seo, title: 'A "B" <c>' } })).toContain('A &quot;B&quot; &lt;c&gt;'));
  it('robots, sitemap e llms', () => {
    expect(buildRobots(site)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${site.seo.url}/sitemap.xml\n`);
    expect(buildSitemap(site, '2026-11-16')).toContain('<lastmod>2026-11-16</lastmod>');
    const llms = buildLlms(site);
    expect(llms).toContain('# Jaqueline Suellen Estética');
    expect(llms).toContain('(69) 93300-4605');
    expect(llms).toContain('- Limpeza de pele:');
    expect(llms).toContain('Horários de atendimento a confirmar');
  });
});
