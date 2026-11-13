import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { addItem, buildLines, MAX_QTY, removeItem, sanitizeItems, setQty, totals } from '../src/lib/cart';

describe('carrinho', () => {
  it('adiciona, aumenta e diminui quantidades', () => {
    let items = addItem({}, 'brasa-classic');
    items = addItem(items, 'brasa-classic');
    expect(items).toEqual({ 'brasa-classic': 2 });
    items = setQty(items, 'brasa-classic', 1);
    expect(items['brasa-classic']).toBe(1);
  });

  it('remove o item quando a quantidade chega a zero', () => {
    expect(setQty({ a: 1 }, 'a', 0)).toEqual({});
    expect(setQty({ a: 1 }, 'a', Number.NaN)).toEqual({});
    expect(removeItem({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 });
  });

  it('limita a quantidade máxima', () => {
    expect(addItem({ a: MAX_QTY }, 'a')).toEqual({ a: MAX_QTY });
    expect(setQty({}, 'a', 1000)).toEqual({ a: MAX_QTY });
  });

  it('calcula subtotal e total em centavos sem erro de ponto flutuante', () => {
    // 32,90 x 3 + 39,90 x 1 = 138,60
    const lines = buildLines({ 'brasa-classic': 3, 'double-brasa': 1 }, site.products);
    expect(lines.map((l) => l.totalCents)).toEqual([9870, 3990]);
    expect(totals(lines)).toEqual({ count: 4, subtotalCents: 13860, totalCents: 13860 });
  });

  it('ignora ids que não existem no catálogo', () => {
    expect(buildLines({ fantasma: 2 }, site.products)).toEqual([]);
    expect(sanitizeItems({ fantasma: 2, 'brasa-classic': 2, 'double-brasa': -1, x: 'a' }, site.products)).toEqual({
      'brasa-classic': 2
    });
    expect(sanitizeItems(null, site.products)).toEqual({});
  });
});

describe('catálogo (config)', () => {
  it('tem ids únicos e categorias existentes', () => {
    const ids = site.products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categories = new Set(site.categories.map((c) => c.id));
    for (const p of site.products) expect(categories.has(p.category)).toBe(true);
  });

  it('tem 3 destaques e 3 combos', () => {
    expect(site.products.filter((p) => p.featured)).toHaveLength(3);
    expect(site.products.filter((p) => p.category === 'combos')).toHaveLength(3);
  });

  it('todas as fotos citadas existem em public/img', async () => {
    const { existsSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const paths = [
      ...site.products.map((p) => p.image),
      ...site.gallery.map((g) => g.src),
      ...Object.values(site.images).filter((v) => v.startsWith('/img/'))
    ].filter((p): p is string => Boolean(p));
    for (const p of paths) expect(existsSync(resolve(__dirname, '../public', p.slice(1))), p).toBe(true);
  });
});
