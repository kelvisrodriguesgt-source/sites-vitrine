import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { addItem, buildLines, halfKey, lineName, MAX_QTY, parseKey, removeItem, sanitizeItems, setQty, singleKey, totals } from '../src/lib/cart';

const half = site.halfAndHalf;

describe('carrinho: chaves', () => {
  it('pizza com tamanho e tamanho diferente são itens distintos', () => {
    expect(singleKey('pepperoni', 'G')).toBe('pepperoni|G');
    let items = addItem({}, singleKey('pepperoni', 'G'));
    items = addItem(items, singleKey('pepperoni', 'M'));
    items = addItem(items, singleKey('pepperoni', 'G'));
    expect(items).toEqual({ 'pepperoni|G': 2, 'pepperoni|M': 1 });
  });

  it('meio a meio: A+B e B+A são o mesmo item', () => {
    expect(halfKey('quatro-queijos', 'calabresa', 'G')).toBe('calabresa+quatro-queijos|G');
    expect(halfKey('calabresa', 'quatro-queijos', 'G')).toBe(halfKey('quatro-queijos', 'calabresa', 'G'));
  });

  it('lê e rejeita chaves', () => {
    expect(parseKey('a')).toEqual({ ids: ['a'] });
    expect(parseKey('a|M')).toEqual({ ids: ['a'], size: 'M' });
    expect(parseKey('a+b|G')).toEqual({ ids: ['a', 'b'], size: 'G' });
    for (const bad of ['', 'a|X', 'a+b', 'a+a|G', 'a+b+c|G', 'a|M|G', '|M', 'a+|G']) expect(parseKey(bad), bad).toBeNull();
  });
});

describe('carrinho: quantidades', () => {
  it('adiciona, aumenta, diminui e remove', () => {
    let items = addItem({}, 'esfiha-carne');
    items = addItem(items, 'esfiha-carne');
    expect(items).toEqual({ 'esfiha-carne': 2 });
    expect(setQty(items, 'esfiha-carne', 1)).toEqual({ 'esfiha-carne': 1 });
    expect(setQty({ a: 1 }, 'a', 0)).toEqual({});
    expect(setQty({ a: 1 }, 'a', Number.NaN)).toEqual({});
    expect(removeItem({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 });
  });

  it('limita a quantidade máxima', () => {
    expect(addItem({ a: MAX_QTY }, 'a')).toEqual({ a: MAX_QTY });
    expect(setQty({}, 'a', 1000)).toEqual({ a: MAX_QTY });
  });
});

describe('carrinho: preços', () => {
  it('usa o preço do tamanho escolhido, em centavos', () => {
    const lines = buildLines({ 'pepperoni|G': 2, 'pepperoni|P': 1 }, site.products, half);
    expect(lines.map((l) => [l.name, l.unitCents, l.totalCents])).toEqual([
      ['Pepperoni (G)', 7690, 15380],
      ['Pepperoni (P)', 4290, 4290]
    ]);
  });

  it('meio a meio cobra o sabor mais caro (regra "highest")', () => {
    // Calabresa G = 67,90 / Quatro Queijos G = 74,90 -> 74,90
    const [line] = buildLines({ [halfKey('calabresa', 'quatro-queijos', 'G')]: 1 }, site.products, half);
    expect(line?.unitCents).toBe(7490);
    expect(line?.name).toBe('Pizza G meio a meio: Calabresa / Quatro Queijos');
  });

  it('meio a meio pela média quando configurado', () => {
    const [line] = buildLines({ [halfKey('calabresa', 'quatro-queijos', 'G')]: 1 }, site.products, { ...half, pricing: 'average' });
    expect(line?.unitCents).toBe(7140);
  });

  it('soma total sem erro de ponto flutuante', () => {
    // 2 x 76,90 + 1 x 7,50 (esfiha) + 1 x 74,90 (meio a meio)
    const lines = buildLines({ 'pepperoni|G': 2, 'esfiha-carne': 1, [halfKey('calabresa', 'quatro-queijos', 'G')]: 1 }, site.products, half);
    expect(totals(lines)).toEqual({ count: 4, subtotalCents: 23620, totalCents: 23620 });
  });

  it('nome do item', () => {
    expect(lineName({ name: 'Esfiha' })).toBe('Esfiha');
    expect(lineName({ name: 'Pepperoni' }, { id: 'M', label: 'Média', slices: 6, price: 1 })).toBe('Pepperoni (M)');
  });
});

describe('carrinho: dados inválidos', () => {
  it('ignora ids inexistentes, tamanhos que não existem e meio a meio inválido', () => {
    const keys = ['fantasma', 'pepperoni', 'esfiha-carne|G', 'pepperoni|X', 'esfiha-carne+pepperoni|G', 'calabresa+calabresa|G', 'chocolate-morango+pepperoni|G'];
    expect(buildLines(Object.fromEntries(keys.map((k) => [k, 1])), site.products, half)).toEqual([]);
  });

  it('meio a meio desligado invalida a linha', () => {
    const key = halfKey('calabresa', 'pepperoni', 'M');
    expect(buildLines({ [key]: 1 }, site.products, half)).toHaveLength(1);
    expect(buildLines({ [key]: 1 }, site.products, { ...half, enabled: false })).toEqual([]);
  });

  it('produto indisponível sai do carrinho', () => {
    const products = site.products.map((p) => (p.id === 'pepperoni' ? { ...p, available: false } : p));
    expect(buildLines({ 'pepperoni|G': 1, 'calabresa|G': 1 }, products, half).map((l) => l.product.id)).toEqual(['calabresa']);
  });

  it('sanitizeItems descarta lixo salvo no navegador', () => {
    expect(sanitizeItems({ fantasma: 2, 'pepperoni|G': 2.7, 'pepperoni|M': -1, 'esfiha-carne': 'a' }, site.products, half)).toEqual({ 'pepperoni|G': 2 });
    expect(sanitizeItems(null, site.products, half)).toEqual({});
    expect(sanitizeItems([], site.products, half)).toEqual({});
  });
});

describe('catálogo (config)', () => {
  it('tem ids únicos e categorias existentes', () => {
    const ids = site.products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categories = new Set(site.categories.map((c) => c.id));
    for (const p of site.products) expect(categories.has(p.category)).toBe(true);
  });

  it('pizzas têm P, M e G e o preço base é o menor tamanho', () => {
    const pizzas = site.products.filter((p) => p.category === 'pizzas');
    expect(pizzas.length).toBeGreaterThanOrEqual(6);
    for (const p of pizzas) {
      expect(p.sizes?.map((s) => s.id)).toEqual(['P', 'M', 'G']);
      expect(p.price).toBe(Math.min(...(p.sizes ?? []).map((s) => s.price)));
    }
  });

  it('todas as fotos citadas existem em public/img', async () => {
    const { existsSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const paths = [...site.products.map((p) => p.image), site.images.hero, ...site.images.pepperoni].filter((p): p is string => Boolean(p));
    for (const p of paths) expect(existsSync(resolve(__dirname, '../public', p.slice(1))), p).toBe(true);
  });
});
