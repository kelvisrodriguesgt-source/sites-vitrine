import { describe, expect, it } from 'vitest';
import type { Order } from '../src/shared/orders';
import { activeCount, breakdown, dailySeries, dayKey, delta, hourlySeries, kpis, periodDays, topProducts } from '../src/shared/stats';

const NOW = new Date(2026, 10, 13, 15, 0).getTime(); // sexta-feira
const at = (back: number, h = 12) => new Date(2026, 10, 13 - back, h).getTime();

function order(over: Partial<Order> & { createdAt: number }): Order {
  return {
    id: String(Math.random()),
    number: 1,
    customer: 'X',
    type: 'entrega',
    address: '',
    payment: 'Pix',
    notes: '',
    items: [{ id: 'a', name: 'Classic', qty: 1, unitCents: 3000 }],
    totalCents: 3000,
    status: 'concluido',
    history: [],
    source: 'demo',
    ...over
  };
}

describe('períodos', () => {
  it('monta dias do período e do anterior sem sobreposição', () => {
    const { days, previous } = periodDays('7d', NOW);
    expect(days).toHaveLength(7);
    expect(days[6]).toBe('2026-11-13');
    expect(days[0]).toBe('2026-11-07');
    expect(previous).toHaveLength(7);
    expect(previous[6]).toBe('2026-11-06');
    expect(periodDays('hoje', NOW).previous).toEqual(['2026-11-12']);
  });

  it('atravessa a virada do mês', () => {
    const { days } = periodDays('7d', new Date(2026, 11, 2, 10).getTime());
    expect(days[0]).toBe('2026-11-26');
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('indicadores', () => {
  const orders = [
    order({ createdAt: at(0), totalCents: 5000 }),
    order({ createdAt: at(0, 14), totalCents: 3000, status: 'cancelado' }),
    order({ createdAt: at(1), totalCents: 4000 }),
    order({ createdAt: at(10), totalCents: 9000 }),
    order({ createdAt: at(0, 16), totalCents: 2000, status: 'novo' })
  ];

  it('ignora cancelados no faturamento e conta cancelamentos', () => {
    const k = kpis(orders, periodDays('hoje', NOW).days);
    expect(k).toEqual({ revenueCents: 7000, orders: 2, avgTicketCents: 3500, canceled: 1 });
  });

  it('respeita o período', () => {
    expect(kpis(orders, periodDays('7d', NOW).days).revenueCents).toBe(11000);
    expect(kpis(orders, periodDays('30d', NOW).days).revenueCents).toBe(20000);
  });

  it('conta pedidos em andamento, qualquer período', () => {
    expect(activeCount(orders)).toBe(1);
  });

  it('calcula variação', () => {
    expect(delta(150, 100)).toBe(50);
    expect(delta(50, 100)).toBe(-50);
    expect(delta(10, 0)).toBeNull();
    expect(delta(0, 0)).toBe(0);
  });

  it('série diária cobre todos os dias, inclusive vazios', () => {
    const s = dailySeries(orders, periodDays('7d', NOW).days);
    expect(s).toHaveLength(7);
    expect(s[6]).toMatchObject({ revenueCents: 7000, count: 2 });
    expect(s[5]).toMatchObject({ revenueCents: 4000, count: 1 });
    expect(s[0]).toMatchObject({ revenueCents: 0, count: 0 });
  });

  it('ranking de produtos e divisões', () => {
    const multi = [
      order({ createdAt: at(0), items: [{ id: 'a', name: 'Classic', qty: 2, unitCents: 3000 }, { id: 'b', name: 'Coca', qty: 5, unitCents: 700 }] }),
      order({ createdAt: at(0), payment: 'Cartão', type: 'retirada' })
    ];
    const days = periodDays('hoje', NOW).days;
    expect(topProducts(multi, days, 1)).toEqual([{ id: 'b', name: 'Coca', qty: 5, revenueCents: 3500 }]);
    expect(breakdown(multi, days, 'type').map((s) => s.label).sort()).toEqual(['Entrega', 'Retirada']);
    expect(breakdown(multi, days, 'payment').map((s) => s.label).sort()).toEqual(['Cartão', 'Pix']);
  });
});

describe('vendas por hora', () => {
  it('agrupa por hora do dia e ignora cancelados', () => {
    const orders = [
      order({ createdAt: at(0, 12), totalCents: 1000 }),
      order({ createdAt: at(0, 12), totalCents: 500 }),
      order({ createdAt: at(0, 19), totalCents: 700, status: 'cancelado' }),
      order({ createdAt: at(1, 12), totalCents: 900 })
    ];
    const h = hourlySeries(orders, '2026-11-13');
    expect(h).toHaveLength(24);
    expect(h[12]).toEqual({ hour: 12, revenueCents: 1500, count: 2 });
    expect(h[19]?.count).toBe(0);
  });
});
