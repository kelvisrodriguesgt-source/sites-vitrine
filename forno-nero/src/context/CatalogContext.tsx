import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { site } from '../config/site';
import type { Product } from '../config/types';
import { isAvailable, loadCatalog } from '../shared/catalog';
import { KEYS, subscribe } from '../shared/storage';

interface CatalogApi {
  /** Todos os produtos (inclusive indisponíveis, que aparecem marcados no cardápio). */
  products: Product[];
  /** Só os que podem entrar no pedido. */
  sellable: Product[];
  /** false até o navegador ler o catálogo salvo pelo painel (a primeira renderização usa o padrão, igual ao HTML pré-renderizado). */
  ready: boolean;
}

const CatalogContext = createContext<CatalogApi | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(site.products);
  const [ready, setReady] = useState(false);

  // Aplica o catálogo editado no painel só depois da hidratação e acompanha mudanças feitas em outra aba.
  useEffect(() => {
    const apply = () => setProducts(loadCatalog(site.products, site.categories));
    apply();
    setReady(true);
    return subscribe([KEYS.catalog], apply);
  }, []);

  const value = useMemo<CatalogApi>(
    () => ({ products, sellable: products.filter(isAvailable), ready }),
    [products, ready]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogApi {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>');
  return ctx;
}
