import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { site } from '../config/site';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { InstagramIcon, WhatsAppIcon } from './icons';
import { Logo } from './Logo';

const LINKS = [
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#promocoes', label: 'Promoções' },
  { href: '#avaliacoes', label: 'Avaliações' },
  { href: '#entrega', label: 'Entrega' }
];

export function Footer() {
  const { brand, contact, address, hours } = site;
  return (
    <footer className="bg-card pb-24 text-snow sm:pb-0">
      {brand.demo && <p className="bg-ember px-5 py-2 text-center text-sm font-bold text-ink">{brand.demoNote}</p>}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ash">{brand.tagline}</p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Navegue</h2>
          <ul className="mt-2 text-sm text-ash">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-11 items-center hover:text-snow">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Contato</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-ash">
            <p>
              {address.street}, {address.district}
            </p>
            <p>
              {address.city} - {address.state}, CEP {address.postalCode}
            </p>
            <p>{hours.map((h) => `${h.label}: ${h.time}`).join(' · ')}</p>
            <p>
              <a href={`tel:${contact.phoneTel}`} className="inline-flex min-h-11 items-center hover:text-snow">
                {contact.phone}
              </a>
            </p>
          </address>
        </div>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Siga e peça</h2>
          <div className="mt-3 flex gap-3">
            <a href={buildWhatsAppUrl(contact.whatsapp, contact.greeting)} target="_blank" rel="noopener" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-snow">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a href={contact.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-snow">
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-5 flex gap-3 text-ash" role="img" aria-label="Pagamentos: Pix, cartão e dinheiro">
            <QrCode className="h-6 w-6" aria-hidden="true" />
            <CreditCard className="h-6 w-6" aria-hidden="true" />
            <Banknote className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-ash sm:px-8">
          <p>Site desenvolvido por Grupo KR</p>
          <p>Imagens meramente ilustrativas.</p>
        </div>
      </div>
    </footer>
  );
}
