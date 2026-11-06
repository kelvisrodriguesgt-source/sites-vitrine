import { describe, expect, it } from 'vitest';
import { LOAD_STEPS, loadProgress, prefersReducedMotion, scrollProgress } from '../../grupo-kr-motion/js/lib.js';

describe('scrollProgress', () => {
  it('vai de 0 a 1 conforme a rolagem', () => {
    expect(scrollProgress(0, 2000, 1000)).toBe(0);
    expect(scrollProgress(500, 2000, 1000)).toBe(0.5);
    expect(scrollProgress(1000, 2000, 1000)).toBe(1);
  });
  it('limita entre 0 e 1 (rolagem elástica do celular)', () => {
    expect(scrollProgress(-40, 2000, 1000)).toBe(0);
    expect(scrollProgress(1300, 2000, 1000)).toBe(1);
  });
  it('página sem rolagem devolve 0, sem dividir por zero', () => {
    expect(scrollProgress(0, 800, 800)).toBe(0);
    expect(scrollProgress(0, 600, 800)).toBe(0);
  });
});

describe('loadProgress', () => {
  it('avança pelos marcos reais de carregamento', () => {
    expect(loadProgress()).toBe(LOAD_STEPS.start);
    expect(loadProgress({ parsed: true })).toBe(LOAD_STEPS.parsed);
    expect(loadProgress({ parsed: true, fonts: true })).toBe(LOAD_STEPS.fonts);
    expect(loadProgress({ parsed: true, fonts: true, loaded: true })).toBe(1);
  });
  it('o marco mais avançado vence, e só load completo chega a 100%', () => {
    expect(loadProgress({ fonts: true })).toBe(LOAD_STEPS.fonts);
    expect(loadProgress({ loaded: true })).toBe(1);
    expect(LOAD_STEPS.fonts).toBeLessThan(1);
    expect(LOAD_STEPS.start).toBeLessThan(LOAD_STEPS.parsed);
    expect(LOAD_STEPS.parsed).toBeLessThan(LOAD_STEPS.fonts);
  });
});

describe('prefersReducedMotion', () => {
  const win = (matches) => ({ matchMedia: (q) => ({ matches: q === '(prefers-reduced-motion: reduce)' && matches }) });
  it('lê a preferência do sistema', () => {
    expect(prefersReducedMotion(win(true))).toBe(true);
    expect(prefersReducedMotion(win(false))).toBe(false);
  });
  it('sem matchMedia ou com erro, assume movimento normal', () => {
    expect(prefersReducedMotion({})).toBe(false);
    expect(
      prefersReducedMotion({
        matchMedia: () => {
          throw new Error('x');
        }
      })
    ).toBe(false);
  });
});
