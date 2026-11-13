import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useScrolled } from '../hooks/useScrolled';
import { Logo } from './Logo';

const LINKS = [
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#promocoes', label: 'Promoções' },
  { href: '#avaliacoes', label: 'Avaliações' },
  { href: '#entrega', label: 'Entrega' }
];

export function Header() {
  const scrolled = useScrolled(24);
  const [menu, setMenu] = useState(false);
  const { totals, openCart } = useCart();

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  const bag = (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir pedido, ${totals.count} ${totals.count === 1 ? 'item' : 'itens'}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/80 text-snow transition hover:border-snow"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
      {totals.count > 0 && (
        <span key={totals.count} className="pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[0.7rem] font-bold text-snow">
          {totals.count}
        </span>
      )}
    </button>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || menu ? 'border-b border-line bg-ink/95 backdrop-blur' : 'border-b border-transparent bg-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#topo" aria-label="Forno Nero, início">
          <Logo />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-snow/85 transition hover:text-ember">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {bag}
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls="menu-mobile"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/80 md:hidden"
          >
            {menu ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav id="menu-mobile" aria-label="Menu" hidden={!menu} className="border-t border-line bg-ink md:hidden">
        <ul className="mx-auto max-w-7xl px-5 py-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setMenu(false)} className="flex min-h-12 items-center text-lg font-semibold">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
