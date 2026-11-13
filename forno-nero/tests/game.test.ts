import { beforeEach, describe, expect, it } from 'vitest';
import { BOX_H, BOX_W, BOX_Y, GAME_H, GAME_W, type Pep, caught, clamp, readRecord, saveRecord, spawn, spawnInterval, step } from '../src/lib/game';
import { mulberry32 } from '../src/shared/seed';
import { installBrowserShim } from './shared-helpers';

const pep = (over: Partial<Pep> = {}): Pep => ({ x: 180, y: 0, r: 20, vy: 100, rot: 0, vr: 0, img: 0, ...over });

describe('minijogo: regras', () => {
  it('acelera ao longo da partida', () => {
    expect(spawnInterval(0, 30)).toBeCloseTo(0.95);
    expect(spawnInterval(30, 30)).toBeCloseTo(0.45);
    expect(spawnInterval(99, 30)).toBeCloseTo(0.45);
    expect(spawnInterval(15, 30)).toBeLessThan(spawnInterval(5, 30));
  });

  it('pepperoni nasce dentro da tela, em cima, com imagem válida', () => {
    const rnd = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const p = spawn(rnd, i % 30, 30, 6);
      expect(p.x - p.r).toBeGreaterThanOrEqual(0);
      expect(p.x + p.r).toBeLessThanOrEqual(GAME_W);
      expect(p.y).toBeLessThan(0);
      expect(p.img).toBeGreaterThanOrEqual(0);
      expect(p.img).toBeLessThan(6);
    }
  });

  it('pega só quando está sobre a caixa', () => {
    const y = BOX_Y + 4;
    expect(caught(pep({ y }), 180)).toBe(true);
    expect(caught(pep({ y, x: 180 + BOX_W / 2 + 40 }), 180)).toBe(false);
    expect(caught(pep({ y: BOX_Y - 80 }), 180)).toBe(false);
    expect(caught(pep({ y: BOX_Y + BOX_H + 5 }), 180)).toBe(false);
  });

  it('step: remove os pegos e os que caíram fora', () => {
    const r = step([pep({ y: BOX_Y, vy: 0 }), pep({ y: 100, x: 20, vy: 0 }), pep({ y: GAME_H + 100, vy: 0 })], 0.016, 180);
    expect(r.caught).toBe(1);
    expect(r.peps).toHaveLength(1);
    expect(r.peps[0]?.x).toBe(20);
  });

  it('clamp', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});

describe('minijogo: recorde', () => {
  const install = () => {
    const shim = installBrowserShim();
    (globalThis.window as unknown as Record<string, unknown>).localStorage = globalThis.localStorage;
    return shim;
  };
  beforeEach(() => {
    install();
  });

  it('guarda só o maior placar', () => {
    expect(readRecord()).toBe(0);
    expect(saveRecord(12)).toEqual({ record: 12, isNew: true });
    expect(saveRecord(8)).toEqual({ record: 12, isNew: false });
    expect(saveRecord(12)).toEqual({ record: 12, isNew: false });
    expect(saveRecord(20)).toEqual({ record: 20, isNew: true });
    expect(readRecord()).toBe(20);
  });

  it('ignora valor corrompido', () => {
    const { store } = install();
    store.set('forno_game_record_v1', 'abc');
    expect(readRecord()).toBe(0);
  });
});
