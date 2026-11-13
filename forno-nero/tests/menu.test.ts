import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { commonSizes, fromCents, halfCents, hasSizes, isHalfEligible, matchesQuery, sizeOf, sortedSizes } from '../src/lib/menu';

const byId = (id: string) => site.products.find((p) => p.id === id)!;

describe('cardápio: preços e tamanhos', () => {
  it('"a partir de" usa o menor tamanho; preço único segue o preço', () => {
    expect(fromCents(byId('pepperoni'))).toBe(4290);
    expect(fromCents(byId('esfiha-carne'))).toBe(750);
    expect(hasSizes(byId('pepperoni'))).toBe(true);
    expect(hasSizes(byId('esfiha-carne'))).toBe(false);
  });

  it('ordena P, M, G e acha o tamanho', () => {
    const shuffled = { ...byId('pepperoni'), sizes: [...(byId('pepperoni').sizes ?? [])].reverse() };
    expect(sortedSizes(shuffled).map((s) => s.id)).toEqual(['P', 'M', 'G']);
    expect(sizeOf(byId('pepperoni'), 'M')?.price).toBe(59.9);
    expect(sizeOf(byId('pepperoni'), undefined)).toBeUndefined();
    expect(sizeOf(byId('esfiha-carne'), 'M')).toBeUndefined();
  });

  it('meio a meio: só pizzas salgadas elegíveis, e só tamanhos comuns', () => {
    expect(isHalfEligible(byId('pepperoni'), site.halfAndHalf)).toBe(true);
    expect(isHalfEligible(byId('chocolate-morango'), site.halfAndHalf)).toBe(false);
    expect(isHalfEligible(byId('esfiha-carne'), site.halfAndHalf)).toBe(false);
    expect(isHalfEligible(byId('pepperoni'), { ...site.halfAndHalf, enabled: false })).toBe(false);
    const noG = { ...byId('calabresa'), sizes: byId('calabresa').sizes?.filter((s) => s.id !== 'G') };
    expect(commonSizes(noG, byId('pepperoni'))).toEqual(['P', 'M']);
  });

  it('preço do meio a meio', () => {
    const a = { id: 'G' as const, label: 'Grande', slices: 8, price: 67.9 };
    const b = { id: 'G' as const, label: 'Grande', slices: 8, price: 74.9 };
    expect(halfCents(a, b, 'highest')).toBe(7490);
    expect(halfCents(a, b, 'average')).toBe(7140);
  });
});

describe('busca', () => {
  it('ignora acento e maiúsculas, procura no nome e nos ingredientes', () => {
    expect(matchesQuery(byId('quatro-queijos'), 'QUEIJOS')).toBe(true);
    expect(matchesQuery(byId('portuguesa'), 'azeitona')).toBe(true);
    expect(matchesQuery(byId('frango-catupiry'), 'cremoso')).toBe(true);
    expect(matchesQuery(byId('petit-gateau'), 'gateau')).toBe(true);
    expect(matchesQuery(byId('calabresa'), 'sorvete')).toBe(false);
  });

  it('todas as palavras precisam aparecer; vazio mostra tudo', () => {
    expect(matchesQuery(byId('calabresa'), 'calabresa cebola')).toBe(true);
    expect(matchesQuery(byId('calabresa'), 'calabresa chocolate')).toBe(false);
    expect(matchesQuery(byId('calabresa'), '   ')).toBe(true);
  });

  it('filtro por categoria + busca', () => {
    const found = site.products.filter((p) => p.category === 'pizzas' && matchesQuery(p, 'mozzarella'));
    expect(found.length).toBeGreaterThan(2);
    expect(found.every((p) => p.category === 'pizzas')).toBe(true);
  });
});
