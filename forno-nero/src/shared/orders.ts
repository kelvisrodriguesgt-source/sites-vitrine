import type { CartLine } from '../lib/cart';
import { formatBRL } from '../lib/money';
import type { OrderType } from '../lib/whatsapp';

export type OrderStatus = 'novo' | 'preparo' | 'pronto' | 'concluido' | 'cancelado';

export const STATUSES: readonly OrderStatus[] = ['novo', 'preparo', 'pronto', 'concluido', 'cancelado'];
export const ACTIVE_STATUSES: readonly OrderStatus[] = ['novo', 'preparo', 'pronto'];

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitCents: number;
}

export interface Order {
  id: string;
  /** Número exibido ao cliente e ao atendente (#1001). */
  number: number;
  createdAt: number;
  customer: string;
  type: OrderType;
  address: string;
  payment: string;
  notes: string;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  history: { status: OrderStatus; at: number }[];
  /** "site" = pedido feito no site; "demo" = dado de exemplo do painel. */
  source: 'site' | 'demo';
}

const FLOW: Record<OrderStatus, OrderStatus | null> = {
  novo: 'preparo',
  preparo: 'pronto',
  pronto: 'concluido',
  concluido: null,
  cancelado: null
};

export const nextStatus = (s: OrderStatus): OrderStatus | null => FLOW[s];
export const isActive = (s: OrderStatus): boolean => ACTIVE_STATUSES.includes(s);

export function statusLabel(status: OrderStatus, type: OrderType): string {
  switch (status) {
    case 'novo':
      return 'Novo';
    case 'preparo':
      return 'Em preparo';
    case 'pronto':
      return type === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada';
    case 'concluido':
      return 'Concluído';
    case 'cancelado':
      return 'Cancelado';
  }
}

/** Texto do botão que leva o pedido à próxima etapa. */
export function advanceLabel(status: OrderStatus, type: OrderType): string | null {
  switch (status) {
    case 'novo':
      return 'Aceitar e preparar';
    case 'preparo':
      return type === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada';
    case 'pronto':
      return 'Concluir pedido';
    default:
      return null;
  }
}

export const itemsTotal = (items: OrderItem[]): number => items.reduce((s, i) => s + i.unitCents * i.qty, 0);

export interface BuildOrderInput {
  number: number;
  customer: string;
  type: OrderType;
  address: string;
  payment: string;
  notes: string;
  lines: CartLine[];
  source: Order['source'];
  now: number;
}

export function buildOrder(input: BuildOrderInput): Order {
  const items: OrderItem[] = input.lines.map((l) => ({
    id: l.key,
    name: l.name,
    qty: l.qty,
    unitCents: l.unitCents
  }));
  return {
    id: `o${input.now.toString(36)}${input.number}`,
    number: input.number,
    createdAt: input.now,
    customer: input.customer.trim(),
    type: input.type,
    address: input.type === 'entrega' ? input.address.trim() : '',
    payment: input.payment,
    notes: input.notes.trim(),
    items,
    totalCents: itemsTotal(items),
    status: 'novo',
    history: [{ status: 'novo', at: input.now }],
    source: input.source
  };
}

/** Move o pedido para outro status registrando o histórico. Status repetido não altera nada. */
export function applyStatus(order: Order, status: OrderStatus, now: number): Order {
  if (order.status === status) return order;
  return { ...order, status, history: [...order.history, { status, at: now }] };
}

/** Resumo em texto simples para copiar e colar (ex.: impressão ou grupo da cozinha). */
export function orderSummary(order: Order): string {
  const out: string[] = [];
  out.push(`Pedido #${order.number} - ${statusLabel(order.status, order.type)}`);
  out.push(`Cliente: ${order.customer}`);
  out.push(`Tipo: ${order.type === 'entrega' ? 'Entrega' : 'Retirada'}`);
  if (order.address) out.push(`Endereço: ${order.address}`);
  out.push(`Pagamento: ${order.payment}`);
  out.push('');
  for (const i of order.items) out.push(`${i.qty}x ${i.name} - ${formatBRL(i.unitCents * i.qty)}`);
  out.push('');
  out.push(`Total: ${formatBRL(order.totalCents)}`);
  if (order.notes) out.push(`Obs.: ${order.notes}`);
  return out.join('\n');
}

const isStatus = (v: unknown): v is OrderStatus => typeof v === 'string' && (STATUSES as readonly string[]).includes(v);

/** Lê pedidos salvos descartando registros inválidos (dados antigos ou editados à mão). */
export function sanitizeOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return [];
  const out: Order[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    if (
      typeof o.id !== 'string' ||
      typeof o.number !== 'number' ||
      typeof o.createdAt !== 'number' ||
      !Number.isFinite(o.createdAt) ||
      !isStatus(o.status) ||
      (o.type !== 'entrega' && o.type !== 'retirada') ||
      !Array.isArray(o.items)
    )
      continue;
    const items: OrderItem[] = [];
    for (const it of o.items as Record<string, unknown>[]) {
      if (
        it &&
        typeof it.id === 'string' &&
        typeof it.name === 'string' &&
        typeof it.qty === 'number' &&
        typeof it.unitCents === 'number'
      )
        items.push({ id: it.id, name: it.name, qty: it.qty, unitCents: it.unitCents });
    }
    if (items.length === 0) continue;
    const history = Array.isArray(o.history)
      ? (o.history as Record<string, unknown>[])
          .filter((h) => h && isStatus(h.status) && typeof h.at === 'number')
          .map((h) => ({ status: h.status as OrderStatus, at: h.at as number }))
      : [];
    out.push({
      id: o.id,
      number: o.number,
      createdAt: o.createdAt,
      customer: typeof o.customer === 'string' ? o.customer : 'Cliente',
      type: o.type,
      address: typeof o.address === 'string' ? o.address : '',
      payment: typeof o.payment === 'string' ? o.payment : '',
      notes: typeof o.notes === 'string' ? o.notes : '',
      items,
      totalCents: itemsTotal(items),
      status: o.status,
      history: history.length ? history : [{ status: o.status, at: o.createdAt }],
      source: o.source === 'demo' ? 'demo' : 'site'
    });
  }
  return out;
}
