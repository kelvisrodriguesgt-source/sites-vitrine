import { Menu, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { useScrolled } from '../hooks/useScrolled';
import { scheduleLink } from '../lib/whatsapp';
import { Dialog } from './Dialog';
import { Logo, PillButton } from './ui';

const NAV = [
  { href: '#tratamentos', label: 'Tratamentos' },
  { href: '#tecnologia', label: 'Tecnologia' },
  { href: '#a-clinica', label: 'A clínica' },
  { href: '#equipe', label: 'Equipe' },
  { href: '#contato', label: 'Contato' }
];

export function Header() {
  const site = useSite();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const link = scheduleLink(site.contact);
  const cta = site.texts.header.cta;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 text-white transition-all duration-300 sm:px-7 ${
          scrolled ? 'glass-bar' : 'rounded-full border border-transparent'
        }`}
      >
        <a href="#inicio" aria-label={`${site.brand.name}, início`} className="shrink-0">
          <Logo name={site.brand.name} segment={site.brand.segment} />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[0.72rem] font-medium uppercase tracking-eyebrow text-white/85 transition hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-white px-6 py-3 text-[0.72rem] font-medium uppercase tracking-eyebrow text-navy transition hover:bg-champagne sm:inline-flex"
          >
            {cta}
          </a>
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <Dialog open={open} onClose={close} label="Menu" className="ml-auto h-full w-[min(88vw,380px)] p-3" backdropClassName="bg-abyss/70">
        <div className="glass flex h-full flex-col bg-navy/85 p-7">
          <div className="flex items-center justify-between">
            <Logo name={site.brand.name} segment={site.brand.segment} />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={close}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition hover:bg-white/10"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Menu móvel" className="mt-12 flex flex-col">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={close} className="border-b border-white/15 py-4 font-serif text-3xl font-medium">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto pt-8">
            <PillButton href={link} external tone="champagne" onClick={close}>
              {cta}
            </PillButton>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
