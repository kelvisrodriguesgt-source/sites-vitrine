import { describe, expect, it } from 'vitest';
import { csvCell, ordersToCsv } from '../src/shared/csv';
import type { Order } from '../src/shared/orders';

describe('csv', () => {
  it('escapa aspas, separador e quebra de linha', () => {
    expect(csvCell('Ana')).toBe('Ana');
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('diz "oi"')).toBe('"diz ""oi"""');
    expect(csvCell('l1\nl2')).toBe('"l1\nl2"');
  });

  it('neutraliza fórmulas de planilha', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+55')).toBe("'+55");
    expect(csvCell('@soma')).toBe("'@soma");
  });

  it('gera cabeçalho, BOM e linhas em ordem cronológica', () => {
    const base: Order = {
      id: 'a', number: 2, createdAt: new Date(2026, 10, 13, 12, 5).getTime(), customer: 'Maria', type: 'entrega', address: 'Rua A, 1',
      payment: 'Pix', notes: '', items: [{ id: 'x', name: 'Classic', qty: 2, unitCents: 3290 }], totalCents: 6580, status: 'concluido', history: [], source: 'site'
    };
    const csv = ordersToCsv([base, { ...base, id: 'b', number: 1, createdAt: base.createdAt - 1000 }]);
    const lines = csv.trim().split('\r\n');
    expect(csv.startsWith('﻿Número;')).toBe(true);
    expect(lines).toHaveLength(3);
    expect(lines[1]?.startsWith('1;')).toBe(true);
    expect(lines[2]).toBe('2;13/11/2026 12:05;Maria;Entrega;Rua A, 1;Pix;Concluído;2x Classic;65,80;Site');
  });
});
