import { describe, expect, it } from 'vitest';
import { site } from '../src/config/site';
import { directionsLink, scheduleLink, treatmentLink, treatmentMessage, whatsappLink } from '../src/lib/whatsapp';

describe('link do WhatsApp', () => {
  it('usa wa.me com o número da configuração e a saudação codificada', () => {
    const url = scheduleLink(site.contact);
    expect(url.startsWith(`https://wa.me/${site.contact.whatsapp}?text=`)).toBe(true);
    const text = new URL(url).searchParams.get('text');
    expect(text).toBe('Olá! Vim pelo site da Celeste Odontologia e gostaria de agendar uma avaliação.');
  });

  it('codifica caracteres especiais', () => {
    const url = whatsappLink({ whatsapp: '5500000000000' }, 'Olá & tudo bem? 100%');
    expect(url).not.toContain(' ');
    expect(new URL(url).searchParams.get('text')).toBe('Olá & tudo bem? 100%');
  });

  it('o número tem só dígitos (55 + DDD + número)', () => {
    expect(site.contact.whatsapp).toMatch(/^55\d{10,11}$/);
  });

  it('inclui o tratamento na mensagem', () => {
    const message = treatmentMessage(site.contact, 'Implantes');
    expect(message).toContain('implantes');
    expect(message).not.toContain('{tratamento}');
    expect(new URL(treatmentLink(site.contact, 'Implantes')).searchParams.get('text')).toBe(message);
  });

  it('Como chegar usa o link configurado ou a busca pelo endereço', () => {
    const base = { street: 'Rua A, 1', district: 'Centro', city: 'X', state: 'MT' };
    expect(directionsLink({ ...base, directionsUrl: 'https://maps.example/abc' })).toBe('https://maps.example/abc');
    const fallback = directionsLink({ ...base, directionsUrl: '' });
    expect(fallback.startsWith('https://www.google.com/maps/search/')).toBe(true);
    expect(decodeURIComponent(fallback)).toContain('Rua A, 1, Centro, X - MT');
  });
});
