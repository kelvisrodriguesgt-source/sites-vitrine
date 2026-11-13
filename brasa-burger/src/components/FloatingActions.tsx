import { MessageCircle, ShoppingBag } from 'lucide-react';
import { site } from '../config/site';
import { useCart } from '../context/CartContext';
import { formatBRL } from '../lib/money';
import { buildWhatsAppUrl } from '../lib/whatsapp';

export function FloatingActions() {
  const { totals, openCart } = useCart();
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <a
        href={buildWhatsAppUrl(site.contact.whatsapp, site.contact.greeting)}
        target="_blank"
        rel="noopener"
        aria-label="Falar pelo WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-lg transition hover:scale-105 hover:bg-[#25be62] active:scale-95"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={openCart}
        aria-label={`Abrir pedido, ${totals.count} ${totals.count === 1 ? 'item' : 'itens'}`}
        className="flex h-14 items-center gap-2.5 rounded-full bg-mustard px-5 font-heading text-sm font-extrabold text-char shadow-lg transition hover:scale-105 hover:bg-[#ffb921] active:scale-95"
      >
        <span className="relative">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          {totals.count > 0 && (
            <span key={totals.count} className="pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[0.7rem] text-white">
              {totals.count}
            </span>
          )}
        </span>
        {totals.count > 0 ? <span>{formatBRL(totals.totalCents)}</span> : <span className="hidden sm:inline">PEDIDO</span>}
      </button>
    </div>
  );
}
