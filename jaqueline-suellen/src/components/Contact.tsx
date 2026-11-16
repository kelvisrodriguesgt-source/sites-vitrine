import { Clock, MapPin, Navigation } from 'lucide-react';
import { site } from '../config/site';
import { fullAddress, mapsDirectionsUrl } from '../lib/format';
import { formatPhone, waLink } from '../lib/whatsapp';
import { genericMessage } from '../lib/booking';
import { Monogram } from './Monogram';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { InstagramIcon, WhatsAppIcon } from './icons';

export function Contact() {
  const { address, contact, texts: t } = site;
  return (
    <section id="contato" aria-labelledby="contato-title" className="section-y bg-offwhite">
      <div className="container-x">
        <Reveal>
          <SectionHead id="contato-title" eyebrow={t.contactEyebrow} title={t.contactTitle} subtitle={t.contactSubtitle} />
        </Reveal>
        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <address className="space-y-7 rounded-3xl border border-champagne/40 bg-white p-7 not-italic shadow-soft sm:p-10">
              <p className="font-serif text-2xl font-medium text-cocoa">{site.brand.name}</p>
              <div className="flex gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-taupe" aria-hidden="true" />
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-taupe">Endereço</p>
                  <p className="mt-1 leading-relaxed text-cocoa">{fullAddress(address)}</p>
                  {site.brand.demo && !address.confirmed && <p className="mt-1 text-xs text-taupe/70">Endereço a confirmar com a profissional.</p>}
                </div>
              </div>
              <div className="flex gap-4">
                <WhatsAppIcon className="mt-1 size-5 shrink-0 text-taupe" />
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-taupe">WhatsApp</p>
                  <a href={waLink(contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-cocoa underline-offset-4 hover:underline">
                    {formatPhone(contact.whatsapp)}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <InstagramIcon className="mt-1 size-5 shrink-0 text-taupe" />
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-taupe">Instagram</p>
                  <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-cocoa underline-offset-4 hover:underline">
                    {contact.instagramHandle}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="mt-1 size-5 shrink-0 text-taupe" aria-hidden="true" />
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-taupe">Horários</p>
                  {site.hours.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-cocoa">
                      {site.hours.map((h) => (
                        <li key={h.label}>
                          {h.label}: {h.time}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 leading-relaxed text-cocoa">{site.hoursNote}</p>
                  )}
                </div>
              </div>
              <p className="border-t border-champagne/40 pt-6 text-sm leading-relaxed text-taupe">{t.contactInclusive}</p>
              <div className="flex flex-wrap gap-3">
                <a href={mapsDirectionsUrl(address)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <Navigation className="size-4" aria-hidden="true" />
                  Como chegar
                </a>
                <a href={waLink(contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" className="btn btn-whats">
                  <WhatsAppIcon className="size-4" />
                  Falar pelo WhatsApp
                </a>
              </div>
            </address>
          </Reveal>
          <Reveal>
            {address.mapEmbedSrc ? (
              <iframe title={`Mapa: ${site.brand.name}, ${address.city} - ${address.state}`} src={address.mapEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[22rem] w-full rounded-3xl border border-champagne/40" />
            ) : (
              <div role="img" aria-label="Espaço reservado para o mapa" className="flex h-full min-h-[22rem] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-champagne bg-nude/60 p-8 text-center text-taupe">
                <Monogram className="w-24 text-champagne/70" />
                <p className="max-w-xs text-sm leading-relaxed">{t.mapPlaceholder}</p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
