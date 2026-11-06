/* Regras de consentimento (LGPD), sem DOM: testáveis. */

export const CONSENT_KEY = 'kr_consent_v1';
export const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // pedir de novo após 12 meses
export const TRACKING_COOKIE_RE = /^(_fbp|_fbc|_ga|_ga_.*|_gid|_gat.*)$/;

export function createConsentStore({ storage, now = () => Date.now(), key = CONSENT_KEY, maxAgeMs = MAX_AGE_MS } = {}) {
  function read() {
    try {
      const v = JSON.parse(storage.getItem(key));
      if (!v?.choice || !v.at) return null;
      if (now() - new Date(v.at).getTime() > maxAgeMs) return null;
      return v.choice;
    } catch {
      return null;
    }
  }
  function save(choice) {
    try {
      storage.setItem(key, JSON.stringify({ choice, at: new Date(now()).toISOString() }));
      return true;
    } catch {
      return false; // sem armazenamento: o aviso volta na próxima visita
    }
  }
  return { read, save };
}

export function isTrackingEnabled(cfg) {
  return Boolean(cfg && (cfg.metaPixelId || cfg.ga4Id));
}

/** Nomes de cookies de medição que devem ser apagados ao revogar. */
export function trackingCookieNames(cookieString) {
  return String(cookieString || '')
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => TRACKING_COOKIE_RE.test(name));
}
