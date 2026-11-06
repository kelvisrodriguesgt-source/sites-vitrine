import { describe, expect, it, vi } from 'vitest';
import { buildEvent, createObservability, shouldSample } from '../../grupo-kr-motion/js/observability.js';

describe('buildEvent', () => {
  it('guarda só o caminho, sem query string nem hash (sem dados pessoais)', () => {
    const e = buildEvent(
      'error',
      { message: 'x' },
      { href: 'https://site.com/privacidade?email=a@b.com#topo', now: 5 }
    );
    expect(e).toEqual({ type: 'error', path: '/privacidade', t: 5, message: 'x' });
    expect(JSON.stringify(e)).not.toContain('a@b.com');
  });
  it('endereço inválido vira caminho vazio', () => {
    expect(buildEvent('x', {}, { href: 'http://[', now: 1 }).path).toBe('');
  });
});

describe('shouldSample', () => {
  it('respeita a taxa', () => {
    expect(shouldSample(1, () => 0.99)).toBe(true);
    expect(shouldSample(0.5, () => 0.49)).toBe(true);
    expect(shouldSample(0.5, () => 0.5)).toBe(false);
    expect(shouldSample(0, () => 0)).toBe(false);
    expect(shouldSample(-1, () => 0)).toBe(false);
    expect(shouldSample(undefined, () => 0)).toBe(false);
  });
});

function fakeWin() {
  const listeners = {};
  const observers = [];
  class PO {
    constructor(cb) {
      this.cb = cb;
      observers.push(this);
    }
    observe(opts) {
      this.opts = opts;
    }
  }
  return {
    location: { href: 'https://site.com/?q=1' },
    addEventListener: (n, fn) => {
      listeners[n] = fn;
    },
    PerformanceObserver: PO,
    listeners,
    observers
  };
}

describe('createObservability', () => {
  const config = { endpoint: 'https://coletor.example/ingest', sampleRate: 1 };

  it('não faz nada sem consentimento', () => {
    const send = vi.fn();
    const win = fakeWin();
    const obs = createObservability({ config, consentGranted: false, send, win });
    expect(obs.enabled).toBe(false);
    expect(obs.start()).toBe(false);
    expect(obs.report('error', {})).toBe(false);
    expect(send).not.toHaveBeenCalled();
    expect(win.listeners.error).toBeUndefined();
  });

  it('não faz nada sem endpoint, mesmo com consentimento', () => {
    const send = vi.fn();
    const obs = createObservability({ config: { endpoint: '' }, consentGranted: true, send, win: fakeWin() });
    expect(obs.enabled).toBe(false);
    expect(obs.start()).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it('consentimento precisa ser exatamente true', () => {
    const obs = createObservability({ config, consentGranted: 'granted', send: vi.fn(), win: fakeWin() });
    expect(obs.enabled).toBe(false);
  });

  it('com tudo certo, envia erros e Web Vitals para o endpoint', () => {
    const send = vi.fn();
    const win = fakeWin();
    const obs = createObservability({ config, consentGranted: true, send, win });
    expect(obs.start()).toBe(true);
    expect(obs.start()).toBe(false); // só inicia uma vez

    win.listeners.error({ message: 'falhou'.repeat(100) });
    win.listeners.unhandledrejection();
    expect(send).toHaveBeenCalledTimes(2);
    const first = JSON.parse(send.mock.calls[0][1]);
    expect(send.mock.calls[0][0]).toBe(config.endpoint);
    expect(first.type).toBe('error');
    expect(first.path).toBe('/');
    expect(first.message.length).toBe(200);
    expect(JSON.parse(send.mock.calls[1][1]).message).toBe('unhandledrejection');

    const [lcp, cls] = win.observers;
    expect(lcp.opts).toEqual({ type: 'largest-contentful-paint', buffered: true });
    expect(cls.opts).toEqual({ type: 'layout-shift', buffered: true });
    lcp.cb({ getEntries: () => [{ startTime: 1234.6 }] });
    cls.cb({
      getEntries: () => [
        { value: 0.123456, hadRecentInput: false },
        { value: 9, hadRecentInput: true }
      ]
    });
    const vitals = send.mock.calls.slice(2).map((c) => JSON.parse(c[1]));
    expect(vitals).toHaveLength(2);
    expect(vitals[0]).toMatchObject({ type: 'web-vital', name: 'LCP', value: 1235 });
    expect(vitals[1]).toMatchObject({ type: 'web-vital', name: 'CLS', value: 0.1235 });
  });

  it('com taxa de amostragem 0, não inicia', () => {
    const obs = createObservability({
      config: { ...config, sampleRate: 0 },
      consentGranted: true,
      send: vi.fn(),
      win: fakeWin()
    });
    expect(obs.start()).toBe(false);
  });

  it('segue funcionando em navegador sem PerformanceObserver', () => {
    const win = fakeWin();
    delete win.PerformanceObserver;
    const obs = createObservability({ config, consentGranted: true, send: vi.fn(), win });
    expect(obs.start()).toBe(true);
  });

  it('tipo de métrica sem suporte não derruba o início', () => {
    const win = fakeWin();
    win.PerformanceObserver = class {
      observe() {
        throw new Error('tipo não suportado');
      }
    };
    const obs = createObservability({ config, consentGranted: true, send: vi.fn(), win });
    expect(obs.start()).toBe(true);
  });
});
