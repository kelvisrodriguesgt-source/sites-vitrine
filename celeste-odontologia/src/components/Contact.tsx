import { Clock, MapPin, Phone } from 'lucide-react';
import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { directionsLink, scheduleLink } from '../lib/whatsapp';
import { Eyebrow, PillButton, Rich, TextLink } from './ui';

export function Contact() {
  const { address, hours, contact, texts, brand } = site;
  const t = texts.contact;
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="contato" aria-labelledby="contato-title" className="plate bg-frost px-5 py-16 sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal} className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Eyebrow className="text-ocean">{t.eyebrow}</Eyebrow>
          <h2 id="contato-title" className="font-title mt-4 text-4xl sm:text-6xl">
            <Rich text={t.title} />
          </h2>
          <p className="mt-5 max-w-md font-light leading-relaxed text-ocean">{t.subtitle}</p>

          <address className="mt-10 space-y-7 not-italic">
            <div className="flex items-start gap-5">
              <span className="icon-ring border-navy/30" aria-hidden="true">
                <MapPin size={22} strokeWidth={1.25} />
              </span>
              <p className="font-light leading-relaxed">
                {address.street}
                <br />
                {address.district}, {address.city} — {address.state}
                <br />
                CEP {address.postalCode}
              </p>
            </div>
            <div className="flex items-start gap-5">
              <span className="icon-ring border-navy/30" aria-hidden="true">
                <Clock size={22} strokeWidth={1.25} />
              </span>
              <dl className="space-y-1 font-light">
                {hours.map((h) => (
                  <div key={h.label} className="flex gap-3">
                    <dt className="min-w-36 text-ocean">{h.label}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex items-start gap-5">
              <span className="icon-ring border-navy/30" aria-hidden="true">
                <Phone size={22} strokeWidth={1.25} />
              </span>
              <p className="font-light leading-relaxed">
                <a href={`tel:${contact.phoneTel}`} className="hover:underline">
                  {contact.phone}
                </a>
                <br />
                <span className="text-ocean">WhatsApp {contact.whatsappDisplay}</span>
              </p>
            </div>
          </address>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-5">
            <PillButton href={scheduleLink(contact)} external tone="navy">
              WhatsApp
            </PillButton>
            <TextLink href={`tel:${contact.phoneTel}`}>Ligar</TextLink>
            <TextLink href={directionsLink(address)} external>
              Como chegar
            </TextLink>
            <TextLink href={contact.instagramUrl} external>
              Instagram
            </TextLink>
          </div>
        </div>

        <div className="min-h-[20rem] overflow-hidden rounded-[28px] bg-mist lg:min-h-0">
          {address.mapEmbedSrc ? (
            <iframe
              title={`Mapa: localização da ${brand.name}`}
              src={address.mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[20rem] w-full border-0"
            />
          ) : (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 p-8 text-center text-ocean">
              <span className="icon-ring border-navy/30" aria-hidden="true">
                <MapPin size={22} strokeWidth={1.25} />
              </span>
              <p className="font-serif text-2xl italic">{t.mapPlaceholder}</p>
              <p className="max-w-xs text-sm font-light">O mapa aparece aqui quando o endereço real for configurado.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
