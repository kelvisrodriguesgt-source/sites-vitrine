import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { buildLines } from '../src/lib/cart';
import { formatBRL, toCents } from '../src/lib/money';
import { buildOrderMessage, buildWhatsAppUrl, type CheckoutData, digitsOnly, validateCheckout } from '../src/lib/whatsapp';

const lines = buildLines({ 'brasa-classic': 2, 'refri-lata': 1 }, site.products);
const base: CheckoutData = { name: ' Ana ', type: 'entrega', address: 'Rua A, 10', payment: 'Pix', notes: '' };

describe('dinheiro', () => {
  it('formata em reais', () => {
    expect(formatBRL(3290)).toBe('R$ 32,90');
    expect(formatBRL(5)).toBe('R$ 0,05');
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(-250)).toBe('-R$ 2,50');
  });
  it('converte para centavos sem erro', () => {
    expect(toCents(32.9)).toBe(3290);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });
});

describe('mensagem do WhatsApp', () => {
  it('monta pedido de entrega completo', () => {
    const msg = buildOrderMessage({ brandName: 'BRASA BURGER', demo: false, lines, checkout: { ...base, notes: 'Sem cebola' } });
    expect(msg).toBe(
      [
        '*Novo pedido - BRASA BURGER*',
        '',
        '*Cliente:* Ana',
        '*Tipo:* Entrega',
        '*Endereço:* Rua A, 10',
        '*Pagamento:* Pix',
        '',
        '*Itens*',
        '2x Brasa Classic - R$ 65,80',
        '1x Refrigerante lata - R$ 6,50',
        '',
        '*Subtotal:* R$ 72,30',
        '*Entrega:* a combinar',
        '*Total:* R$ 72,30',
        '',
        '*Observações:* Sem cebola'
      ].join('\n')
    );
  });

  it('retirada não inclui endereço nem entrega, e demo é identificada', () => {
    const msg = buildOrderMessage({ brandName: 'X', demo: true, lines, checkout: { ...base, type: 'retirada' } });
    expect(msg).toContain('Retirada');
    expect(msg).toContain('demonstração');
    expect(msg).not.toContain('Endereço');
    expect(msg).not.toContain('Entrega:');
  });

  it('gera link wa.me com texto codificado', () => {
    const url = buildWhatsAppUrl('+55 (00) 90000-0000', 'Olá & pão\nok');
    expect(url).toBe('https://wa.me/5500900000000?text=Ol%C3%A1%20%26%20p%C3%A3o%0Aok');
    expect(digitsOnly('+55 (00) 9')).toBe('55009');
  });

  it('o número do site vem de uma única variável', () => {
    expect(buildWhatsAppUrl(site.contact.whatsapp, 'oi')).toContain(site.contact.whatsapp);
  });
});

describe('validação do pedido', () => {
  it('exige itens, nome, pagamento e endereço na entrega', () => {
    expect(Object.keys(validateCheckout({ ...base, name: '', address: '', payment: '' }, 0)).sort()).toEqual([
      'address',
      'cart',
      'name',
      'payment'
    ]);
  });
  it('não exige endereço na retirada', () => {
    expect(validateCheckout({ ...base, type: 'retirada', address: '' }, 1)).toEqual({});
  });
  it('aceita pedido válido', () => {
    expect(validateCheckout(base, 2)).toEqual({});
  });
});

describe('número do pedido na mensagem', () => {
  it('aparece no título quando o pedido foi registrado no painel', () => {
    const msg = buildOrderMessage({ brandName: 'Brasa', demo: false, lines: [], checkout: base, orderNumber: 1001 });
    expect(msg.split('\n')[0]).toBe('*Novo pedido #1001 - Brasa*');
    expect(buildOrderMessage({ brandName: 'Brasa', demo: false, lines: [], checkout: base }).split('\n')[0]).toBe('*Novo pedido - Brasa*');
  });
});
