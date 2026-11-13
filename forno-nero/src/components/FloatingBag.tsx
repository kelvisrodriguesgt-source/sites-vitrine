import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBRL } from '../lib/money';

/** Botão fixo do pedido, só no celular e só quando há itens. */
export function FloatingBag() {
  const { totals, openCart } = useCart();
  if (totals.count === 0) return null;
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir pedido, ${totals.count} ${totals.count === 1 ? 'item' : 'itens'}, ${formatBRL(totals.totalCents)}`}
      className="fade-up fixed inset-x-4 bottom-4 z-40 flex min-h-14 items-center justify-between rounded-full bg-red px-6 font-bold text-snow shadow-card sm:hidden"
    >
      <span className="flex items-center gap-2.5">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        Ver pedido ({totals.count})
      </span>
      <span>{formatBRL(totals.totalCents)}</span>
    </button>
  );
}
