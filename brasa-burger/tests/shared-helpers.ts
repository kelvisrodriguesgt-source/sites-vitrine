/** Simula localStorage e window no ambiente de teste (node). */
export function installBrowserShim(): { store: Map<string, string>; events: EventTarget } {
  const store = new Map<string, string>();
  const events = new EventTarget();
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k)
  };
  (globalThis as Record<string, unknown>).window = events;
  return { store, events };
}
