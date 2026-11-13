import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useScrolled } from '../hooks/useScrolled';
import { Logo } from './Logo';

export const NAV = [
  { href: '#inicio', label: 'Início' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#historia', label: 'Nossa história' },
  { href: '#diferenciais', label: 'Diferenciais' },
  { href: '#contato', label: 'Contato' }
];

export function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const { totals, openCart } = useCart();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const solid = scrolled || menuOpen;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        solid ? 'bg-char/95 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.7)] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5">
        <a href="#inicio" aria-label="BRASA BURGER, ir para o início" className="rounded">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-heading text-sm font-bold uppercase tracking-wide text-white/90 transition hover:text-mustard"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#cardapio" className="btn btn-primary hidden !min-h-11 !px-5 sm:inline-flex">
            FAÇA SEU PEDIDO
          </a>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir pedido, ${totals.count} ${totals.count === 1 ? 'item' : 'itens'}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-md text-white transition hover:bg-white/10"
          >
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            {totals.count > 0 && (
              <span
                key={totals.count}
                className="pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[0.7rem] font-bold text-white"
              >
                {totals.count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md text-white transition hover:bg-white/10 lg:hidden"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        className={`grid overflow-hidden border-t border-white/10 bg-char transition-[grid-template-rows,visibility] duration-300 lg:hidden ${
          menuOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr] border-transparent'
        }`}
        inert={!menuOpen}
      >
        <nav aria-label="Menu mobile" className="min-h-0">
          <ul className="px-5 pb-6 pt-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/10 py-4 font-heading text-base font-bold uppercase tracking-wide text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-5">
              <a href="#cardapio" onClick={() => setMenuOpen(false)} className="btn btn-primary w-full">
                FAÇA SEU PEDIDO
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
