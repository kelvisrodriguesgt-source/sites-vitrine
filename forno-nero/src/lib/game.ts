/** Regras do minijogo "Pegue o pepperoni", sem desenho nem navegador (testáveis). */

export const GAME_W = 360;
export const GAME_H = 480;
export const BOX_W = 88;
export const BOX_H = 38;
export const BOX_Y = GAME_H - 58;
export const RECORD_KEY = 'forno_game_record_v1';

export interface Pep {
  x: number;
  y: number;
  r: number;
  vy: number;
  rot: number;
  vr: number;
  img: number;
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Intervalo entre pepperonis (s): começa devagar e acelera até o fim. */
export const spawnInterval = (elapsed: number, duration: number): number => 0.95 - 0.5 * clamp(elapsed / duration, 0, 1);

export function spawn(rnd: () => number, elapsed: number, duration: number, images: number): Pep {
  const r = 17 + rnd() * 9;
  return {
    x: r + rnd() * (GAME_W - 2 * r),
    y: -r,
    r,
    vy: 110 + rnd() * 70 + 110 * clamp(elapsed / duration, 0, 1),
    rot: rnd() * Math.PI * 2,
    vr: (rnd() - 0.5) * 4,
    img: Math.floor(rnd() * Math.max(1, images))
  };
}

/** O pepperoni foi pego se o centro entra na faixa da caixa (com folga de metade do raio nas laterais). */
export function caught(p: Pep, boxX: number): boolean {
  const top = BOX_Y - 4;
  return p.y + p.r * 0.4 >= top && p.y <= BOX_Y + BOX_H && Math.abs(p.x - boxX) <= BOX_W / 2 + p.r * 0.5;
}

export interface Step {
  peps: Pep[];
  caught: number;
}

/** Avança os pepperonis `dt` segundos: remove os pegos e os que saíram da tela. */
export function step(peps: Pep[], dt: number, boxX: number): Step {
  const kept: Pep[] = [];
  let got = 0;
  for (const p of peps) {
    const moved = { ...p, y: p.y + p.vy * dt, rot: p.rot + p.vr * dt };
    if (caught(moved, boxX)) got++;
    else if (moved.y - moved.r <= GAME_H) kept.push(moved);
  }
  return { peps: kept, caught: got };
}

export function readRecord(): number {
  try {
    const n = Number(window.localStorage.getItem(RECORD_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Grava o recorde se o placar for maior. Retorna o recorde vigente e se houve novo recorde. */
export function saveRecord(score: number): { record: number; isNew: boolean } {
  const current = readRecord();
  if (score <= current) return { record: current, isNew: false };
  try {
    window.localStorage.setItem(RECORD_KEY, String(score));
  } catch {
    /* sem armazenamento: o recorde vale só nesta partida */
  }
  return { record: score, isNew: true };
}
