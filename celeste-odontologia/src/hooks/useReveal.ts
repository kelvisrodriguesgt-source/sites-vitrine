import { useEffect, useRef } from 'react';

/**
 * Entrada ao rolar sem risco de conteúdo invisível:
 * - só esconde elementos que estão abaixo da dobra no momento da hidratação;
 * - sem IntersectionObserver ou com movimento reduzido, nada é escondido.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;
    el.classList.add('will-reveal');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    // Rede de segurança: nada fica escondido se o observer falhar.
    const failsafe = window.setTimeout(() => el.classList.add('in'), 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
  return ref;
}
