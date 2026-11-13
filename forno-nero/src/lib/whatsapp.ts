import type { CartLine } from './cart';
import { totals } from './cart';
import { formatBRL, toCents } from './money';

export type OrderType = 'entrega' | 'retirada';

export interface CheckoutData {
  name: string;
  type: OrderType;
  address: string;
  payment: string;
  /** Valor da nota para troco (só dinheiro). Vazio = não precisa de troco. */
  changeFor: string;
  notes: string;
}

export type CheckoutErrors = Partial<Record<'name' | 'address' | 'payment' | 'changeFor' | 'cart', string>>;

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const isCash = (payment: string): boolean => payment.trim().toLowerCase() === 'dinheiro';

/** Lê "100", "100,00" ou "R$ 1.050,50" como reais. null = vazio ou inválido. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized = cleaned;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    normalized = cleaned.split(decimal === ',' ? '.' : ',').join('').replace(decimal, '.');
  } else if (lastComma >= 0) normalized = cleaned.replace(',', '.');
  else if (lastDot >= 0 && cleaned.length - lastDot - 1 === 3) normalized = cleaned.replace('.', '');
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

export function validateCheckout(data: CheckoutData, lines: CartLine[]): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (lines.length === 0) errors.cart = 'Adicione ao menos um item ao pedido.';
  if (data.name.trim().length < 2) errors.name = 'Informe seu nome.';
  if (data.type === 'entrega' && data.address.trim().length < 5) errors.address = 'Informe o endereço de entrega.';
  if (!data.payment) errors.payment = 'Escolha a forma de pagamento.';
  if (isCash(data.payment) && data.changeFor.trim()) {
    const value = parseMoney(data.changeFor);
    if (value === null) errors.changeFor = 'Informe um valor válido, como 100.';
    else if (toCents(value) < totals(lines).totalCents) errors.changeFor = 'O valor do troco precisa ser maior ou igual ao total do pedido.';
  }
  return errors;
}

interface MessageInput {
  brandName: string;
  demo: boolean;
  lines: CartLine[];
  checkout: CheckoutData;
  /** Número do pedido registrado no painel, quando houver. */
  orderNumber?: number;
}

/** Monta a mensagem organizada que será enviada ao WhatsApp. */
export function buildOrderMessage({ brandName, demo, lines, checkout, orderNumber }: MessageInput): string {
  const { subtotalCents, totalCents } = totals(lines);
  const out: string[] = [];
  out.push(`*Novo pedido${orderNumber ? ` #${orderNumber}` : ''} - ${brandName}*`);
  if (demo) out.push('_Pedido de demonstração enviado pelo site._');
  out.push('');
  out.push(`*Cliente:* ${checkout.name.trim()}`);
  out.push(`*Tipo:* ${checkout.type === 'entrega' ? 'Entrega' : 'Retirada'}`);
  if (checkout.type === 'entrega') out.push(`*Endereço:* ${checkout.address.trim()}`);
  out.push(`*Pagamento:* ${checkout.payment}`);
  if (isCash(checkout.payment)) {
    const change = parseMoney(checkout.changeFor);
    out.push(change === null ? '*Troco:* não precisa' : `*Troco para:* ${formatBRL(toCents(change))}`);
  }
  out.push('');
  out.push('*Itens*');
  for (const l of lines) out.push(`${l.qty}x ${l.name} - ${formatBRL(l.totalCents)}`);
  out.push('');
  out.push(`*Subtotal:* ${formatBRL(subtotalCents)}`);
  if (checkout.type === 'entrega') out.push('*Entrega:* a combinar');
  out.push(`*Total:* ${formatBRL(totalCents)}`);
  const notes = checkout.notes.trim();
  if (notes) {
    out.push('');
    out.push(`*Observações:* ${notes}`);
  }
  return out.join('\n');
}

export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(text)}`;
}
