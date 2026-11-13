import type { CartLine } from '../lib/cart';
import type { CheckoutData } from '../lib/whatsapp';
import { type Order, type OrderStatus, applyStatus, buildOrder, sanitizeOrders } from './orders';
import { type SeedProduct, generateDemoOrders } from './seed';
import { dayKey } from './stats';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';

/** Pedidos reais começam em #1001, longe da numeração dos exemplos (#1, #2...). */
export const FIRST_REAL_NUMBER = 1001;

/** Mais recentes primeiro. */
export const loadOrders = (): Order[] =>
  sanitizeOrders(readJSON<unknown>(KEYS.orders, [])).sort((a, b) => b.createdAt - a.createdAt);

export const saveOrders = (orders: Order[]): boolean => writeJSON(KEYS.orders, orders);

function nextNumber(): number {
  const last = readJSON<number>(KEYS.seq, FIRST_REAL_NUMBER - 1);
  const next = (Number.isFinite(last) ? last : FIRST_REAL_NUMBER - 1) + 1;
  writeJSON(KEYS.seq, next);
  return next;
}

/** Chamado pelo site ao finalizar o pedido. Nunca lança erro: se não gravar, o WhatsApp segue normalmente. */
export function createOrder(checkout: CheckoutData, lines: CartLine[], now = Date.now()): Order | null {
  try {
    const order = buildOrder({
      number: nextNumber(),
      customer: checkout.name,
      type: checkout.type,
      address: checkout.address,
      payment: checkout.payment,
      notes: checkout.notes,
      lines,
      source: 'site',
      now
    });
    return saveOrders([order, ...loadOrders()]) ? order : null;
  } catch {
    return null;
  }
}

export function setOrderStatus(id: string, status: OrderStatus, now = Date.now()): Order[] {
  const next = loadOrders().map((o) => (o.id === id ? applyStatus(o, status, now) : o));
  saveOrders(next);
  return next;
}

export function removeDemoOrders(): Order[] {
  const next = loadOrders().filter((o) => o.source !== 'demo');
  saveOrders(next);
  return next;
}

export function clearAllOrders(): void {
  removeKey(KEYS.orders);
  removeKey(KEYS.seq);
}

export const isDemoOn = (): boolean => readJSON<boolean>(KEYS.demo, true) !== false;
export const setDemoOn = (on: boolean): boolean => writeJSON(KEYS.demo, on);

/**
 * Mantém os pedidos de exemplo em dia (só no painel, nunca no site).
 * Com o modo demonstração ligado, regenera os exemplos uma vez por dia; pedidos reais são preservados.
 */
export function syncDemoOrders(now: number, products: SeedProduct[], payments: string[], force = false): void {
  const today = dayKey(now);
  const orders = loadOrders();
  const stale = readJSON<string>(KEYS.seedDay, '') !== today;
  if (!isDemoOn()) {
    if (orders.some((o) => o.source === 'demo')) saveOrders(orders.filter((o) => o.source !== 'demo'));
    return;
  }
  if (!force && !stale && orders.some((o) => o.source === 'demo')) return;
  const real = orders.filter((o) => o.source !== 'demo');
  saveOrders([...generateDemoOrders(now, products, payments), ...real].sort((a, b) => b.createdAt - a.createdAt));
  writeJSON(KEYS.seedDay, today);
}
