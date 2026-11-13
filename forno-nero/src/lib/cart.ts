import type { HalfAndHalfConfig, Product, SizeId, SizeOption } from '../config/types';
import { halfCents, hasSizes, isHalfEligible, sizeOf } from './menu';
import { toCents } from './money';

/**
 * Carrinho: chave -> quantidade. A chave identifica a combinação exata:
 *  - item simples:        "esfiha-carne"
 *  - pizza com tamanho:   "pepperoni|G"           (G e M do mesmo sabor são itens distintos)
 *  - pizza meio a meio:   "calabresa+quatro-queijos|G"   (ids em ordem alfabética: A+B = B+A)
 */
export type CartItems = Record<string, number>;

export interface CartLine {
  key: string;
  product: Product;
  /** Segundo sabor, só no meio a meio. */
  other?: Product;
  size?: SizeOption;
  qty: number;
  unitCents: number;
  totalCents: number;
  /** Nome completo do item, usado no pedido e no WhatsApp. */
  name: string;
}

export interface CartTotals {
  count: number;
  subtotalCents: number;
  totalCents: number;
}

export const MAX_QTY = 99;

export const singleKey = (id: string, size?: SizeId): string => (size ? `${id}|${size}` : id);

export function halfKey(a: string, b: string, size: SizeId): string {
  const [x, y] = [a, b].sort();
  return `${x}+${y}|${size}`;
}

export interface ParsedKey {
  ids: string[];
  size?: SizeId;
}

export function parseKey(key: string): ParsedKey | null {
  const [idPart, sizePart, ...extra] = key.split('|');
  if (!idPart || extra.length) return null;
  const ids = idPart.split('+');
  if (ids.length > 2 || ids.some((i) => !i)) return null;
  if (sizePart !== undefined && sizePart !== 'P' && sizePart !== 'M' && sizePart !== 'G') return null;
  if (ids.length === 2 && (!sizePart || ids[0] === ids[1])) return null;
  return sizePart ? { ids, size: sizePart } : { ids };
}

/** Nome do item no pedido: "Pepperoni (G)" ou "Pizza G meio a meio: Calabresa / Quatro Queijos". */
export function lineName(product: { name: string }, size?: SizeOption, other?: { name: string }): string {
  if (other && size) return `Pizza ${size.id} meio a meio: ${product.name} / ${other.name}`;
  return size ? `${product.name} (${size.id})` : product.name;
}

/** Resolve uma chave contra o catálogo atual. null = chave inválida, produto removido ou indisponível. */
export function resolveKey(key: string, products: Product[], half: HalfAndHalfConfig): Omit<CartLine, 'qty' | 'totalCents'> | null {
  const parsed = parseKey(key);
  if (!parsed) return null;
  const find = (id: string) => products.find((p) => p.id === id && p.available !== false);
  const first = find(parsed.ids[0] as string);
  if (!first) return null;

  if (parsed.ids.length === 2) {
    const second = find(parsed.ids[1] as string);
    if (!second || !parsed.size || !isHalfEligible(first, half) || !isHalfEligible(second, half)) return null;
    const a = sizeOf(first, parsed.size);
    const b = sizeOf(second, parsed.size);
    if (!a || !b) return null;
    return { key, product: first, other: second, size: a, unitCents: halfCents(a, b, half.pricing), name: lineName(first, a, second) };
  }

  if (hasSizes(first)) {
    const size = sizeOf(first, parsed.size);
    if (!size) return null;
    return { key, product: first, size, unitCents: toCents(size.price), name: lineName(first, size) };
  }
  if (parsed.size) return null;
  return { key, product: first, unitCents: toCents(first.price), name: lineName(first) };
}

export function addItem(items: CartItems, key: string, qty = 1): CartItems {
  const next = Math.min(MAX_QTY, (items[key] ?? 0) + qty);
  return next > 0 ? { ...items, [key]: next } : removeItem(items, key);
}

export function setQty(items: CartItems, key: string, qty: number): CartItems {
  if (!Number.isFinite(qty) || qty <= 0) return removeItem(items, key);
  return { ...items, [key]: Math.min(MAX_QTY, Math.floor(qty)) };
}

export function removeItem(items: CartItems, key: string): CartItems {
  const { [key]: _removed, ...rest } = items;
  return rest;
}

/** Monta as linhas (na ordem em que foram adicionadas); chaves que não existem mais no catálogo são ignoradas. */
export function buildLines(items: CartItems, products: Product[], half: HalfAndHalfConfig): CartLine[] {
  const lines: CartLine[] = [];
  for (const [key, qty] of Object.entries(items)) {
    if (!Number.isFinite(qty) || qty < 1) continue;
    const base = resolveKey(key, products, half);
    if (base) lines.push({ ...base, qty, totalCents: base.unitCents * qty });
  }
  return lines;
}

export function totals(lines: CartLine[]): CartTotals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.totalCents, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  // Sem taxa de entrega calculada no site: ela é informada pelo atendimento.
  return { count, subtotalCents, totalCents: subtotalCents };
}

/** Lê um carrinho salvo, descartando dados inválidos. */
export function sanitizeItems(raw: unknown, products: Product[], half: HalfAndHalfConfig): CartItems {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: CartItems = {};
  for (const [key, qty] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof qty === 'number' && qty >= 1 && resolveKey(key, products, half)) out[key] = Math.min(MAX_QTY, Math.floor(qty));
  }
  return out;
}
