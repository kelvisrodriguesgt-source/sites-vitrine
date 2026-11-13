import type { CartLine } from './cart';
import { totals } from './cart';
import { formatBRL } from './money';

export type OrderType = 'entrega' | 'retirada';

export interface CheckoutData {
  name: string;
  type: OrderType;
  address: string;
  payment: string;
  notes: string;
}

export type CheckoutErrors = Partial<Record<'name' | 'address' | 'payment' | 'cart', string>>;

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export function validateCheckout(data: CheckoutData, lineCount: number): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (lineCount === 0) errors.cart = 'Adicione ao menos um item ao pedido.';
  if (data.name.trim().length < 2) errors.name = 'Informe seu nome.';
  if (data.type === 'entrega' && data.address.trim().length < 5) errors.address = 'Informe o endereço de entrega.';
  if (!data.payment) errors.payment = 'Escolha a forma de pagamento.';
  return errors;
}

interface MessageInput {
  brandName: string;
  demo: boolean;
  lines: CartLine[];
  checkout: CheckoutData;
}

/** Monta a mensagem organizada que será enviada ao WhatsApp. */
export function buildOrderMessage({ brandName, demo, lines, checkout }: MessageInput): string {
  const { subtotalCents, totalCents } = totals(lines);
  const out: string[] = [];
  out.push(`*Novo pedido - ${brandName}*`);
  if (demo) out.push('_Pedido de demonstração enviado pelo site._');
  out.push('');
  out.push(`*Cliente:* ${checkout.name.trim()}`);
  out.push(`*Tipo:* ${checkout.type === 'entrega' ? 'Entrega' : 'Retirada'}`);
  if (checkout.type === 'entrega') out.push(`*Endereço:* ${checkout.address.trim()}`);
  out.push(`*Pagamento:* ${checkout.payment}`);
  out.push('');
  out.push('*Itens*');
  for (const l of lines) out.push(`${l.qty}x ${l.product.name} - ${formatBRL(l.totalCents)}`);
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
