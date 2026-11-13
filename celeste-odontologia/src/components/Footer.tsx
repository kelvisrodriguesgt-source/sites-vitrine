import { site } from '../config/site';
import { Logo } from './ui';

const LINKS = [
  { href: '#tratamentos', label: 'Tratamentos' },
  { href: '#tecnologia', label: 'Tecnologia' },
  { href: '#a-clinica', label: 'A clínica' },
  { href: '#equipe', label: 'Equipe' },
  { href: '#contato', label: 'Contato' }
];

export function Footer() {
  const { brand, address, contact, hours } = site;
  return (
    <footer className="px-5 pb-28 pt-14 text-white sm:px-12 lg:px-16">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo name={brand.name} segment={brand.segment} />
          <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-white/70">{brand.tagline}</p>
        </div>
        <address className="text-sm font-light not-italic leading-relaxed text-white/80">
          <p className="eyebrow mb-3 text-champagne">{brand.name}</p>
          <p>
            {address.street}
            <br />
            {address.district}, {address.city} — {address.state}
            <br />
            CEP {address.postalCode}
          </p>
          <p className="mt-3">
            Tel. {contact.phone}
            <br />
            WhatsApp {contact.whatsappDisplay}
          </p>
          <p className="mt-3 text-white/60">{hours.map((h) => `${h.label}: ${h.time}`).join(' · ')}</p>
        </address>
        <nav aria-label="Rodapé">
          <p className="eyebrow mb-3 text-champagne">Navegação</p>
          <ul className="space-y-2 text-sm font-light text-white/80">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {brand.demo ? <p className="mt-12 rounded-2xl border border-white/20 px-5 py-3 text-center text-xs text-white/75">{brand.demoNote}</p> : null}
      <p className="mt-6 text-center text-xs text-white/50">Site desenvolvido por Grupo KR</p>
    </footer>
  );
}
