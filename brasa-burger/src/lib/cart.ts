import type { Product } from '../config/types';
import { toCents } from './money';

/** Carrinho: id do produto -> quantidade. */
export type CartItems = Record<string, number>;

export interface CartLine {
  product: Product;
  qty: number;
  unitCents: number;
  totalCents: number;
}

export interface CartTotals {
  count: number;
  subtotalCents: number;
  totalCents: number;
}

export const MAX_QTY = 99;

export function addItem(items: CartItems, id: string, qty = 1): CartItems {
  const next = Math.min(MAX_QTY, (items[id] ?? 0) + qty);
  return next > 0 ? { ...items, [id]: next } : removeItem(items, id);
}

export function setQty(items: CartItems, id: string, qty: number): CartItems {
  if (!Number.isFinite(qty) || qty <= 0) return removeItem(items, id);
  return { ...items, [id]: Math.min(MAX_QTY, Math.floor(qty)) };
}

export function removeItem(items: CartItems, id: string): CartItems {
  const { [id]: _removed, ...rest } = items;
  return rest;
}

/** Monta as linhas a partir do catálogo atual; ids desconhecidos (ex.: produto removido) são ignorados. */
export function buildLines(items: CartItems, products: Product[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const product of products) {
    const qty = items[product.id];
    if (!qty || qty < 1) continue;
    const unitCents = toCents(product.price);
    lines.push({ product, qty, unitCents, totalCents: unitCents * qty });
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
export function sanitizeItems(raw: unknown, products: Product[]): CartItems {
  if (!raw || typeof raw !== 'object') return {};
  const known = new Set(products.map((p) => p.id));
  const out: CartItems = {};
  for (const [id, qty] of Object.entries(raw as Record<string, unknown>)) {
    if (known.has(id) && typeof qty === 'number' && qty >= 1) out[id] = Math.min(MAX_QTY, Math.floor(qty));
  }
  return out;
}
