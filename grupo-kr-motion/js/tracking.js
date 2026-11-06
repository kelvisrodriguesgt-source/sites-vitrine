/* Aviso de cookies e carregamento do Pixel/GA4 SOMENTE depois do "Aceitar". */
import { createConsentStore, isTrackingEnabled, trackingCookieNames } from './consent.js';
import { prefersReducedMotion } from './lib.js';

const EXIT_MS = 200;

export function initTracking({ win, doc, tracking, needsConsent, onConsent }) {
  const store = createConsentStore({ storage: safeStorage(win) });
  const hasTracking = isTrackingEnabled(tracking) || Boolean(needsConsent);
  const demo = new URLSearchParams(win.location.search).has('motion-demo');
  let loaded = false;
  let banner = null;

  function safeStorage(w) {
    try {
      return w.localStorage;
    } catch {
      return {
        getItem: () => null,
        setItem: () => {
          throw new Error('sem storage');
        }
      };
    }
  }

  function loadMeta(id) {
    if (win.fbq) return;
    // biome-ignore-start lint/complexity/noArguments: o snippet oficial do Meta Pixel depende do objeto arguments
    const n = function () {
      if (n.callMethod) n.callMethod.apply(n, arguments);
      else n.queue.push(arguments);
    };
    // biome-ignore-end lint/complexity/noArguments: fim do trecho do snippet do Meta Pixel
    win.fbq = n;
    if (!win._fbq) win._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const s = doc.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    doc.head.appendChild(s);
    win.fbq('init', id);
    win.fbq('track', 'PageView');
  }

  function loadGA(id) {
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () {
      // biome-ignore lint/complexity/noArguments: o gtag.js só reconhece o objeto arguments no dataLayer
      win.dataLayer.push(arguments);
    };
    win.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    win.gtag('js', new Date());
    const s = doc.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    doc.head.appendChild(s);
    win.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    win.gtag('config', id);
  }

  function loadTrackers() {
    if (loaded) return;
    loaded = true;
    if (tracking.metaPixelId) loadMeta(tracking.metaPixelId);
    if (tracking.ga4Id) loadGA(tracking.ga4Id);
  }

  function clearTrackingCookies() {
    const host = win.location.hostname;
    const parts = host.split('.');
    const domains = [host, `.${host}`];
    if (parts.length > 2) domains.push(`.${parts.slice(-2).join('.')}`);
    trackingCookieNames(doc.cookie).forEach((name) => {
      domains.forEach((dom) => {
        doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${dom}`;
      });
      doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }

  function trackClicks() {
    doc.addEventListener('click', (ev) => {
      if (!loaded) return;
      const a = ev.target.closest ? ev.target.closest('a[data-cta]') : null;
      if (!a) return;
      const cta = a.getAttribute('data-cta');
      if (win.fbq && tracking.metaPixelId) win.fbq('track', 'Contact', { content_name: cta });
      if (win.gtag && tracking.ga4Id) win.gtag('event', 'whatsapp_click', { cta });
    });
  }

  /* saída animada do aviso: 200ms, easing de saída; sem movimento remove na hora */
  function closeBanner() {
    const el = banner;
    banner = null;
    if (!el) return;
    if (prefersReducedMotion(win)) {
      el.remove();
      return;
    }
    el.classList.add('is-leaving');
    el.setAttribute('aria-hidden', 'true');
    win.setTimeout(() => el.remove(), EXIT_MS + 40);
  }

  function decide(choice) {
    const previous = store.read();
    if (hasTracking) store.save(choice); // no modo ?motion-demo (sem IDs) nada é gravado
    closeBanner();
    if (choice === 'granted') {
      loadTrackers();
      onConsent?.(true);
    } else if (previous === 'granted' || loaded) {
      clearTrackingCookies();
      win.location.reload();
    }
  }

  function openBanner() {
    if (banner) return;
    banner = doc.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');

    const h = doc.createElement('h2');
    h.id = 'consent-title';
    h.textContent = 'Cookies e privacidade';

    const p = doc.createElement('p');
    p.appendChild(
      doc.createTextNode(
        'Usamos cookies de medição e anúncios para entender o que funciona e melhorar o site. Você escolhe se aceita. Saiba mais na '
      )
    );
    const a = doc.createElement('a');
    a.href = '/privacidade';
    a.textContent = 'Política de Privacidade';
    p.appendChild(a);
    p.appendChild(doc.createTextNode('.'));

    const row = doc.createElement('div');
    row.className = 'row';
    const deny = doc.createElement('button');
    deny.type = 'button';
    deny.className = 'btn btn-deny';
    deny.textContent = 'Recusar';
    deny.addEventListener('click', () => decide('denied'));
    const ok = doc.createElement('button');
    ok.type = 'button';
    ok.className = 'btn btn-gold';
    ok.textContent = 'Aceitar';
    ok.addEventListener('click', () => decide('granted'));
    row.append(deny, ok);

    banner.append(h, p, row);
    doc.body.appendChild(banner);
  }

  function init() {
    if (demo) openBanner(); // ?motion-demo: só para analisar a animação do aviso, não grava nada
    if (!hasTracking) return { consent: false };
    doc.querySelectorAll('[data-open-consent]').forEach((b) => {
      b.hidden = false;
      b.addEventListener('click', openBanner);
    });
    trackClicks();
    const c = store.read();
    if (c === 'granted') {
      loadTrackers();
      onConsent?.(true);
    } else if (c !== 'denied' && !demo) {
      openBanner();
    }
    return { consent: c === 'granted' };
  }

  return { init, openBanner, store };
}
