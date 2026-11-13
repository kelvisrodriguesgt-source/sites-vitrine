import { Clock, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { InstagramIcon } from './icons';
import { SectionHeading } from './SectionHeading';

export const fullAddress = (): string => {
  const a = site.address;
  return `${a.street}, ${a.district}, ${a.city} - ${a.state}, ${a.postalCode}`;
};

export const directionsUrl = (): string =>
  site.address.directionsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-mustard text-char">{icon}</span>
      <div>
        <p className="eyebrow text-mustard">{label}</p>
        <div className="mt-1 text-white/90">{children}</div>
      </div>
    </div>
  );
}

function MapSpace() {
  if (site.address.mapEmbedSrc) {
    return (
      <iframe
        title={`Mapa: ${site.brand.name}`}
        src={site.address.mapEmbedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-lg border-0 lg:aspect-auto lg:h-full lg:min-h-[360px]"
      />
    );
  }
  return (
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-[#2e211e] lg:aspect-auto lg:h-full lg:min-h-[360px]">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g stroke="rgb(255 255 255 / 0.09)" strokeWidth="10" fill="none" strokeLinecap="round">
          <path d="M-10 70H410M-10 170H410M-10 250H410M80-10V310M210-10V310M330-10V310" />
          <path d="M-10 20L410 140" strokeWidth="6" />
        </g>
        <g stroke="rgb(245 169 0 / 0.18)" strokeWidth="14" fill="none">
          <path d="M-10 120C100 100 150 200 410 190" />
        </g>
      </svg>
      <div className="relative flex flex-col items-center text-center">
        <MapPin className="h-14 w-14 text-tomato drop-shadow-lg" strokeWidth={1.8} aria-hidden="true" />
        <p className="mt-3 max-w-[16rem] text-sm text-white/70">
          Espaço reservado para o mapa do Google Maps.
        </p>
      </div>
    </div>
  );
}

export function Contact() {
  const { contact: copy } = site.texts;
  const ref = useReveal<HTMLDivElement>();
  const wa = buildWhatsAppUrl(site.contact.whatsapp, site.contact.greeting);
  return (
    <section id="contato" className="bg-char px-5 py-20 text-white md:py-28" aria-labelledby="contato-titulo">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="contato-titulo" tone="dark" title={copy.title} subtitle={copy.subtitle} brush="text-tomato" />
        <div ref={ref} className="mt-14 grid gap-10 lg:grid-cols-2">
          <div className="space-y-7">
            {site.brand.demo && (
              <p className="inline-block rounded bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-mustard">
                Dados demonstrativos
              </p>
            )}
            <Row icon={<MapPin className="h-5 w-5" aria-hidden="true" />} label="Endereço">
              <address className="not-italic">
                {site.address.street}
                <br />
                {site.address.district}, {site.address.city} - {site.address.state}
                <br />
                CEP {site.address.postalCode}
              </address>
            </Row>
            <Row icon={<Clock className="h-5 w-5" aria-hidden="true" />} label="Horário de funcionamento">
              <ul>
                {site.hours.map((h) => (
                  <li key={h.label}>
                    {h.label}: <strong>{h.time}</strong>
                  </li>
                ))}
              </ul>
            </Row>
            <Row icon={<Phone className="h-5 w-5" aria-hidden="true" />} label="Telefone">
              <a href={`tel:${site.contact.phoneTel}`} className="underline-offset-4 hover:text-mustard hover:underline">
                {site.contact.phone}
              </a>
            </Row>
            <Row icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />} label="WhatsApp">
              <a href={wa} target="_blank" rel="noopener" className="underline-offset-4 hover:text-mustard hover:underline">
                {site.contact.whatsappDisplay}
              </a>
            </Row>
            <Row icon={<InstagramIcon className="h-5 w-5" />} label="Instagram">
              <a href={site.contact.instagramUrl} target="_blank" rel="noopener" className="underline-offset-4 hover:text-mustard hover:underline">
                {site.contact.instagramHandle}
              </a>
            </Row>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex-1">
              <MapSpace />
            </div>
            <a href={directionsUrl()} target="_blank" rel="noopener" className="btn btn-primary self-start">
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {copy.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
