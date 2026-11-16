import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { fullAddress, mapsDirectionsUrl, ratingLabel } from '../src/lib/format';
import { imageUrl } from '../src/lib/images';

describe('configuração do site (briefing)', () => {
  it('WhatsApp do briefing, no formato 55 + DDD + número', () => {
    expect(site.contact.whatsapp).toBe('5569933004605');
    expect(site.contact.whatsapp).toMatch(/^55\d{10,11}$/);
  });
  it('Instagram do briefing', () => expect(site.contact.instagramUrl).toBe('https://www.instagram.com/jaquelinesuellen.estetica/'));
  it('endereço preservado como informado e marcado como a confirmar', () => {
    expect(fullAddress(site.address)).toBe('Rua Deofo Antônio geremias, Jardim América, Vilhena - RO, CEP 76980-740');
    expect(site.address.confirmed).toBe(false);
    expect(mapsDirectionsUrl(site.address)).toContain('google.com/maps/search');
  });
  it('seis tratamentos, na ordem e com os textos do briefing', () => {
    expect(site.treatments.map((t) => t.name)).toEqual(['Limpeza de pele', 'Depilação a laser', 'Massoterapia', 'Drenagem', 'Dermaplaning', 'Auriculoterapia']);
    expect(site.treatments[0]?.description).toBe('Um momento dedicado ao cuidado da pele, com atenção às necessidades individuais.');
    expect(new Set(site.treatments.map((t) => t.id)).size).toBe(6);
  });
  it('paleta do briefing', () => {
    expect(site.colors).toEqual({ nude: '#E9DED3', offwhite: '#F8F5F0', champagne: '#B59B85', taupe: '#766052', cocoa: '#292421', white: '#FFFFFF' });
  });
  it('só a avaliação real: Solange Machado, 5 estrelas, 1 avaliação', () => {
    expect(site.reviews).toHaveLength(1);
    expect(site.reviews[0]).toMatchObject({ author: 'Solange Machado', rating: 5, text: 'Excelente profissional, bom atendimento e com pontualidade, super indico.' });
    expect(site.googleRating).toEqual({ score: 5, count: 1 });
    expect(ratingLabel(5, 1)).toBe('5,0 estrelas · 1 avaliação no Google');
    expect(ratingLabel(4.8, 12)).toBe('4,8 estrelas · 12 avaliações no Google');
  });
  it('nenhum horário inventado', () => expect(site.hours).toEqual([]));
  it('toda foto tem alt, arquivo e dimensões', () => {
    const slots = [site.images.hero, site.images.clinic, site.images.profile, ...site.treatments.map((t) => t.image), ...site.gallery.map((g) => g.image), ...site.instagramTiles];
    for (const s of slots) {
      expect(s.alt.length).toBeGreaterThan(10);
      expect(s.file).toMatch(/^[a-z0-9-]+$/);
      expect(s.width).toBeGreaterThan(0);
      expect(s.height).toBeGreaterThan(0);
    }
    expect(slots).toHaveLength(3 + 6 + 6 + 6);
  });
  it('as 11 fotos pedidas no briefing existem como espaços', () => {
    const files = new Set([site.images.hero, site.images.clinic, site.images.profile, ...site.treatments.map((t) => t.image), ...site.gallery.map((g) => g.image)].map((s) => s.file));
    for (const f of ['hero-estetica', 'limpeza-de-pele', 'depilacao-laser', 'massoterapia', 'drenagem', 'dermaplaning', 'ambiente-clinica', 'jaqueline-perfil', 'galeria-pele', 'galeria-procedimento', 'galeria-bem-estar']) expect(files.has(f)).toBe(true);
  });
  it('foto da profissional não promete pessoa fictícia: alt cita só a profissional real', () => {
    expect(site.images.profile.alt).toBe('Jaqueline Suellen, esteticista e massoterapeuta');
  });
  it('imageUrl devolve undefined quando o arquivo não existe', () => expect(imageUrl('arquivo-que-nao-existe')).toBeUndefined());
});
