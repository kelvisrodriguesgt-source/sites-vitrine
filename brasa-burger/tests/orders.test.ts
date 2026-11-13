import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '../src/config/types';
import { buildLines } from '../src/lib/cart';
import {
  advanceLabel,
  applyStatus,
  buildOrder,
  nextStatus,
  orderSummary,
  sanitizeOrders,
  statusLabel
} from '../src/shared/orders';
import { clearAllOrders, createOrder, loadOrders, setOrderStatus } from '../src/shared/ordersStore';
import { KEYS, readJSON, subscribe } from '../src/shared/storage';
import { installBrowserShim } from './shared-helpers';

const products: Product[] = [
  { id: 'a', name: 'Classic', description: '', price: 32.9, category: 'hamburgueres' },
  { id: 'b', name: 'Coca', description: '', price: 7, category: 'bebidas' }
];
const fields = { customer: ' Maria ', type: 'entrega' as const, address: 'Rua A, 10', payment: 'Pix', notes: ' sem cebola ' };
const checkout = { name: ' Maria ', type: 'entrega' as const, address: 'Rua A, 10', payment: 'Pix', notes: ' sem cebola ' };

describe('fluxo de status', () => {
  it('avança em ordem e termina em concluído', () => {
    expect(nextStatus('novo')).toBe('preparo');
    expect(nextStatus('preparo')).toBe('pronto');
    expect(nextStatus('pronto')).toBe('concluido');
    expect(nextStatus('concluido')).toBeNull();
    expect(nextStatus('cancelado')).toBeNull();
  });

  it('adapta o texto à entrega ou retirada', () => {
    expect(statusLabel('pronto', 'entrega')).toBe('Saiu para entrega');
    expect(statusLabel('pronto', 'retirada')).toBe('Pronto para retirada');
    expect(advanceLabel('concluido', 'entrega')).toBeNull();
  });

  it('registra histórico e ignora status repetido', () => {
    const o = buildOrder({ number: 5, customer: 'A', type: 'retirada', address: 'x', payment: 'Pix', notes: '', lines: buildLines({ a: 1 }, products), source: 'site', now: 1000 });
    expect(o.address).toBe('');
    const next = applyStatus(o, 'preparo', 2000);
    expect(next.history).toEqual([{ status: 'novo', at: 1000 }, { status: 'preparo', at: 2000 }]);
    expect(applyStatus(next, 'preparo', 3000)).toBe(next);
  });
});

describe('buildOrder e resumo', () => {
  it('calcula o total em centavos e limpa os textos', () => {
    const lines = buildLines({ a: 2, b: 1 }, products);
    const o = buildOrder({ number: 1001, ...fields, lines, source: 'site', now: 1 });
    expect(o.totalCents).toBe(3290 * 2 + 700);
    expect(o.customer).toBe('Maria');
    expect(o.notes).toBe('sem cebola');
    expect(orderSummary(o)).toContain('2x Classic - R$ 65,80');
    expect(orderSummary(o)).toContain('Total: R$ 72,80');
  });
});

describe('sanitizeOrders', () => {
  it('descarta registros inválidos e recalcula o total', () => {
    const good = buildOrder({ number: 1, ...fields, lines: buildLines({ a: 1 }, products), source: 'site', now: 1 });
    const out = sanitizeOrders([good, null, { id: 1 }, { ...good, status: 'xyz' }, { ...good, id: 'z', items: [] }, { ...good, id: 'w', totalCents: 1 }]);
    expect(out.map((o) => o.id)).toEqual([good.id, 'w']);
    expect(out[1]?.totalCents).toBe(3290);
    expect(sanitizeOrders('lixo')).toEqual([]);
  });
});

describe('armazenamento de pedidos', () => {
  beforeEach(() => {
    installBrowserShim();
  });

  it('cria pedidos com numeração a partir de 1001 e mais recente primeiro', () => {
    const lines = buildLines({ a: 1 }, products);
    const first = createOrder(checkout, lines, 1000);
    const second = createOrder(checkout, lines, 2000);
    expect(first?.number).toBe(1001);
    expect(second?.number).toBe(1002);
    expect(loadOrders().map((o) => o.number)).toEqual([1002, 1001]);
  });

  it('atualiza status e persiste', () => {
    const o = createOrder(checkout, buildLines({ a: 1 }, products), 1000);
    setOrderStatus(o?.id ?? '', 'preparo', 5000);
    expect(loadOrders()[0]?.status).toBe('preparo');
    clearAllOrders();
    expect(loadOrders()).toEqual([]);
    expect(readJSON(KEYS.seq, 0)).toBe(0);
  });

  it('não lança erro quando o armazenamento recusa a gravação', () => {
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {}
    };
    expect(createOrder(checkout, buildLines({ a: 1 }, products), 1)).toBeNull();
  });

  it('avisa quem assina quando uma chave muda', () => {
    installBrowserShim();
    let calls = 0;
    const off = subscribe([KEYS.orders], () => calls++);
    createOrder(checkout, buildLines({ a: 1 }, products), 1);
    expect(calls).toBeGreaterThan(0);
    const before = calls;
    off();
    createOrder(checkout, buildLines({ a: 1 }, products), 2);
    expect(calls).toBe(before);
  });
});
