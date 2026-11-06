import { describe, expect, it } from 'vitest';
import {
  CONSENT_KEY,
  createConsentStore,
  isTrackingEnabled,
  MAX_AGE_MS,
  trackingCookieNames
} from '../../grupo-kr-motion/js/consent.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    data
  };
}

describe('createConsentStore', () => {
  it('guarda e lê a escolha', () => {
    const storage = memoryStorage();
    const store = createConsentStore({ storage, now: () => 1_000_000 });
    expect(store.read()).toBeNull();
    expect(store.save('granted')).toBe(true);
    expect(store.read()).toBe('granted');
    expect(JSON.parse(storage.data[CONSENT_KEY])).toEqual({ choice: 'granted', at: new Date(1_000_000).toISOString() });
  });

  it('a escolha vale por 12 meses e depois pede de novo', () => {
    const storage = memoryStorage();
    let t = 0;
    const store = createConsentStore({ storage, now: () => t });
    store.save('denied');
    t = MAX_AGE_MS;
    expect(store.read()).toBe('denied');
    t = MAX_AGE_MS + 1;
    expect(store.read()).toBeNull();
  });

  it('ignora JSON quebrado ou incompleto', () => {
    expect(createConsentStore({ storage: memoryStorage({ [CONSENT_KEY]: '{oops' }) }).read()).toBeNull();
    expect(createConsentStore({ storage: memoryStorage({ [CONSENT_KEY]: '{"choice":"granted"}' }) }).read()).toBeNull();
    expect(createConsentStore({ storage: memoryStorage({ [CONSENT_KEY]: '{"at":"2026-01-01"}' }) }).read()).toBeNull();
  });

  it('sem armazenamento disponível, não quebra e avisa que não salvou', () => {
    const storage = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      }
    };
    const store = createConsentStore({ storage });
    expect(store.read()).toBeNull();
    expect(store.save('granted')).toBe(false);
  });

  it('usa chave e prazo configuráveis', () => {
    const storage = memoryStorage();
    const store = createConsentStore({ storage, key: 'outra', maxAgeMs: 10, now: () => 0 });
    store.save('granted');
    expect('outra' in storage.data).toBe(true);
  });
});

describe('isTrackingEnabled', () => {
  it('só liga com algum ID preenchido', () => {
    expect(isTrackingEnabled({ metaPixelId: '', ga4Id: '' })).toBe(false);
    expect(isTrackingEnabled({ metaPixelId: '123', ga4Id: '' })).toBe(true);
    expect(isTrackingEnabled({ metaPixelId: '', ga4Id: 'G-X' })).toBe(true);
    expect(isTrackingEnabled(null)).toBe(false);
    expect(isTrackingEnabled(undefined)).toBe(false);
  });
});

describe('trackingCookieNames', () => {
  it('seleciona só cookies de medição e anúncios', () => {
    const names = trackingCookieNames('_fbp=1; sessao=2; _ga=3; _ga_ABC123=4; _gid=5; _gat_x=6; _fbc=7; outro=8');
    expect(names).toEqual(['_fbp', '_ga', '_ga_ABC123', '_gid', '_gat_x', '_fbc']);
  });
  it('não confunde nomes parecidos e aceita vazio', () => {
    expect(trackingCookieNames('meu_ga=1; _gaX=2; xfbp=3')).toEqual([]);
    expect(trackingCookieNames('')).toEqual([]);
    expect(trackingCookieNames(undefined)).toEqual([]);
  });
});
