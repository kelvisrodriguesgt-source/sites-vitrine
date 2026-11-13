import type { HalfAndHalfConfig, Product, SizeId, SizeOption } from '../config/types';
import { toCents } from './money';

export const SIZE_ORDER: readonly SizeId[] = ['P', 'M', 'G'];

export const hasSizes = (p: Product): p is Product & { sizes: SizeOption[] } => Array.isArray(p.sizes) && p.sizes.length > 0;

/** Menor preço do produto, em centavos ("a partir de"). */
export function fromCents(p: Product): number {
  return hasSizes(p) ? Math.min(...p.sizes.map((s) => toCents(s.price))) : toCents(p.price);
}

export function sizeOf(p: Product, id: SizeId | undefined): SizeOption | undefined {
  return id && hasSizes(p) ? p.sizes.find((s) => s.id === id) : undefined;
}

/** Tamanhos na ordem P, M, G. */
export function sortedSizes(p: Product): SizeOption[] {
  return hasSizes(p) ? [...p.sizes].sort((a, b) => SIZE_ORDER.indexOf(a.id) - SIZE_ORDER.indexOf(b.id)) : [];
}

/** Pizzas que podem ser combinadas no meio a meio. */
export function isHalfEligible(p: Product, half: HalfAndHalfConfig): boolean {
  return half.enabled && hasSizes(p) && half.categories.includes(p.category) && p.available !== false;
}

/** Preço da pizza meio a meio, em centavos, segundo a regra configurada. */
export function halfCents(a: SizeOption, b: SizeOption, pricing: HalfAndHalfConfig['pricing']): number {
  const ca = toCents(a.price);
  const cb = toCents(b.price);
  return pricing === 'average' ? Math.round((ca + cb) / 2) : Math.max(ca, cb);
}

/** Tamanhos que as duas pizzas têm em comum. */
export function commonSizes(a: Product, b: Product): SizeId[] {
  return sortedSizes(a)
    .map((s) => s.id)
    .filter((id) => sizeOf(b, id));
}

const strip = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca sem acento, por nome ou ingrediente (descrição). */
export function matchesQuery(p: Product, query: string): boolean {
  const q = strip(query.trim());
  if (!q) return true;
  return q.split(/\s+/).every((word) => strip(p.name).includes(word) || strip(p.description).includes(word));
}
