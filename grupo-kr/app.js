/* Grupo KR | site-vitrine
 * 1) animação de entrada das seções
 * 2) consentimento de cookies (LGPD) e carregamento do Pixel/GA4 SOMENTE depois do "Aceitar"
 *
 * Para ativar o rastreamento, preencha os IDs abaixo. Enquanto estiverem vazios,
 * o site não usa cookies, não carrega nenhum script de terceiros e não mostra o aviso.
 */
(function () {
  'use strict';

  var TRACKING = {
    metaPixelId: '', // ex.: '123456789012345'
    ga4Id: ''        // ex.: 'G-XXXXXXXXXX'
  };

  var d = document;
  d.documentElement.classList.add('js');

  /* ---------- 1) revelar seções ao rolar ---------- */
  function initReveal() {
    var els = d.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 2) consentimento ---------- */
  var KEY = 'kr_consent_v1';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // pedir de novo após 12 meses
  var hasTracking = !!(TRACKING.metaPixelId || TRACKING.ga4Id);
  var loaded = false;

  function readConsent() {
    try {
      var v = JSON.parse(window.localStorage.getItem(KEY));
      if (!v || !v.choice || !v.at) return null;
      if (Date.now() - new Date(v.at).getTime() > MAX_AGE_MS) return null;
      return v.choice;
    } catch (e) { return null; }
  }

  function saveConsent(choice) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: new Date().toISOString() }));
    } catch (e) { /* sem armazenamento: o aviso volta na próxima visita */ }
  }

  function loadMeta(id) {
    if (window.fbq) return;
    var n = window.fbq = function () {
      if (n.callMethod) { n.callMethod.apply(n, arguments); } else { n.queue.push(arguments); }
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    d.head.appendChild(s);
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function loadGA(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    d.head.appendChild(s);
    window.gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    window.gtag('config', id);
  }

  function loadTrackers() {
    if (loaded) return;
    loaded = true;
    if (TRACKING.metaPixelId) loadMeta(TRACKING.metaPixelId);
    if (TRACKING.ga4Id) loadGA(TRACKING.ga4Id);
  }

  function clearTrackingCookies() {
    var host = window.location.hostname;
    var parts = host.split('.');
    var domains = [host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    d.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_fbp|_fbc|_ga|_ga_.*|_gid|_gat.*)$/.test(name)) {
        domains.forEach(function (dom) {
          d.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + dom;
        });
        d.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
    });
  }

  /* eventos: clique em qualquer botão de WhatsApp (só dispara com consentimento) */
  function trackClicks() {
    d.addEventListener('click', function (ev) {
      if (!loaded) return;
      var a = ev.target.closest ? ev.target.closest('a[data-cta]') : null;
      if (!a) return;
      var cta = a.getAttribute('data-cta');
      if (window.fbq && TRACKING.metaPixelId) window.fbq('track', 'Contact', { content_name: cta });
      if (window.gtag && TRACKING.ga4Id) window.gtag('event', 'whatsapp_click', { cta: cta });
    });
  }

  var banner = null;

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function decide(choice) {
    var previous = readConsent();
    saveConsent(choice);
    closeBanner();
    if (choice === 'granted') {
      loadTrackers();
    } else if (previous === 'granted' || loaded) {
      clearTrackingCookies();
      window.location.reload();
    }
  }

  function openBanner() {
    if (banner) return;
    banner = d.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consent-title');

    var h = d.createElement('h2');
    h.id = 'consent-title';
    h.textContent = 'Cookies e privacidade';

    var p = d.createElement('p');
    p.appendChild(d.createTextNode('Usamos cookies de medição e anúncios para entender o que funciona e melhorar o site. Você escolhe se aceita. Saiba mais na '));
    var a = d.createElement('a');
    a.href = '/privacidade';
    a.textContent = 'Política de Privacidade';
    p.appendChild(a);
    p.appendChild(d.createTextNode('.'));

    var row = d.createElement('div');
    row.className = 'row';
    var deny = d.createElement('button');
    deny.type = 'button';
    deny.className = 'btn btn-deny';
    deny.textContent = 'Recusar';
    deny.addEventListener('click', function () { decide('denied'); });
    var ok = d.createElement('button');
    ok.type = 'button';
    ok.className = 'btn btn-gold';
    ok.textContent = 'Aceitar';
    ok.addEventListener('click', function () { decide('granted'); });
    row.appendChild(deny);
    row.appendChild(ok);

    banner.appendChild(h);
    banner.appendChild(p);
    banner.appendChild(row);
    d.body.appendChild(banner);
  }

  function initConsent() {
    if (!hasTracking) return; // sem Pixel/GA4: sem cookies, sem aviso
    var reopen = d.querySelectorAll('[data-open-consent]');
    reopen.forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', openBanner);
    });
    trackClicks();
    var c = readConsent();
    if (c === 'granted') { loadTrackers(); }
    else if (c !== 'denied') { openBanner(); }
  }

  function start() { initReveal(); initConsent(); }
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', start); } else { start(); }
})();
