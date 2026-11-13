import { useCallback, useEffect, useState } from 'react';
import { site } from '../config/site';
import type { Product } from '../config/types';
import { hasCustomCatalog, loadCatalog, resetCatalog, saveCatalog } from '../shared/catalog';
import type { Order } from '../shared/orders';
import { loadOrders } from '../shared/ordersStore';
import { KEYS, subscribe } from '../shared/storage';

/** Pedidos sempre atualizados: reage a mudanças desta aba e de outras (ex.: pedido feito no site). */
export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  useEffect(() => subscribe([KEYS.orders], () => setOrders(loadOrders())), []);
  return orders;
}

export interface CatalogAdmin {
  products: Product[];
  custom: boolean;
  /** Retorna false se o navegador recusar a gravação (armazenamento cheio). */
  save: (next: Product[]) => boolean;
  restore: () => void;
}

export function useCatalogAdmin(): CatalogAdmin {
  const read = useCallback(() => ({ products: loadCatalog(site.products, site.categories), custom: hasCustomCatalog() }), []);
  const [state, setState] = useState(read);
  useEffect(() => subscribe([KEYS.catalog], () => setState(read())), [read]);
  const save = useCallback((next: Product[]) => saveCatalog(next), []);
  const restore = useCallback(() => resetCatalog(), []);
  return { ...state, save, restore };
}

/** Relógio que atualiza a cada `ms` (textos como "há 4 min"). */
export function useNow(ms = 30_000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
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
