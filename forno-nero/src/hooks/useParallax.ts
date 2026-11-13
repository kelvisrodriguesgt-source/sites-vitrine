import { useEffect, useRef } from 'react';

/**
 * Desloca os filhos com `data-speed` conforme o scroll (efeito de profundidade).
 * Desligado com movimento reduzido. Escreve só a variável CSS --py (permitido pela CSP).
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-speed]'));
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 1400);
      for (const el of items) el.style.setProperty('--py', String(Math.round(y * Number(el.dataset.speed))));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}
