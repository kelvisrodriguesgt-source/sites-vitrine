import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { buildLines, halfKey } from '../src/lib/cart';
import { formatBRL, toCents } from '../src/lib/money';
import { buildOrderMessage, buildWhatsAppUrl, type CheckoutData, digitsOnly, parseMoney, validateCheckout } from '../src/lib/whatsapp';

const lines = buildLines({ 'pepperoni|G': 2, [halfKey('quatro-queijos', 'calabresa', 'M')]: 1, 'refrigerante-lata': 1 }, site.products, site.halfAndHalf);
const base: CheckoutData = { name: ' Ana ', type: 'entrega', address: 'Rua A, 10', payment: 'Pix', changeFor: '', notes: '' };

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
    const msg = buildOrderMessage({ brandName: 'FORNO NERO', demo: false, lines, checkout: { ...base, notes: 'Sem cebola' } });
    expect(msg).toBe(
      [
        '*Novo pedido - FORNO NERO*',
        '',
        '*Cliente:* Ana',
        '*Tipo:* Entrega',
        '*Endereço:* Rua A, 10',
        '*Pagamento:* Pix',
        '',
        '*Itens*',
        '2x Pepperoni (G) - R$ 153,80',
        '1x Pizza M meio a meio: Calabresa / Quatro Queijos - R$ 58,90',
        '1x Refrigerante lata 350 ml - R$ 6,00',
        '',
        '*Subtotal:* R$ 218,70',
        '*Entrega:* a combinar',
        '*Total:* R$ 218,70',
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
    expect(Object.keys(validateCheckout({ ...base, name: '', address: '', payment: '' }, [])).sort()).toEqual([
      'address',
      'cart',
      'name',
      'payment'
    ]);
  });
  it('não exige endereço na retirada', () => {
    expect(validateCheckout({ ...base, type: 'retirada', address: '' }, lines)).toEqual({});
  });
  it('aceita pedido válido', () => {
    expect(validateCheckout(base, lines)).toEqual({});
  });
});

describe('número do pedido na mensagem', () => {
  it('aparece no título quando o pedido foi registrado no painel', () => {
    const msg = buildOrderMessage({ brandName: 'Forno Nero', demo: false, lines: [], checkout: base, orderNumber: 1001 });
    expect(msg.split('\n')[0]).toBe('*Novo pedido #1001 - Forno Nero*');
    expect(buildOrderMessage({ brandName: 'Forno Nero', demo: false, lines: [], checkout: base }).split('\n')[0]).toBe('*Novo pedido - Forno Nero*');
  });
});

describe('troco', () => {
  it('lê valores em reais', () => {
    expect(parseMoney('100')).toBe(100);
    expect(parseMoney('R$ 1.050,50')).toBe(1050.5);
    expect(parseMoney('100,5')).toBe(100.5);
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('0')).toBeNull();
  });

  it('só valida troco em dinheiro e exige valor maior ou igual ao total', () => {
    expect(validateCheckout({ ...base, payment: 'Pix', changeFor: '5' }, lines)).toEqual({});
    expect(validateCheckout({ ...base, payment: 'Dinheiro', changeFor: '' }, lines)).toEqual({});
    expect(validateCheckout({ ...base, payment: 'Dinheiro', changeFor: '100' }, lines).changeFor).toBeTruthy();
    expect(validateCheckout({ ...base, payment: 'Dinheiro', changeFor: 'xx' }, lines).changeFor).toBeTruthy();
    expect(validateCheckout({ ...base, payment: 'Dinheiro', changeFor: '250' }, lines)).toEqual({});
  });

  it('aparece na mensagem', () => {
    expect(buildOrderMessage({ brandName: 'X', demo: false, lines, checkout: { ...base, payment: 'Dinheiro', changeFor: '250' } })).toContain('*Troco para:* R$ 250,00');
    expect(buildOrderMessage({ brandName: 'X', demo: false, lines, checkout: { ...base, payment: 'Dinheiro' } })).toContain('*Troco:* não precisa');
  });
});

describe('contato do site', () => {
  it('uma única mensagem de saudação para o WhatsApp', () => {
    expect(site.contact.greeting).toBe('Olá! Vim pelo site da Forno Nero e quero fazer um pedido.');
    expect(site.contact.whatsapp).toBe('5565999034981');
  });
});
