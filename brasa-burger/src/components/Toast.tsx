import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Toast() {
  const { toast, openCart } = useCart();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[45] flex justify-center px-4 sm:bottom-6" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="toast-in pointer-events-auto flex items-center gap-3 rounded-md bg-char px-4 py-3 text-sm text-white shadow-xl ring-1 ring-white/15">
          <Check className="h-4 w-4 shrink-0 text-mustard" aria-hidden="true" />
          <span>{toast.text}</span>
          <button type="button" onClick={openCart} className="font-heading font-extrabold uppercase text-mustard underline-offset-4 hover:underline">
            Ver pedido
          </button>
        </div>
      )}
    </div>
  );
}
