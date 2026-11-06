// biome-ignore-all lint/suspicious/noDocumentCookie: o teste simula cookies de medição no navegador
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_KEY } from '../../grupo-kr-motion/js/consent.js';
import { initTracking } from '../../grupo-kr-motion/js/tracking.js';
import { isolateGlobalListeners } from './helpers.js';

const IDS = { metaPixelId: '111222333444555', ga4Id: 'G-TEST123456' };
const NONE = { metaPixelId: '', ga4Id: '' };

function setup({ tracking = IDS, search = '', needsConsent = false, reduce = false, stored = null } = {}) {
  document.head.innerHTML = '';
  document.body.innerHTML =
    '<a data-cta="hero" href="#">Chamar</a><button data-open-consent hidden>Gerenciar cookies</button>';
  localStorage.clear();
  if (stored) localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  window.history.pushState({}, '', `/${search}`);
  window.matchMedia = (q) => ({ matches: reduce && q.includes('reduce') });
  const onConsent = vi.fn();
  const api = initTracking({ win: window, doc: document, tracking, needsConsent, onConsent });
  return { api, onConsent };
}

isolateGlobalListeners();

const banner = () => document.querySelector('.consent');
const click = (sel) => document.querySelector(sel).click();

beforeEach(() => {
  vi.useFakeTimers();
  delete window.fbq;
  delete window._fbq;
  delete window.gtag;
  delete window.dataLayer;
});
afterEach(() => {
  vi.useRealTimers();
});

describe('sem Pixel/GA4 configurados', () => {
  it('não mostra aviso, não carrega nada e não grava consentimento', () => {
    const { api, onConsent } = setup({ tracking: NONE });
    expect(api.init()).toEqual({ consent: false });
    expect(banner()).toBeNull();
    expect(document.querySelector('[data-open-consent]').hidden).toBe(true);
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
    expect(onConsent).not.toHaveBeenCalled();
  });

  it('?motion-demo abre o aviso só para análise, sem carregar nada', () => {
    const { api } = setup({ tracking: NONE, search: '?motion-demo' });
    api.init();
    expect(banner()).not.toBeNull();
    click('.consent .btn-deny');
    vi.advanceTimersByTime(300);
    expect(banner()).toBeNull();
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
  });

  it('com endpoint de observabilidade, o aviso passa a existir', () => {
    const { api } = setup({ tracking: NONE, needsConsent: true });
    api.init();
    expect(banner()).not.toBeNull();
  });
});

describe('com Pixel/GA4 configurados', () => {
  it('mostra o aviso na primeira visita, sem carregar nenhum script de terceiros', () => {
    const { api } = setup();
    api.init();
    expect(banner()).not.toBeNull();
    expect(banner().querySelector('h2').textContent).toBe('Cookies e privacidade');
    expect(banner().querySelectorAll('button')).toHaveLength(2);
    expect(banner().querySelector('a').getAttribute('href')).toBe('/privacidade');
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
    expect(window.fbq).toBeUndefined();
    expect(document.querySelector('[data-open-consent]').hidden).toBe(false);
  });

  it('Aceitar: salva, carrega Meta e GA, avisa a observabilidade e anima a saída do aviso', () => {
    const { api, onConsent } = setup();
    api.init();
    click('.consent .btn-gold');
    expect(banner().classList.contains('is-leaving')).toBe(true);
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)).choice).toBe('granted');
    const srcs = [...document.head.querySelectorAll('script')].map((s) => s.src);
    expect(srcs.some((s) => s.startsWith('https://connect.facebook.net/'))).toBe(true);
    expect(srcs.some((s) => s.includes('googletagmanager.com/gtag/js?id=G-TEST123456'))).toBe(true);
    expect(typeof window.fbq).toBe('function');
    expect(onConsent).toHaveBeenCalledWith(true);
    vi.advanceTimersByTime(300);
    expect(banner()).toBeNull();
  });

  it('Recusar: salva "denied", nada é carregado e o aviso sai', () => {
    const { api, onConsent } = setup();
    api.init();
    click('.consent .btn-deny');
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)).choice).toBe('denied');
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
    expect(onConsent).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(banner()).toBeNull();
  });

  it('visita seguinte com "granted": carrega direto, sem aviso', () => {
    const { api, onConsent } = setup({ stored: { choice: 'granted', at: new Date().toISOString() } });
    expect(api.init()).toEqual({ consent: true });
    expect(banner()).toBeNull();
    expect(onConsent).toHaveBeenCalledWith(true);
    expect(document.head.querySelectorAll('script').length).toBeGreaterThan(0);
  });

  it('visita seguinte com "denied": não pergunta de novo e não carrega', () => {
    const { api } = setup({ stored: { choice: 'denied', at: new Date().toISOString() } });
    api.init();
    expect(banner()).toBeNull();
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
  });

  it('consentimento antigo (mais de 12 meses) pergunta de novo', () => {
    const old = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    const { api } = setup({ stored: { choice: 'granted', at: old } });
    api.init();
    expect(banner()).not.toBeNull();
    expect(document.head.querySelectorAll('script')).toHaveLength(0);
  });

  it('"Gerenciar cookies" reabre o aviso (e não duplica)', () => {
    const { api } = setup({ stored: { choice: 'denied', at: new Date().toISOString() } });
    api.init();
    click('[data-open-consent]');
    click('[data-open-consent]');
    expect(document.querySelectorAll('.consent')).toHaveLength(1);
  });

  it('com menos movimento, o aviso sai na hora, sem animação de saída', () => {
    const { api } = setup({ reduce: true });
    api.init();
    click('.consent .btn-deny');
    expect(banner()).toBeNull();
  });

  it('clique em botão de WhatsApp só é medido depois do consentimento', () => {
    const { api } = setup({ stored: { choice: 'granted', at: new Date().toISOString() } });
    api.init();
    window.fbq = vi.fn();
    window.gtag = vi.fn();
    click('a[data-cta]');
    expect(window.fbq).toHaveBeenCalledWith('track', 'Contact', { content_name: 'hero' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'whatsapp_click', { cta: 'hero' });
  });

  it('sem consentimento, o clique não é medido', () => {
    const { api } = setup();
    api.init();
    window.fbq = vi.fn();
    click('a[data-cta]');
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('revogar depois de aceitar apaga os cookies de medição', () => {
    const { api } = setup({ stored: { choice: 'granted', at: new Date().toISOString() } });
    api.init();
    document.cookie = '_fbp=abc; path=/';
    document.cookie = '_ga=xyz; path=/';
    document.cookie = 'sessao=ok; path=/';
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, hostname: 'localhost', search: '', reload }
    });
    api.openBanner();
    click('.consent .btn-deny');
    expect(document.cookie).not.toContain('_fbp');
    expect(document.cookie).not.toContain('_ga=');
    expect(document.cookie).toContain('sessao=ok');
    expect(reload).toHaveBeenCalled();
  });
});
