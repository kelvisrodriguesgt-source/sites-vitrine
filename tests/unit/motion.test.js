import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initMotion } from '../../grupo-kr-motion/js/motion.js';
import { isolateGlobalListeners } from './helpers.js';

const HTML = `
<div class="load-bar"><i></i></div>
<div class="scroll-bar"><i></i></div>
<p id="status" role="status"></p>
<img data-lazy src="/x.png" alt="">
<article class="card" data-skel="card"><h3>Título</h3></article>
<h2 class="reveal">Título</h2>
<div class="sticky"></div>
<section id="contato"></section>
<a data-cta="hero" href="#">Chamar</a>`;

isolateGlobalListeners();

let observers;
class FakeIO {
  constructor(cb, opts) {
    this.cb = cb;
    this.opts = opts;
    this.targets = [];
    this.unobserved = [];
    observers.push(this);
  }
  observe(el) {
    this.targets.push(el);
  }
  unobserve(el) {
    this.unobserved.push(el);
  }
  fire(el, isIntersecting = true) {
    this.cb([{ target: el, isIntersecting }]);
  }
}

function setup({ reduce = false, io = true, readyState = 'complete' } = {}) {
  document.body.innerHTML = HTML;
  document.documentElement.className = 'js';
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => readyState });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
  const win = {
    matchMedia: (q) => ({ matches: reduce && q.includes('reduce') }),
    CSS: { supports: () => false },
    requestAnimationFrame: (fn) => fn(),
    addEventListener: (...a) => window.addEventListener(...a),
    setTimeout: (...a) => setTimeout(...a)
  };
  if (io) win.IntersectionObserver = FakeIO;
  const img = document.querySelector('img');
  Object.defineProperty(img, 'complete', { configurable: true, value: true });
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 10 });
  return { win, result: initMotion({ win, doc: document }) };
}

const flush = () => vi.advanceTimersByTimeAsync(400);

beforeEach(() => {
  observers = [];
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('initMotion', () => {
  it('confirma que o movimento iniciou (desarma o plano B do CSS)', () => {
    setup();
    expect(document.documentElement.classList.contains('motion-ok')).toBe(true);
  });

  it('progresso de carregamento chega a 100% e a barra sai; a de rolagem ativa', async () => {
    setup();
    await flush();
    expect(document.querySelector('.load-bar i').parentElement.classList.contains('is-done')).toBe(true);
    expect(document.querySelector('.load-bar').style.getPropertyValue('--p')).toBe('1');
    expect(document.querySelector('.scroll-bar').classList.contains('is-active')).toBe(true);
    expect(document.documentElement.classList.contains('is-loaded')).toBe(true);
  });

  it('enquanto a página carrega, mostra o marco parcial e conclui no evento load', async () => {
    setup({ readyState: 'loading' });
    await flush();
    expect(document.querySelector('.load-bar').style.getPropertyValue('--p')).toBe('0.8');
    window.dispatchEvent(new Event('load'));
    await flush();
    expect(document.querySelector('.load-bar').style.getPropertyValue('--p')).toBe('1');
  });

  it('skeleton só vira conteúdo quando o bloco entra na tela', async () => {
    setup();
    const card = document.querySelector('.card');
    const io = observers.find((o) => o.targets.includes(card));
    expect(io.opts.rootMargin).toBe('0px 0px -10% 0px');
    expect(card.classList.contains('is-ready')).toBe(false);
    io.fire(card, false);
    await flush();
    expect(card.classList.contains('is-ready')).toBe(false);
    io.fire(card, true);
    await flush();
    expect(card.classList.contains('is-ready')).toBe(true);
    expect(io.unobserved).toContain(card);
  });

  it('imagem sai do skeleton ao carregar', async () => {
    setup();
    await flush();
    expect(document.querySelector('img').classList.contains('is-loaded')).toBe(true);
  });

  it('imagem que ainda não carregou espera o evento load', async () => {
    document.body.innerHTML = HTML;
    const img = document.querySelector('img');
    Object.defineProperty(img, 'complete', { configurable: true, value: false });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'complete' });
    initMotion({
      win: {
        matchMedia: () => ({ matches: false }),
        CSS: { supports: () => false },
        IntersectionObserver: FakeIO,
        requestAnimationFrame: (fn) => fn(),
        addEventListener: () => {},
        setTimeout: (...a) => setTimeout(...a)
      },
      doc: document
    });
    await flush();
    expect(img.classList.contains('is-loaded')).toBe(false);
    img.dispatchEvent(new Event('load'));
    await flush();
    expect(img.classList.contains('is-loaded')).toBe(true);
  });

  it('títulos entram ao rolar', () => {
    setup();
    const h2 = document.querySelector('.reveal');
    const io = observers.find((o) => o.targets.includes(h2));
    io.fire(h2, true);
    expect(h2.classList.contains('in')).toBe(true);
  });

  it('barra fixa do celular some quando o CTA final aparece e volta depois', () => {
    setup();
    const cta = document.querySelector('#contato');
    const sticky = document.querySelector('.sticky');
    const io = observers.find((o) => o.targets.includes(cta));
    io.fire(cta, true);
    expect(sticky.classList.contains('is-hidden')).toBe(true);
    io.fire(cta, false);
    expect(sticky.classList.contains('is-hidden')).toBe(false);
  });

  it('clique no WhatsApp: botão fica ocupado, avisa leitor de tela e volta ao normal', async () => {
    setup();
    const a = document.querySelector('a[data-cta]');
    a.click();
    expect(a.classList.contains('is-loading')).toBe(true);
    expect(a.getAttribute('aria-busy')).toBe('true');
    expect(document.getElementById('status').textContent).toBe('Abrindo o WhatsApp…');
    a.click(); // clique duplo não empilha
    await vi.advanceTimersByTimeAsync(1600);
    expect(a.classList.contains('is-loading')).toBe(false);
    expect(a.hasAttribute('aria-busy')).toBe(false);
    expect(document.getElementById('status').textContent).toBe('');
  });

  it('barra de rolagem (plano B em JS) acompanha a rolagem', () => {
    setup();
    const root = document.documentElement;
    Object.defineProperty(root, 'scrollHeight', { configurable: true, value: 2000 });
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: 1000 });
    root.scrollTop = 500;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.scroll-bar').style.getPropertyValue('--p')).toBe('0.5');
  });

  it('com animação de rolagem nativa, não registra o plano B', () => {
    document.body.innerHTML = HTML;
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'complete' });
    const add = vi.fn();
    initMotion({
      win: {
        matchMedia: () => ({ matches: false }),
        CSS: { supports: () => true },
        IntersectionObserver: FakeIO,
        requestAnimationFrame: (fn) => fn(),
        addEventListener: add,
        setTimeout: (...a) => setTimeout(...a)
      },
      doc: document
    });
    expect(add.mock.calls.some((c) => c[0] === 'scroll')).toBe(false);
  });

  it('menos movimento: tudo já vem pronto, sem skeleton e sem esperar rolagem', () => {
    const { result } = setup({ reduce: true });
    expect(result.reduce).toBe(true);
    expect(document.querySelector('.card').classList.contains('is-ready')).toBe(true);
    expect(document.querySelector('.reveal').classList.contains('in')).toBe(true);
    expect(document.querySelector('img').classList.contains('is-loaded')).toBe(true);
  });

  it('navegador sem IntersectionObserver: mostra tudo pronto', () => {
    setup({ io: false });
    expect(document.querySelector('.card').classList.contains('is-ready')).toBe(true);
    expect(document.querySelector('.reveal').classList.contains('in')).toBe(true);
  });
});
