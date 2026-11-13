/**
 * Camada de armazenamento do MODO DEMONSTRAÇÃO.
 * Site e painel conversam pelo localStorage do mesmo navegador. Em produção, estas funções
 * seriam trocadas por chamadas a uma API com banco de dados (veja o README).
 */
export const KEYS = {
  content: 'celeste_content_v1'
} as const;

/** Evento disparado na própria aba (o evento nativo "storage" só chega às outras abas). */
export const CHANGE_EVENT = 'celeste:storage';

function backend(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function notify(key: string): void {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = backend()?.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Retorna false quando o navegador recusa a gravação (cota cheia, modo privado). */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    const store = backend();
    if (!store) return false;
    store.setItem(key, JSON.stringify(value));
    notify(key);
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    backend()?.removeItem(key);
  } catch {
    /* sem acesso ao armazenamento: nada a remover */
  }
  notify(key);
}

/** Avisa quando qualquer uma das chaves muda (nesta aba ou em outra). Retorna a função de cancelamento. */
export function subscribe(keys: readonly string[], callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onNative = (e: StorageEvent) => {
    if (e.key === null || keys.includes(e.key)) callback();
  };
  const onCustom = (e: Event) => {
    const key = (e as CustomEvent<{ key: string }>).detail?.key;
    if (key === undefined || keys.includes(key)) callback();
  };
  window.addEventListener('storage', onNative);
  window.addEventListener(CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onNative);
    window.removeEventListener(CHANGE_EVENT, onCustom);
  };
}
