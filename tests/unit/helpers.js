import { afterEach, beforeEach, vi } from 'vitest';

/** O jsdom reaproveita `document` entre os testes de um arquivo: remove os ouvintes que cada teste registrou. */
export function isolateGlobalListeners() {
  const added = [];
  let originalDoc;
  let originalWin;
  beforeEach(() => {
    originalDoc = document.addEventListener.bind(document);
    originalWin = window.addEventListener.bind(window);
    vi.spyOn(document, 'addEventListener').mockImplementation((...args) => {
      added.push(['document', args]);
      originalDoc(...args);
    });
    vi.spyOn(window, 'addEventListener').mockImplementation((...args) => {
      added.push(['window', args]);
      originalWin(...args);
    });
  });
  afterEach(() => {
    for (const [target, args] of added.splice(0))
      (target === 'document' ? document : window).removeEventListener(...args);
    vi.restoreAllMocks();
  });
}
