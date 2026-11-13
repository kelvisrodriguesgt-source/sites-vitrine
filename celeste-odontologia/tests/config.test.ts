import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { parseRich, plain } from '../src/lib/rich';
import { fileExists } from './helpers';

describe('dados da configuração', () => {
  it('cores da paleta', () => {
    expect(site.colors).toEqual({
      navy: '#0E2338',
      ocean: '#1F3D5C',
      mist: '#DCE6EE',
      frost: '#F4F7FA',
      champagne: '#EFE2CF',
      pearl: '#FFFFFF'
    });
  });

  it('é site demonstrativo, com aviso de dados fictícios', () => {
    expect(site.brand.demo).toBe(true);
    expect(site.brand.demoNote).toContain('fictícios');
  });

  it('tratamentos: ids únicos, 3 itens cada, com foto e descrição', () => {
    expect(site.treatments.length).toBeGreaterThanOrEqual(4);
    expect(new Set(site.treatments.map((t) => t.id)).size).toBe(site.treatments.length);
    for (const t of site.treatments) {
      expect(t.items).toHaveLength(3);
      expect(t.imageAlt.length).toBeGreaterThan(5);
      expect(fileExists(t.image)).toBe(true);
    }
  });

  it('todas as imagens configuradas existem', () => {
    const { images } = site;
    for (const key of ['hero', 'heroMobile', 'reception', 'clinicRoom', 'technology', 'ctaFinal'] as const) {
      expect(fileExists(images[key]), key).toBe(true);
    }
    for (const file of ['/og-image.jpg', '/favicon.svg', '/favicon.png', '/apple-touch-icon.png']) {
      expect(fileExists(file), file).toBe(true);
    }
  });

  it('registro profissional fica vazio até ser confirmado', () => {
    for (const m of site.team) expect(m.cro).toBe('');
    expect(site.team.length).toBeGreaterThanOrEqual(2);
    expect(site.team.length).toBeLessThanOrEqual(3);
  });

  it('números em destaque: nenhum percentual ou contagem de pacientes', () => {
    expect(site.highlights).toHaveLength(3);
    for (const h of site.highlights) {
      expect(h.value + h.label).not.toMatch(/%|pacientes|clientes/i);
    }
  });

  it('FAQ com 5 perguntas e respostas', () => {
    expect(site.faq).toHaveLength(5);
    for (const f of site.faq) {
      expect(f.q.endsWith('?')).toBe(true);
      expect(f.a.length).toBeGreaterThan(20);
    }
  });

  it('há tecnologia (3 itens) e passos (3)', () => {
    expect(site.technology).toHaveLength(3);
    expect(site.steps).toHaveLength(3);
    expect(site.differentials).toHaveLength(3);
  });

  it('o endereço de produção não termina com barra', () => {
    expect(site.seo.url.endsWith('/')).toBe(false);
  });
});

describe('texto com itálico', () => {
  it('separa trechos em itálico', () => {
    expect(parseRich('Mais que *um sorriso.*')).toEqual([
      { text: 'Mais que ', italic: false },
      { text: 'um sorriso.', italic: true }
    ]);
  });
  it('texto sem marcação fica inteiro', () => {
    expect(parseRich('Olá')).toEqual([{ text: 'Olá', italic: false }]);
    expect(parseRich('')).toEqual([]);
  });
  it('plain remove os asteriscos', () => {
    expect(plain('Seu novo sorriso *começa agora.*')).toBe('Seu novo sorriso começa agora.');
  });
  it('títulos do site têm no máximo um trecho em itálico', () => {
    const titles = [site.texts.hero.title, site.texts.treatments.title, site.texts.finalCta.title];
    for (const t of titles) expect(parseRich(t).filter((p) => p.italic).length).toBe(1);
  });
});
