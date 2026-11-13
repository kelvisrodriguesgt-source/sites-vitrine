import type { SizeOption } from '../config/types';
import { halfKey, lineName, singleKey } from '../lib/cart';
import { halfCents } from '../lib/menu';
import { toCents } from '../lib/money';
import { type Order, type OrderItem, type OrderStatus, itemsTotal } from './orders';
import { dayKey } from './stats';

export interface SeedProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  available?: boolean;
  sizes?: SizeOption[];
}

/** Gerador pseudoaleatório determinístico: mesma semente, mesmos pedidos. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// Tudo fictício.
const FIRST = ['Ana', 'Bruno', 'Camila', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Rafael', 'Sofia', 'Thiago', 'Vanessa', 'Wesley'];
const LAST = ['Almeida', 'Barros', 'Costa', 'Dias', 'Ferraz', 'Gomes', 'Lima', 'Moraes', 'Nunes', 'Oliveira', 'Pires', 'Rocha', 'Santos', 'Teixeira'];
const STREETS = ['Rua das Acácias', 'Av. Central', 'Rua do Comércio', 'Rua das Palmeiras', 'Av. Brasil', 'Rua Sete de Setembro', 'Rua dos Ipês'];
const DISTRICTS = ['Centro', 'Jardim América', 'Vila Nova', 'Bairro Alto', 'Setor Sul'];
const NOTES = ['Sem cebola', 'Borda bem assada', 'Capricha no queijo', 'Tocar o interfone', 'Cortar em 12 pedaços', 'Sem azeitona'];

const WEIGHTS: Record<string, number> = { pizzas: 8, doces: 1, combos: 2 };
const SIZE_WEIGHTS: Record<string, number> = { P: 2, M: 4, G: 4 };

function pick<T>(rnd: () => number, list: readonly T[]): T {
  return list[Math.floor(rnd() * list.length)] as T;
}

function weighted<T>(rnd: () => number, items: T[], weight: (p: T) => number): T | null {
  const total = items.reduce((s, p) => s + weight(p), 0);
  if (total <= 0) return null;
  let r = rnd() * total;
  for (const p of items) {
    r -= weight(p);
    if (r <= 0) return p;
  }
  return items[items.length - 1] ?? null;
}

function makeItems(rnd: () => number, products: SeedProduct[]): OrderItem[] {
  const map = new Map<string, OrderItem>();
  const put = (key: string, name: string, unitCents: number, qty: number) => {
    const cur = map.get(key);
    if (cur) cur.qty += qty;
    else map.set(key, { id: key, name, qty, unitCents });
  };
  const add = (p: SeedProduct | null, qty: number) => {
    if (!p) return;
    const sizes = p.sizes ?? [];
    if (sizes.length) {
      const size = weighted(rnd, sizes, (s) => SIZE_WEIGHTS[s.id] ?? 1) as SizeOption;
      put(singleKey(p.id, size.id), lineName(p, size), toCents(size.price), qty);
    } else put(p.id, p.name, toCents(p.price), qty);
  };
  const ofCat = (...cats: string[]) => products.filter((p) => cats.includes(p.category));
  const pizzas = ofCat('pizzas');
  // Cerca de 1 em cada 6 pedidos tem uma pizza meio a meio.
  if (pizzas.length >= 2 && rnd() < 0.17) {
    const a = pick(rnd, pizzas);
    const b = pick(rnd, pizzas.filter((p) => p.id !== a.id));
    const common = (a.sizes ?? []).filter((s) => b.sizes?.some((o) => o.id === s.id));
    const size = weighted(rnd, common, (s) => SIZE_WEIGHTS[s.id] ?? 1);
    const other = b.sizes?.find((s) => s.id === size?.id);
    if (size && other) {
      const first = [a, b].sort((x, y) => x.id.localeCompare(y.id));
      put(halfKey(a.id, b.id, size.id), lineName(first[0] as SeedProduct, size, first[1] as SeedProduct), halfCents(size, other, 'highest'), 1);
    }
  } else {
    add(weighted(rnd, ofCat('pizzas', 'doces', 'combos'), (p) => WEIGHTS[p.category] ?? 1), rnd() < 0.2 ? 2 : 1);
  }
  if (rnd() < 0.25) add(pick(rnd, pizzas) ?? null, 1);
  if (rnd() < 0.3) add(weighted(rnd, ofCat('esfihas', 'calzones'), () => 1), rnd() < 0.4 ? 3 : 1);
  if (rnd() < 0.35) add(weighted(rnd, ofCat('porcoes'), () => 1), 1);
  if (rnd() < 0.7) add(weighted(rnd, ofCat('bebidas'), () => 1), rnd() < 0.3 ? 2 : 1);
  if (rnd() < 0.2) add(weighted(rnd, ofCat('sobremesas'), () => 1), 1);
  return [...map.values()];
}

function makeTime(rnd: () => number, dayStart: Date): number {
  // Pedidos do jantar (18h15 às 23h15), com pico perto das 20h.
  const hours = 18.25 + (rnd() + rnd()) * 2.5;
  return new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(hours), Math.floor((hours % 1) * 60), Math.floor(rnd() * 60)).getTime();
}

const MIN = 60_000;

function makeOrder(rnd: () => number, products: SeedProduct[], payments: string[], at: number, status: OrderStatus): Omit<Order, 'number'> {
  const items = makeItems(rnd, products);
  const type = rnd() < 0.62 ? 'entrega' : 'retirada';
  const history: Order['history'] = [{ status: 'novo', at }];
  const steps: OrderStatus[] = ['preparo', 'pronto', 'concluido'];
  if (status === 'cancelado') {
    history.push({ status: 'cancelado', at: at + (4 + Math.floor(rnd() * 6)) * MIN });
  } else {
    const stop = steps.indexOf(status) + 1; // novo = 0 etapas
    let t = at;
    for (let i = 0; i < stop; i++) {
      t += (3 + Math.floor(rnd() * 12)) * MIN;
      history.push({ status: steps[i] as OrderStatus, at: t });
    }
  }
  return {
    id: `d${at.toString(36)}${Math.floor(rnd() * 1e6).toString(36)}`,
    createdAt: at,
    customer: `${pick(rnd, FIRST)} ${pick(rnd, LAST)}`,
    type,
    address: type === 'entrega' ? `${pick(rnd, STREETS)}, ${10 + Math.floor(rnd() * 990)} - ${pick(rnd, DISTRICTS)}` : '',
    payment: pick(rnd, payments),
    notes: rnd() < 0.18 ? pick(rnd, NOTES) : '',
    items,
    totalCents: itemsTotal(items),
    status,
    history,
    source: 'demo'
  };
}

/** Pedidos por dia da semana (0 = domingo). Mais movimento de sexta a domingo. */
const PER_DAY: Record<number, [number, number]> = { 0: [16, 24], 1: [6, 10], 2: [7, 12], 3: [8, 13], 4: [10, 16], 5: [20, 30], 6: [22, 32] };

/** Mesmos pontos de partida de hoje: o painel sempre abre com pedidos para mexer. */
const TODAY_MINUTES_AGO = [4, 11, 18, 32, 48, 75, 110];
const TODAY_STATUS: OrderStatus[] = ['novo', 'novo', 'preparo', 'pronto', 'concluido', 'concluido', 'concluido'];

/**
 * Gera 30 dias de pedidos de exemplo mais alguns pedidos de hoje em andamento.
 * Determinístico por dia: recarregar a página não muda os números.
 */
export function generateDemoOrders(now: number, products: SeedProduct[], payments: string[]): Order[] {
  const sellable = products.filter((p) => p.available !== false);
  if (sellable.length === 0 || payments.length === 0) return [];
  const today = new Date(now);
  const rnd = mulberry32(hash(dayKey(now)));
  const drafts: Omit<Order, 'number'>[] = [];

  for (let back = 29; back >= 1; back--) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back, 12);
    const [min, max] = PER_DAY[day.getDay()] ?? [0, 0];
    if (max === 0) continue;
    const count = min + Math.floor(rnd() * (max - min + 1));
    for (let i = 0; i < count; i++) {
      const status: OrderStatus = rnd() < 0.05 ? 'cancelado' : 'concluido';
      drafts.push(makeOrder(rnd, sellable, payments, makeTime(rnd, day), status));
    }
  }
  TODAY_MINUTES_AGO.forEach((m, i) => {
    drafts.push(makeOrder(rnd, sellable, payments, now - m * MIN, TODAY_STATUS[i] as OrderStatus));
  });

  return drafts
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((d, i) => ({ ...d, number: i + 1 }));
}
