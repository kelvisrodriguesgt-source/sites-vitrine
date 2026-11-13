import { beforeEach, describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { loadOrders, setDemoOn, syncDemoOrders, createOrder } from '../src/shared/ordersStore';
import { buildLines } from '../src/lib/cart';
import { generateDemoOrders } from '../src/shared/seed';
import { dayKey, kpis, periodDays } from '../src/shared/stats';
import { installBrowserShim } from './shared-helpers';

const NOW = new Date(2026, 10, 13, 15, 0).getTime();

describe('dados de exemplo', () => {
  it('são determinísticos no mesmo dia', () => {
    const a = generateDemoOrders(NOW, site.products, site.payments);
    const b = generateDemoOrders(NOW, site.products, site.payments);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(150);
  });

  it('abrem todos os dias, com numeração sequencial', () => {
    const orders = generateDemoOrders(NOW, site.products, site.payments);
    const days = new Set(orders.map((o) => dayKey(o.createdAt)));
    expect(days.size).toBe(30);
    expect(orders.map((o) => o.number)).toEqual(orders.map((_, i) => i + 1));
    expect(orders.every((o) => o.totalCents > 0 && o.items.length > 0 && o.source === 'demo')).toBe(true);
  });

  it('incluem pizzas por tamanho e meio a meio, com preço coerente', () => {
    const items = generateDemoOrders(NOW, site.products, site.payments).flatMap((o) => o.items);
    expect(items.some((i) => /^Pizza [PMG] meio a meio: /.test(i.name))).toBe(true);
    expect(items.some((i) => / \([PMG]\)$/.test(i.name))).toBe(true);
    for (const i of items) expect(i.unitCents).toBeGreaterThan(0);
  });

  it('deixam pedidos de hoje em andamento para o painel abrir com ação', () => {
    const orders = generateDemoOrders(NOW, site.products, site.payments).filter((o) => dayKey(o.createdAt) === dayKey(NOW));
    expect(orders.filter((o) => o.status === 'novo')).toHaveLength(2);
    expect(orders.some((o) => o.status === 'preparo')).toBe(true);
    expect(orders.some((o) => o.status === 'pronto')).toBe(true);
    expect(kpis(orders, periodDays('hoje', NOW).days).revenueCents).toBeGreaterThan(0);
  });

  it('não vendem produto indisponível', () => {
    const blocked = site.products.map((p) => ({ ...p, available: p.category === 'bebidas' ? false : true }));
    const orders = generateDemoOrders(NOW, blocked, site.payments);
    const ids = new Set(orders.flatMap((o) => o.items.map((i) => i.id)));
    expect([...ids].some((id) => site.products.find((p) => p.id === id)?.category === 'bebidas')).toBe(false);
  });
});

describe('sincronização do modo demonstração', () => {
  beforeEach(() => {
    installBrowserShim();
  });

  it('gera uma vez por dia e preserva pedidos reais', () => {
    syncDemoOrders(NOW, site.products, site.payments);
    const first = loadOrders();
    expect(first.length).toBeGreaterThan(150);
    const real = createOrder({ name: 'Cliente', type: 'retirada', address: '', payment: 'Pix', changeFor: '', notes: '' }, buildLines({ 'esfiha-carne': 1 }, site.products, site.halfAndHalf), NOW);
    syncDemoOrders(NOW, site.products, site.payments);
    expect(loadOrders()).toHaveLength(first.length + 1);
    syncDemoOrders(NOW + 86_400_000, site.products, site.payments);
    expect(loadOrders().some((o) => o.id === real?.id)).toBe(true);
  });

  it('desligar o modo remove só os exemplos', () => {
    syncDemoOrders(NOW, site.products, site.payments);
    createOrder({ name: 'Cliente', type: 'retirada', address: '', payment: 'Pix', changeFor: '', notes: '' }, buildLines({ 'esfiha-carne': 1 }, site.products, site.halfAndHalf), NOW);
    setDemoOn(false);
    syncDemoOrders(NOW, site.products, site.payments);
    expect(loadOrders().map((o) => o.source)).toEqual(['site']);
  });
});
