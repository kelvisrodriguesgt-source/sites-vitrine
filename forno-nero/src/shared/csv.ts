import { type Order, statusLabel } from './orders';

/** Célula de CSV segura: aspas escapadas e fórmulas de planilha neutralizadas. */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const reais = (cents: number): string => (cents / 100).toFixed(2).replace('.', ',');

const pad = (n: number): string => String(n).padStart(2, '0');
const stamp = (ts: number): string => {
  const d = new Date(ts);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** CSV com ponto e vírgula e BOM, para abrir direto no Excel em português. */
export function ordersToCsv(orders: Order[]): string {
  const head = ['Número', 'Data', 'Cliente', 'Tipo', 'Endereço', 'Pagamento', 'Status', 'Itens', 'Total (R$)', 'Origem'];
  const rows = [...orders]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((o) =>
      [
        o.number,
        stamp(o.createdAt),
        o.customer,
        o.type === 'entrega' ? 'Entrega' : 'Retirada',
        o.address,
        o.payment,
        statusLabel(o.status, o.type),
        o.items.map((i) => `${i.qty}x ${i.name}`).join(' | '),
        reais(o.totalCents),
        o.source === 'demo' ? 'Exemplo' : 'Site'
      ]
        .map(csvCell)
        .join(';')
    );
  return `﻿${[head.join(';'), ...rows].join('\r\n')}\r\n`;
}
