import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { site } from '../config/site';
import { useScrolled } from '../hooks/useScrolled';
import { genericMessage } from '../lib/booking';
import { waLink } from '../lib/whatsapp';
import { Logo } from './Logo';

export function Header() {
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;
  return (
    <>
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${solid ? 'border-b border-champagne/30 bg-offwhite/95 shadow-soft backdrop-blur' : 'border-b border-transparent bg-transparent'}`}>
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-4 xl:gap-6">
        <a href="#inicio" className="shrink-0" aria-label={`${site.brand.name}, ir para o início`} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-5 xl:gap-8 lg:flex">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} className="whitespace-nowrap font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-cocoa transition hover:text-taupe xl:text-[0.72rem] xl:tracking-[0.2em]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={waLink(site.contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" className="btn btn-dark hidden !min-h-11 !px-5 sm:inline-flex">
            {site.texts.headerCta}
          </a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-taupe/40 text-cocoa lg:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>

      {/* Fora do <header>: o backdrop-blur dele criaria um novo bloco de contenção e encolheria o menu fixo. */}
      {open && (
        <div id="menu-mobile" className="fade-up fixed inset-x-0 bottom-0 top-[4.5rem] z-30 overflow-y-auto bg-offwhite lg:hidden">
          <nav aria-label="Menu mobile" className="container-x flex flex-col py-6">
            {site.nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-champagne/30 py-5 font-display text-2xl font-medium uppercase tracking-[0.12em] text-cocoa">
                {item.label}
              </a>
            ))}
            <a href={waLink(site.contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="btn btn-dark mt-8">
              {site.texts.headerCta}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
