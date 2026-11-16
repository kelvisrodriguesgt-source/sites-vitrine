import { describe, expect, it } from 'vitest';
import { buildBookingMessage, emptyBooking, genericMessage, treatmentMessage, validateBooking } from '../src/lib/booking';

const procedures = ['Limpeza de pele', 'Massoterapia'];
const days = ['Segunda-feira', 'Qualquer dia'];
const ok = { name: 'Maria Souza', phone: '(69) 99999-0000', procedure: 'Massoterapia', day: 'Segunda-feira', message: '' };

describe('validateBooking', () => {
  it('formulário vazio acusa os quatro campos obrigatórios', () => {
    expect(Object.keys(validateBooking(emptyBooking, procedures, days, 500)).sort()).toEqual(['day', 'name', 'phone', 'procedure']);
  });
  it('aceita dados válidos', () => {
    expect(validateBooking(ok, procedures, days, 500)).toEqual({});
  });
  it('recusa telefone curto, longo e celular sem 9', () => {
    expect(validateBooking({ ...ok, phone: '(69) 9999' }, procedures, days, 500).phone).toBeDefined();
    expect(validateBooking({ ...ok, phone: '6999999000011' }, procedures, days, 500).phone).toBeDefined();
    expect(validateBooking({ ...ok, phone: '(69) 89999-0000' }, procedures, days, 500).phone).toBeDefined();
  });
  it('aceita telefone fixo com 10 dígitos', () => {
    expect(validateBooking({ ...ok, phone: '(69) 3322-1100' }, procedures, days, 500).phone).toBeUndefined();
  });
  it('recusa tratamento e dia fora da lista', () => {
    const e = validateBooking({ ...ok, procedure: 'Botox', day: 'Feriado' }, procedures, days, 500);
    expect(e.procedure).toBeDefined();
    expect(e.day).toBeDefined();
  });
  it('limita o tamanho da mensagem', () => {
    expect(validateBooking({ ...ok, message: 'a'.repeat(501) }, procedures, days, 500).message).toBeDefined();
    expect(validateBooking({ ...ok, message: 'a'.repeat(500) }, procedures, days, 500).message).toBeUndefined();
  });
  it('nome de uma letra é recusado', () => {
    expect(validateBooking({ ...ok, name: ' A ' }, procedures, days, 500).name).toBeDefined();
  });
});

describe('mensagens de WhatsApp', () => {
  it('traz todos os campos e não afirma confirmação', () => {
    const msg = buildBookingMessage({ ...ok, message: 'Prefiro a tarde.' }, 'Jaqueline Suellen');
    expect(msg).toContain('Olá, Jaqueline!');
    for (const part of ['Maria Souza', '(69) 99999-0000', 'Massoterapia', 'Segunda-feira', 'Prefiro a tarde.']) expect(msg).toContain(part);
    expect(msg).not.toMatch(/confirmad/i);
  });
  it('omite a linha de mensagem quando vazia', () => {
    expect(buildBookingMessage(ok, 'Jaqueline Suellen')).not.toContain('*Mensagem:*');
  });
  it('mensagens curtas dos cartões', () => {
    expect(treatmentMessage('Jaqueline Suellen', 'Dermaplaning')).toBe('Olá, Jaqueline! Vim pelo site e gostaria de agendar: Dermaplaning.');
    expect(genericMessage('Jaqueline Suellen')).toContain('agendar um horário');
  });
});
