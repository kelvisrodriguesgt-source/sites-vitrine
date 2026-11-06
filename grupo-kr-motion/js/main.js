import { OBSERVABILITY, TRACKING } from './config.js';
import { createObservability } from './observability.js';
import { initMotion } from './motion.js';
import { initTracking } from './tracking.js';

initMotion({ win: window, doc: document });

let obs = null;
function startObservability(consentGranted) {
  obs = createObservability({
    config: OBSERVABILITY,
    consentGranted,
    send: (url, body) => navigator.sendBeacon && navigator.sendBeacon(url, body),
    win: window
  });
  obs.start();
}

const tracking = initTracking({
  win: window,
  doc: document,
  tracking: TRACKING,
  needsConsent: Boolean(OBSERVABILITY.endpoint),
  onConsent: (granted) => startObservability(granted)
});
tracking.init();
