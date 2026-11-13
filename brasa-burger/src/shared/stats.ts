import { type Order, isActive } from './orders';

export type Period = 'hoje' | '7d' | '30d';

export const PERIODS: { id: Period; label: string; days: number }[] = [
  { id: 'hoje', label: 'Hoje', days: 1 },
  { id: '7d', label: '7 dias', days: 7 },
  { id: '30d', label: '30 dias', days: 30 }
];

const pad = (n: number): string => String(n).padStart(2, '0');

/** Chave do dia no horário local ("2026-11-13"). */
export function dayKey(ts: number | Date): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Dias do período (do mais antigo ao mais recente) e do período imediatamente anterior, de mesmo tamanho. */
export function periodDays(period: Period, now: number): { days: string[]; previous: string[] } {
  const n = PERIODS.find((p) => p.id === period)?.days ?? 1;
  const base = new Date(now);
  const at = (offset: number): string =>
    dayKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset, 12));
  const days: string[] = [];
  const previous: string[] = [];
  for (let i = n - 1; i >= 0; i--) days.push(at(i));
  for (let i = 2 * n - 1; i >= n; i--) previous.push(at(i));
  return { days, previous };
}

const inDays = (orders: Order[], days: string[]): Order[] => {
  const set = new Set(days);
  return orders.filter((o) => set.has(dayKey(o.createdAt)));
};

export interface Kpis {
  revenueCents: number;
  orders: number;
  avgTicketCents: number;
  canceled: number;
}

/** Faturamento e pedidos desconsideram cancelados. */
export function kpis(orders: Order[], days: string[]): Kpis {
  const scoped = inDays(orders, days);
  const valid = scoped.filter((o) => o.status !== 'cancelado');
  const revenueCents = valid.reduce((s, o) => s + o.totalCents, 0);
  return {
    revenueCents,
    orders: valid.length,
    avgTicketCents: valid.length ? Math.round(revenueCents / valid.length) : 0,
    canceled: scoped.length - valid.length
  };
}

/** Pedidos em andamento agora, independente do período escolhido. */
export const activeCount = (orders: Order[]): number => orders.filter((o) => isActive(o.status)).length;

/** Variação percentual. null = sem base de comparação (período anterior zerado). */
export function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export interface DayPoint {
  day: string;
  revenueCents: number;
  count: number;
}

export function dailySeries(orders: Order[], days: string[]): DayPoint[] {
  const map = new Map<string, DayPoint>(days.map((d) => [d, { day: d, revenueCents: 0, count: 0 }]));
  for (const o of orders) {
    if (o.status === 'cancelado') continue;
    const point = map.get(dayKey(o.createdAt));
    if (point) {
      point.revenueCents += o.totalCents;
      point.count += 1;
    }
  }
  return days.map((d) => map.get(d) as DayPoint);
}

export interface TopProduct {
  id: string;
  name: string;
  qty: number;
  revenueCents: number;
}

export function topProducts(orders: Order[], days: string[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of inDays(orders, days)) {
    if (o.status === 'cancelado') continue;
    for (const i of o.items) {
      const cur = map.get(i.id) ?? { id: i.id, name: i.name, qty: 0, revenueCents: 0 };
      cur.qty += i.qty;
      cur.revenueCents += i.qty * i.unitCents;
      map.set(i.id, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenueCents - a.revenueCents).slice(0, limit);
}

export interface Slice {
  label: string;
  count: number;
  revenueCents: number;
}

export function breakdown(orders: Order[], days: string[], by: 'type' | 'payment'): Slice[] {
  const map = new Map<string, Slice>();
  for (const o of inDays(orders, days)) {
    if (o.status === 'cancelado') continue;
    const label = by === 'type' ? (o.type === 'entrega' ? 'Entrega' : 'Retirada') : o.payment || 'Não informado';
    const cur = map.get(label) ?? { label, count: 0, revenueCents: 0 };
    cur.count += 1;
    cur.revenueCents += o.totalCents;
    map.set(label, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export interface HourPoint {
  hour: number;
  revenueCents: number;
  count: number;
}

/** Vendas por hora de um dia (0 a 23). */
export function hourlySeries(orders: Order[], day: string): HourPoint[] {
  const points: HourPoint[] = Array.from({ length: 24 }, (_, hour) => ({ hour, revenueCents: 0, count: 0 }));
  for (const o of orders) {
    if (o.status === 'cancelado' || dayKey(o.createdAt) !== day) continue;
    const point = points[new Date(o.createdAt).getHours()];
    if (point) {
      point.revenueCents += o.totalCents;
      point.count += 1;
    }
  }
  return points;
}
