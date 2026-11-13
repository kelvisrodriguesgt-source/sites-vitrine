import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { buildSite, defaultContent, site as defaultSite } from '../config/site';
import type { SiteConfig } from '../config/types';
import { customFiles, loadContent } from '../shared/content';
import { KEYS, subscribe } from '../shared/storage';

const SiteContext = createContext<SiteConfig>(defaultSite);

/**
 * Entrega a configuração do site. Começa com o conteúdo padrão (igual ao HTML gerado no build, sem divergência na hidratação)
 * e, no navegador, aplica por cima o que o painel /admin salvou. Muda ao vivo quando o painel salva (inclusive em outra aba).
 */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteConfig>(defaultSite);
  useEffect(() => {
    const apply = () => setSite(customFiles().length ? buildSite(loadContent(defaultContent)) : defaultSite);
    apply();
    return subscribe([KEYS.content], apply);
  }, []);
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export const useSite = (): SiteConfig => useContext(SiteContext);
