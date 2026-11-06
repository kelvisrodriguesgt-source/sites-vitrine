/* Observabilidade mínima, própria e com consentimento.
 *
 * Coleta erros de JavaScript e Web Vitals (LCP, CLS, INP aproximado) e envia por sendBeacon
 * para OBSERVABILITY.endpoint. Só liga se (1) houver endpoint e (2) a pessoa aceitou os cookies.
 * Para Sentry, Datadog RUM, New Relic ou OpenTelemetry: aponte o endpoint para o coletor/proxy deles
 * ou chame `report()` de dentro do SDK escolhido. Nenhum SDK de terceiro é carregado aqui. */

export function buildEvent(type, data, { href = '', now = Date.now() } = {}) {
  let path = '';
  try {
    path = new URL(href, 'https://x.invalid').pathname; // sem query string nem dados pessoais
  } catch {
    path = '';
  }
  return { type, path, t: now, ...data };
}

export function shouldSample(rate, rand = Math.random) {
  if (!(rate > 0)) return false;
  return rand() < rate;
}

export function createObservability({ config, consentGranted, send, win }) {
  const enabled = Boolean(config && config.endpoint) && consentGranted === true;
  let started = false;

  function report(type, data) {
    if (!enabled) return false;
    send(config.endpoint, JSON.stringify(buildEvent(type, data, { href: win.location.href })));
    return true;
  }

  function start() {
    if (!enabled || started || !shouldSample(config.sampleRate)) return false;
    started = true;
    win.addEventListener('error', (e) => report('error', { message: String(e.message || '').slice(0, 200) }));
    win.addEventListener('unhandledrejection', () => report('error', { message: 'unhandledrejection' }));
    if ('PerformanceObserver' in win) {
      const watch = (entryType, handle) => {
        try {
          new win.PerformanceObserver((list) => list.getEntries().forEach(handle)).observe({ type: entryType, buffered: true });
        } catch {
          /* navegador sem suporte a esse tipo */
        }
      };
      watch('largest-contentful-paint', (e) => report('web-vital', { name: 'LCP', value: Math.round(e.startTime) }));
      watch('layout-shift', (e) => {
        if (!e.hadRecentInput) report('web-vital', { name: 'CLS', value: Number(e.value.toFixed(4)) });
      });
    }
    return true;
  }

  return { enabled, start, report };
}
