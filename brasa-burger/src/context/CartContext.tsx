import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS } from '../shared/storage';
import { useCatalog } from './CatalogContext';
import { addItem, buildLines, type CartItems, type CartLine, type CartTotals, removeItem, sanitizeItems, setQty, totals } from '../lib/cart';

const STORAGE_KEY = KEYS.cart;

interface CartApi {
  items: CartItems;
  lines: CartLine[];
  totals: CartTotals;
  open: boolean;
  toast: { id: number; text: string } | null;
  add: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItems>({});
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<CartApi['toast']>(null);
  const { sellable, ready } = useCatalog();
  const [loaded, setLoaded] = useState(false);

  // Carrega o carrinho salvo só depois da hidratação (evita divergência com o HTML pré-renderizado).
  // Espera o catálogo (que pode ter sido editado no painel) para descartar itens removidos ou indisponíveis.
  useEffect(() => {
    if (!ready) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(sanitizeItems(JSON.parse(raw), sellable));
    } catch {
      /* armazenamento indisponível: segue sem persistência */
    }
    setLoaded(true);
    // Só na primeira leitura; mudanças posteriores no catálogo são tratadas pelo efeito abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Produto removido ou marcado como indisponível no painel sai do pedido em andamento.
  useEffect(() => {
    if (!loaded) return;
    setItems((prev) => {
      const next = sanitizeItems(prev, sellable);
      const same = Object.keys(prev).length === Object.keys(next).length && Object.entries(next).every(([id, q]) => prev[id] === q);
      return same ? prev : next;
    });
  }, [sellable, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignora */
    }
  }, [items, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const lines = useMemo(() => buildLines(items, sellable), [items, sellable]);
  const sums = useMemo(() => totals(lines), [lines]);

  const add = useCallback((id: string) => {
    setItems((prev) => addItem(prev, id));
    const product = sellable.find((p) => p.id === id);
    if (product) setToast({ id: Date.now(), text: `${product.name} adicionado ao pedido` });
  }, [sellable]);
  const inc = useCallback((id: string) => setItems((prev) => addItem(prev, id)), []);
  const dec = useCallback((id: string) => setItems((prev) => setQty(prev, id, (prev[id] ?? 0) - 1)), []);
  const remove = useCallback((id: string) => setItems((prev) => removeItem(prev, id)), []);
  const clear = useCallback(() => setItems({}), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo<CartApi>(
    () => ({ items, lines, totals: sums, open, toast, add, inc, dec, remove, clear, openCart, closeCart }),
    [items, lines, sums, open, toast, add, inc, dec, remove, clear, openCart, closeCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
