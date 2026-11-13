import { MessageCircle } from 'lucide-react';
import { site } from '../config/site';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { NAV } from './Header';
import { InstagramIcon } from './icons';
import { Logo } from './Logo';

export function Footer() {
  const a = site.address;
  return (
    <footer className="bg-[#150d0b] px-5 pb-28 pt-16 text-white/75 md:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed">{site.texts.seoIntro}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={site.contact.instagramUrl}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-mustard hover:text-char"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={buildWhatsAppUrl(site.contact.whatsapp, site.contact.greeting)}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-mustard hover:text-char"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
        <nav aria-label="Rodapé">
          <p className="eyebrow text-mustard">Navegação</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition hover:text-mustard">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow text-mustard">Contato</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`tel:${site.contact.phoneTel}`} className="hover:text-mustard">
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a href={buildWhatsAppUrl(site.contact.whatsapp, site.contact.greeting)} target="_blank" rel="noopener" className="hover:text-mustard">
                WhatsApp {site.contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={site.contact.instagramUrl} target="_blank" rel="noopener" className="hover:text-mustard">
                {site.contact.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-mustard">Endereço e horário</p>
          <address className="mt-4 text-sm not-italic leading-relaxed">
            {a.street}, {a.district}
            <br />
            {a.city} - {a.state}, CEP {a.postalCode}
          </address>
          <ul className="mt-3 space-y-1 text-sm">
            {site.hours.map((h) => (
              <li key={h.label}>
                {h.label}: {h.time}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-xs">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {site.brand.name}. Todos os direitos reservados.
        </p>
        {site.brand.demo && <p className="mt-2 text-white/55">{site.brand.demoNote}</p>}
      </div>
    </footer>
  );
}
