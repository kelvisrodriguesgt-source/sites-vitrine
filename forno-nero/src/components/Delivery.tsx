import { Banknote, Clock, CreditCard, MapPin, Phone, QrCode } from 'lucide-react';
import { site } from '../config/site';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { InstagramIcon, WhatsAppIcon } from './icons';
import { SectionHeading } from './SectionHeading';

const PAY_ICONS: Record<string, typeof CreditCard> = { Pix: QrCode, Dinheiro: Banknote };

export function Delivery() {
  const { texts, address, hours, contact, payments, order } = site;
  const full = `${address.street}, ${address.district}, ${address.city} - ${address.state}`;
  const directions = address.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;

  return (
    <section id="entrega" aria-labelledby="entrega-titulo" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Entrega" title={texts.delivery.title} subtitle={texts.delivery.subtitle} id="entrega-titulo" />

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {texts.delivery.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-line bg-card p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember font-display text-lg font-extrabold text-ink">{i + 1}</span>
              <div>
                <h3 className="text-lg font-extrabold">{s.title}</h3>
                <p className="mt-1 text-sm text-ash">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ash">{order.deliveryNote}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-line bg-card p-6 sm:p-8">
            <div className="flex gap-4">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
              <div>
                <h3 className="font-extrabold">Horário</h3>
                <ul className="mt-1 text-sm text-ash">
                  {hours.map((h) => (
                    <li key={h.label}>
                      {h.label}: {h.time}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
              <div>
                <h3 className="font-extrabold">Endereço</h3>
                <address className="mt-1 text-sm not-italic text-ash">
                  {address.street}, {address.district}
                  <br />
                  {address.city} - {address.state}, CEP {address.postalCode}
                </address>
              </div>
            </div>
            <div className="flex gap-4">
              <CreditCard className="mt-1 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
              <div>
                <h3 className="font-extrabold">Formas de pagamento</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {payments.map((p) => {
                    const Icon = PAY_ICONS[p] ?? CreditCard;
                    return (
                      <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm">
                        <Icon className="h-4 w-4 text-ember" aria-hidden="true" />
                        {p}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={buildWhatsAppUrl(contact.whatsapp, contact.greeting)} target="_blank" rel="noopener" className="btn btn-whats">
                <WhatsAppIcon className="h-5 w-5" />
                {contact.whatsappDisplay}
              </a>
              <a href={`tel:${contact.phoneTel}`} className="btn btn-outline">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contact.phone}
              </a>
              <a href={contact.instagramUrl} target="_blank" rel="noopener" className="btn btn-outline">
                <InstagramIcon className="h-4 w-4" />
                {contact.instagramHandle}
              </a>
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden rounded-3xl border border-line bg-card">
            {address.mapEmbedSrc ? (
              <iframe src={address.mapEmbedSrc} title={`Mapa: ${full}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
            ) : (
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
                <MapPin className="h-10 w-10 text-ember" strokeWidth={1.4} aria-hidden="true" />
                <p className="font-semibold">O mapa do Google aparece aqui</p>
                <p className="text-sm text-ash">{full}</p>
                <a href={directions} target="_blank" rel="noopener" className="btn btn-outline">
                  Como chegar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
