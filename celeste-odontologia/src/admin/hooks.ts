import { useCallback, useEffect, useState } from 'react';
import { defaultContent } from '../config/site';
import type { Content, ContentFile } from '../config/types';
import { customFiles, loadContent, resetAll, resetFile, saveFile } from '../shared/content';
import { KEYS, subscribe } from '../shared/storage';

export interface ContentAdmin {
  content: Content;
  custom: ContentFile[];
  /** false se o navegador recusar a gravação (armazenamento cheio). */
  save: <K extends ContentFile>(file: K, value: Content[K]) => boolean;
  reset: (file: ContentFile) => void;
  resetAll: () => void;
}

/** Conteúdo sempre atualizado: reage a mudanças desta aba e de outras. */
export function useContentAdmin(): ContentAdmin {
  const read = useCallback(() => ({ content: loadContent(defaultContent), custom: customFiles() }), []);
  const [state, setState] = useState(read);
  useEffect(() => subscribe([KEYS.content], () => setState(read())), [read]);
  return {
    ...state,
    save: (file, value) => saveFile(file, value),
    reset: (file) => {
      resetFile(file);
    },
    resetAll
  };
}

export function useHashRoute<T extends string>(routes: readonly T[], fallback: T): T {
  const parse = useCallback((): T => {
    const name = window.location.hash.replace(/^#\/?/, '');
    return (routes as readonly string[]).includes(name) ? (name as T) : fallback;
  }, [routes, fallback]);
  const [route, setRoute] = useState<T>(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, [parse]);
  return route;
}

/** Cópia editável de um valor, com aviso de "alterações não salvas". */
export function useDraft<T>(source: T): { draft: T; setDraft: (next: T | ((prev: T) => T)) => void; dirty: boolean; discard: () => void; markSaved: () => void } {
  const [draft, setDraftState] = useState<T>(source);
  const [baseline, setBaseline] = useState<string>(JSON.stringify(source));
  // Se o conteúdo mudar por fora (outra aba, restaurar), recomeça a partir dele, a menos que haja edição em andamento.
  const sourceJson = JSON.stringify(source);
  const dirty = JSON.stringify(draft) !== baseline;
  useEffect(() => {
    if (!dirty) {
      setDraftState(source);
      setBaseline(sourceJson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceJson]);
  return {
    draft,
    setDraft: setDraftState,
    dirty,
    discard: () => setDraftState(JSON.parse(baseline) as T),
    markSaved: () => setBaseline(JSON.stringify(draft))
  };
}
