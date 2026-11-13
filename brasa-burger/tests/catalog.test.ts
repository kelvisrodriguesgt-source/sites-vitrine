import { beforeEach, describe, expect, it } from 'vitest';
import type { Category, Product } from '../src/config/types';
import { formatPriceInput, hasCustomCatalog, loadCatalog, parsePrice, resetCatalog, saveCatalog, slugId, validateProduct } from '../src/shared/catalog';
import { KEYS, writeJSON } from '../src/shared/storage';
import { installBrowserShim } from './shared-helpers';

const categories: Category[] = [
  { id: 'hamburgueres', label: 'Hambúrgueres', icon: 'sandwich' },
  { id: 'bebidas', label: 'Bebidas', icon: 'cup' }
];
const defaults: Product[] = [{ id: 'a', name: 'Classic', description: 'x', price: 30, category: 'hamburgueres' }];

describe('parsePrice', () => {
  it.each([
    ['32,90', 32.9],
    ['R$ 32,90', 32.9],
    ['32.9', 32.9],
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['1.234', 1234],
    ['45', 45],
    ['0,5', 0.5]
  ])('lê %s', (input, expected) => expect(parsePrice(input)).toBe(expected));

  it('rejeita texto sem número', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
  });

  it('formata para o campo', () => expect(formatPriceInput(32.9)).toBe('32,90'));
});

describe('slugId', () => {
  it('remove acentos e evita repetição', () => {
    expect(slugId('X-Bacon Duplo!', [])).toBe('x-bacon-duplo');
    expect(slugId('Pão de Alho', ['pao-de-alho'])).toBe('pao-de-alho-2');
    expect(slugId('Pão de Alho', ['pao-de-alho', 'pao-de-alho-2'])).toBe('pao-de-alho-3');
    expect(slugId('***', [])).toBe('produto');
  });
});

describe('validateProduct', () => {
  it('exige nome, preço e categoria válidos', () => {
    expect(validateProduct({ name: '', price: 0, category: 'x', description: '' }, categories)).toEqual({
      name: 'Informe o nome do produto.',
      price: 'Informe um preço maior que zero.',
      category: 'Escolha uma categoria.'
    });
    expect(validateProduct({ name: 'Ok', price: 10, category: 'bebidas', description: '' }, categories)).toEqual({});
  });
});

describe('catálogo salvo pelo painel', () => {
  beforeEach(() => {
    installBrowserShim();
  });

  it('usa o padrão quando nada foi salvo e depois o salvo', () => {
    expect(loadCatalog(defaults, categories)).toBe(defaults);
    expect(hasCustomCatalog()).toBe(false);
    saveCatalog([{ id: 'n', name: 'Novo', description: '', price: 9.5, category: 'bebidas', available: false }]);
    expect(loadCatalog(defaults, categories).map((p) => p.id)).toEqual(['n']);
    expect(loadCatalog(defaults, categories)[0]?.available).toBe(false);
    resetCatalog();
    expect(loadCatalog(defaults, categories)).toBe(defaults);
  });

  it('descarta itens inválidos, duplicados e imagens suspeitas', () => {
    writeJSON(KEYS.catalog, [
      { id: 'a', name: 'A', price: 1, category: 'bebidas', image: 'javascript:alert(1)' },
      { id: 'a', name: 'Dup', price: 1, category: 'bebidas' },
      { id: 'b', name: 'B', price: -3, category: 'bebidas' },
      { id: 'c', name: 'C', price: 5, category: 'inexistente', image: '/img/../etc/passwd' },
      { id: 'd', name: 'D', price: 5, category: 'bebidas', image: 'data:image/webp;base64,AAAA' },
      42
    ]);
    const out = loadCatalog(defaults, categories);
    expect(out.map((p) => p.id)).toEqual(['a', 'c', 'd']);
    expect(out[0]?.image).toBeUndefined();
    expect(out[1]?.category).toBe('hamburgueres');
    expect(out[1]?.image).toBeUndefined();
    expect(out[2]?.image).toBe('data:image/webp;base64,AAAA');
  });
});
