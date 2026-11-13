import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Toast() {
  const { toast, openCart } = useCart();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[45] flex justify-center px-4 sm:bottom-6" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="toast-in pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-card px-5 py-3 text-sm text-snow shadow-card">
          <Check className="h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
          <span>{toast.text}</span>
          <button type="button" onClick={openCart} className="font-extrabold uppercase text-ember underline-offset-4 hover:underline">
            Ver pedido
          </button>
        </div>
      )}
    </div>
  );
}
