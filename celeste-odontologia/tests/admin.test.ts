import { describe, expect, it } from 'vitest';
import { moveItem } from '../src/admin/parts';
import { TEXT_SECTIONS, getPath, setPath } from '../src/admin/textFields';
import { defaultContent, site } from '../src/config/site';
import {
  FILES,
  cleanInstagram,
  coerce,
  formatPhone,
  isValidWhatsapp,
  parseMapEmbed,
  safeImage,
  sanitizeContent,
  slugId,
  toWhatsappNumber
} from '../src/shared/content';

const MAP = 'https://www.google.com/maps/embed?pb=!1m18!1m12';

describe('coerce (mantém o formato do conteúdo padrão)', () => {
  it('usa o padrão quando o valor falta ou tem tipo errado', () => {
    expect(coerce({ a: 'x', b: 1 }, undefined)).toEqual({ a: 'x', b: 1 });
    expect(coerce({ a: 'x' }, { a: 5 })).toEqual({ a: 'x' });
  });
  it('descarta chaves desconhecidas e aceita valores válidos', () => {
    expect(coerce({ a: 'x' }, { a: 'novo', lixo: 'y' })).toEqual({ a: 'novo' });
  });
  it('lista de objetos: filtra itens inválidos e completa campos', () => {
    expect(coerce([{ n: '', ok: true }], [{ n: 'a' }, 'texto', null])).toEqual([
      { n: 'a', ok: true }
    ]);
  });
  it('lista de textos: só strings', () => {
    expect(coerce(['x'], ['a', 2, 'b'])).toEqual(['a', 'b']);
  });
});

describe('safeImage', () => {
  it('aceita imagens do site e data URL de imagem', () => {
    expect(safeImage('/img/hero.webp', '/img/f.webp')).toBe('/img/hero.webp');
    expect(safeImage('data:image/webp;base64,AAAA', '/f')).toBe('data:image/webp;base64,AAAA');
  });
  it('rejeita URLs externas, SVG, javascript e caminhos com ..', () => {
    for (const bad of ['https://x.com/a.jpg', 'data:image/svg+xml;base64,AAAA', 'javascript:alert(1)', '/img/../x.js', '//x.com/a.png']) {
      expect(safeImage(bad, '/f')).toBe('/f');
    }
  });
  it('rejeita data URL grande demais', () => {
    expect(safeImage(`data:image/webp;base64,${'A'.repeat(700_001)}`, '/f')).toBe('/f');
  });
});

describe('parseMapEmbed', () => {
  it('aceita o endereço direto e o iframe inteiro', () => {
    expect(parseMapEmbed(MAP)).toBe(MAP);
    expect(parseMapEmbed(`<iframe src="${MAP}" width="600"></iframe>`)).toBe(MAP);
  });
  it('vazio é permitido (sem mapa)', () => {
    expect(parseMapEmbed('  ')).toBe('');
  });
  it('recusa endereços de outros sites', () => {
    expect(parseMapEmbed('https://evil.com/maps/embed')).toBeNull();
    expect(parseMapEmbed('<iframe src="https://evil.com"></iframe>')).toBeNull();
  });
});

describe('telefone e Instagram', () => {
  it('toWhatsappNumber', () => {
    expect(toWhatsappNumber('(65) 99903-4981')).toBe('5565999034981');
    expect(toWhatsappNumber('5565999034981')).toBe('5565999034981');
    expect(toWhatsappNumber('')).toBe('');
  });
  it('formatPhone', () => {
    expect(formatPhone('5565999034981')).toBe('(65) 99903-4981');
    expect(formatPhone('6530001234')).toBe('(65) 3000-1234');
    expect(formatPhone('abc')).toBe('abc');
  });
  it('isValidWhatsapp', () => {
    expect(isValidWhatsapp('5565999034981')).toBe(true);
    expect(isValidWhatsapp('65999034981')).toBe(false);
  });
  it('cleanInstagram', () => {
    expect(cleanInstagram('@minha.clinica')).toBe('minha.clinica');
    expect(cleanInstagram('https://www.instagram.com/minhaclinica/')).toBe('minhaclinica');
    expect(cleanInstagram('com espaço')).toBe('');
  });
});

describe('slugId', () => {
  it('remove acentos e garante unicidade', () => {
    expect(slugId('Estética dental', [])).toBe('estetica-dental');
    expect(slugId('Estética dental', ['estetica-dental'])).toBe('estetica-dental-2');
    expect(slugId('!!!', [])).toBe('item');
  });
});

describe('sanitizeContent', () => {
  it('conteúdo vazio ou lixo volta ao padrão', () => {
    expect(sanitizeContent(defaultContent, null)).toEqual(sanitizeContent(defaultContent, {}));
    expect(sanitizeContent(defaultContent, 'x').info.brand.name).toBe(defaultContent.info.brand.name);
    expect(Object.keys(sanitizeContent(defaultContent, {}))).toEqual(expect.arrayContaining([...FILES]));
  });
  it('troca imagem insegura pela original e mantém a segura', () => {
    const info = structuredClone(defaultContent.info);
    info.images.hero = 'https://evil.com/a.jpg';
    info.images.reception = 'data:image/png;base64,AAAA';
    const out = sanitizeContent(defaultContent, { info });
    expect(out.info.images.hero).toBe(defaultContent.info.images.hero);
    expect(out.info.images.reception).toBe('data:image/png;base64,AAAA');
  });
  it('WhatsApp só com dígitos; Instagram e "Como chegar" só https; mapa validado', () => {
    const info = structuredClone(defaultContent.info);
    info.contact.whatsapp = '+55 (65) 98888-7777';
    info.contact.instagramUrl = 'javascript:alert(1)';
    info.address.directionsUrl = 'http://inseguro.com';
    info.address.mapEmbedSrc = 'https://evil.com';
    const out = sanitizeContent(defaultContent, { info });
    expect(out.info.contact.whatsapp).toBe('5565988887777');
    expect(out.info.contact.instagramUrl).toBe(defaultContent.info.contact.instagramUrl);
    expect(out.info.address.directionsUrl).toBe('');
    expect(out.info.address.mapEmbedSrc).toBe('');
  });
  it('tratamentos: sempre 3 itens, id preenchido, foto vazia permitida', () => {
    const treatments = structuredClone(defaultContent.treatments);
    treatments.treatments = [{ ...treatments.treatments[0]!, id: '', items: ['a'], image: '' }];
    const out = sanitizeContent(defaultContent, { treatments });
    expect(out.treatments.treatments[0]?.items).toEqual(['a', '', '']);
    expect(out.treatments.treatments[0]?.id).toBe('tratamento-1');
    expect(out.treatments.treatments[0]?.image).toBe('');
  });
  it('o site padrão continua com aviso de demonstração e sem avaliações', () => {
    expect(site.brand.demo).toBe(true);
  });
});

describe('painel: utilidades', () => {
  it('moveItem sobe, desce e respeita os limites', () => {
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
  });
  it('getPath / setPath não alteram o original', () => {
    const obj = { hero: { title: 'A' } };
    expect(getPath(obj, ['hero', 'title'])).toBe('A');
    expect(getPath(obj, ['x', 'y'])).toBe('');
    const next = setPath(obj, ['hero', 'title'], 'B');
    expect(next.hero.title).toBe('B');
    expect(obj.hero.title).toBe('A');
  });
  it('todo campo do painel de textos existe no conteúdo padrão', () => {
    const ids = new Set<string>();
    for (const s of TEXT_SECTIONS) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      for (const f of s.fields) {
        expect(getPath(defaultContent.texts, f.path), `${s.id}: ${f.path.join('.')}`).not.toBe('');
      }
    }
  });
});
