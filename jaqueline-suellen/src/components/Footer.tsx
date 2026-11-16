import { site } from '../config/site';
import { fullAddress } from '../lib/format';
import { formatPhone, waLink } from '../lib/whatsapp';
import { Logo } from './Logo';
import { InstagramIcon, WhatsAppIcon } from './icons';

export function Footer() {
  const { contact, address, brand } = site;
  return (
    <footer className="bg-cocoa pb-28 pt-16 text-offwhite/80 sm:pb-16">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">{brand.tagline}</p>
          </div>
          <nav aria-label="Rodapé">
            <p className="eyebrow !text-champagne">Navegação</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 text-sm md:grid-cols-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="inline-flex min-h-11 items-center transition hover:text-offwhite">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <address className="not-italic">
            <p className="eyebrow !text-champagne">Contato</p>
            <ul className="mt-4 space-y-1 text-sm leading-relaxed">
              <li>{brand.name}</li>
              <li>{fullAddress(address)}</li>
              <li>
                <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition hover:text-offwhite">
                  <WhatsAppIcon className="size-4" />
                  {formatPhone(contact.whatsapp)}
                </a>
              </li>
              <li>
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition hover:text-offwhite">
                  <InstagramIcon className="size-4" />
                  {contact.instagramHandle}
                </a>
              </li>
            </ul>
          </address>
        </div>
        <div className="mt-12 border-t border-offwhite/15 pt-6 text-xs leading-relaxed text-offwhite/60">
          <p>
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </p>
          <p className="mt-2">Os tratamentos são realizados conforme avaliação e indicação profissional. Os resultados variam de pessoa para pessoa.</p>
          {brand.demo && <p className="mt-2 text-champagne">{brand.demoNote}</p>}
        </div>
      </div>
    </footer>
  );
}
