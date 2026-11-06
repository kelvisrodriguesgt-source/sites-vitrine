/* Funções puras de movimento: fáceis de testar, sem DOM. */

/** Progresso de rolagem de 0 a 1. */
export function scrollProgress(scrollTop, scrollHeight, clientHeight) {
  const range = scrollHeight - clientHeight;
  if (!(range > 0)) return 0;
  return Math.min(1, Math.max(0, scrollTop / range));
}

/** Marcos reais de carregamento da página, de 0 a 1. */
export const LOAD_STEPS = Object.freeze({ start: 0.12, parsed: 0.45, fonts: 0.8, loaded: 1 });

export function loadProgress({ parsed = false, fonts = false, loaded = false } = {}) {
  if (loaded) return LOAD_STEPS.loaded;
  if (fonts) return LOAD_STEPS.fonts;
  if (parsed) return LOAD_STEPS.parsed;
  return LOAD_STEPS.start;
}

/** Quem pede menos movimento recebe tudo pronto, sem skeleton nem deslocamentos. */
export function prefersReducedMotion(win) {
  try {
    return Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}
