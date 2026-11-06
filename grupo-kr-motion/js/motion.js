/* Movimento do site (princípios da skill design-motion-principles).
 *
 * Lente: landing page = Jakub (acabamento) como principal, Emil (rapidez) em navegação e formulários,
 * Jhey só em detalhes. Filtro de frequência: tudo que se repete (hover, FAQ, links) é rápido (160–280ms);
 * só a entrada de seções usa 480ms. Anima só transform e opacity. Sem scale(0), sem easing "ease" puro.
 * Quem pede menos movimento recebe tudo pronto, sem skeleton nem deslocamento. */
import { loadProgress, prefersReducedMotion, scrollProgress } from './lib.js';

const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));

export function initMotion({ win, doc }) {
  const root = doc.documentElement;
  const reduce = prefersReducedMotion(win);

  /* ---------- 1) progresso de carregamento (marcos reais, não simulado) ---------- */
  const loadBar = doc.querySelector('.load-bar');
  const scrollBar = doc.querySelector('.scroll-bar');
  const setVar = (el, name, v) => el?.style.setProperty(name, String(v));

  const state = { parsed: doc.readyState !== 'loading', fonts: false, loaded: doc.readyState === 'complete' };
  const paintLoad = () => setVar(loadBar, '--p', loadProgress(state));
  paintLoad();

  const fontsReady = doc.fonts?.ready ? doc.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    state.fonts = true;
    paintLoad();
  });

  const finishLoad = () => {
    state.loaded = true;
    paintLoad();
    win.setTimeout(
      () => {
        loadBar?.classList.add('is-done');
        scrollBar?.classList.add('is-active');
        root.classList.add('is-loaded');
      },
      reduce ? 0 : 260
    );
  };
  if (doc.readyState === 'complete') finishLoad();
  else win.addEventListener('load', finishLoad, { once: true });

  /* ---------- 2) progresso de rolagem ---------- */
  const nativeTimeline = !reduce && win.CSS && win.CSS.supports && win.CSS.supports('animation-timeline', 'scroll()');
  if (scrollBar && !nativeTimeline) {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVar(scrollBar, '--p', scrollProgress(root.scrollTop, root.scrollHeight, root.clientHeight));
    };
    win.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          win.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------- 3) imagens: skeleton até carregar (lazy de verdade com loading="lazy") ---------- */
  const imgDone = (img) => img.classList.add('is-loaded');
  const imgReady = (img) =>
    img.complete && img.naturalWidth > 0
      ? Promise.resolve()
      : new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
  for (const img of $$(doc, 'img[data-lazy]')) {
    if (reduce) imgDone(img);
    else imgReady(img).then(() => imgDone(img));
  }

  /* ---------- 4) skeleton -> conteúdo, quando o bloco chega na tela e fontes/imagens estão prontos ---------- */
  const skels = $$(doc, '[data-skel]');
  const hydrate = (el) =>
    Promise.all([fontsReady, ...$$(el, 'img').map(imgReady)]).then(() => el.classList.add('is-ready'));

  if (reduce || !('IntersectionObserver' in win)) {
    for (const el of skels) el.classList.add('is-ready');
  } else {
    const io = new win.IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          hydrate(en.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    for (const el of skels) io.observe(el);
  }

  /* ---------- 5) entrada de títulos e blocos ao rolar ---------- */
  const reveals = $$(doc, '.reveal');
  if (reduce || !('IntersectionObserver' in win)) {
    for (const el of reveals) el.classList.add('in');
  } else {
    const rio = new win.IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            rio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    for (const el of reveals) rio.observe(el);
  }

  /* ---------- 6) barra fixa do celular: sai quando o CTA final já está na tela, volta depois ---------- */
  const sticky = doc.querySelector('.sticky');
  const finalCta = doc.querySelector('#contato');
  if (sticky && finalCta && 'IntersectionObserver' in win) {
    new win.IntersectionObserver(
      (entries) => {
        for (const en of entries) sticky.classList.toggle('is-hidden', en.isIntersecting);
      },
      { threshold: 0.35 }
    ).observe(finalCta);
  }

  /* ---------- 7) carregamento no clique do WhatsApp: botão ocupado + aviso para leitor de tela ---------- */
  const status = doc.getElementById('status');
  doc.addEventListener('click', (ev) => {
    const a = ev.target.closest ? ev.target.closest('a[data-cta]') : null;
    if (!a || a.classList.contains('is-loading')) return;
    a.classList.add('is-loading');
    a.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Abrindo o WhatsApp…';
    win.setTimeout(() => {
      a.classList.remove('is-loading');
      a.removeAttribute('aria-busy');
      if (status) status.textContent = '';
    }, 1500);
  });

  root.classList.add('motion-ok');
  return { reduce };
}
