import { describe, expect, it } from 'vitest';
import { digitsOnly, formatPhone, maskPhone, waLink } from '../src/lib/whatsapp';

describe('whatsapp', () => {
  it('digitsOnly', () => expect(digitsOnly('+55 (69) 93300-4605')).toBe('5569933004605'));
  it('waLink sem texto', () => expect(waLink('5569933004605')).toBe('https://wa.me/5569933004605'));
  it('waLink codifica o texto', () => expect(waLink('5569933004605', 'Olá & tudo bem?\nSim')).toBe('https://wa.me/5569933004605?text=Ol%C3%A1%20%26%20tudo%20bem%3F%0ASim'));
  it('formatPhone', () => {
    expect(formatPhone('5569933004605')).toBe('(69) 93300-4605');
    expect(formatPhone('556933221100')).toBe('(69) 3322-1100');
  });
  it('maskPhone acompanha a digitação', () => {
    expect(maskPhone('6')).toBe('(6');
    expect(maskPhone('699')).toBe('(69) 9');
    expect(maskPhone('69999990000')).toBe('(69) 99999-0000');
    expect(maskPhone('6933221100')).toBe('(69) 3322-1100');
    expect(maskPhone('699999900001234')).toBe('(69) 99999-0000');
    expect(maskPhone('')).toBe('');
  });
});
