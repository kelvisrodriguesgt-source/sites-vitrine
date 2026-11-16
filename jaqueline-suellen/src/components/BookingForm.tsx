import { type ChangeEvent, type FormEvent, useId, useRef, useState } from 'react';
import { site } from '../config/site';
import { type BookingData, type BookingErrors, buildBookingMessage, emptyBooking, validateBooking } from '../lib/booking';
import { maskPhone, waLink } from '../lib/whatsapp';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { WhatsAppIcon } from './icons';

const OTHER = 'Ainda não sei, quero conversar';

type Status = { kind: 'idle' } | { kind: 'sent'; url: string } | { kind: 'invalid' };

export function BookingForm() {
  const t = site.texts;
  const uid = useId();
  const procedures = [...site.treatments.map((x) => x.name), OTHER];
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  const id = (name: string) => `${uid}-${name}`;
  const set = (key: keyof BookingData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = key === 'phone' ? maskPhone(e.target.value) : e.target.value;
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateBooking(data, procedures, site.booking.days, site.booking.maxMessage);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'invalid' });
      const first = (['name', 'phone', 'procedure', 'day', 'message'] as const).find((k) => found[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const url = waLink(site.contact.whatsapp, buildBookingMessage(data, site.brand.professional));
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus({ kind: 'sent', url });
  }

  const invalid = (key: keyof BookingData) => Boolean(errors[key]);
  const fieldClass = (key: keyof BookingData) => `field ${invalid(key) ? 'field-error' : ''}`;
  const describe = (key: keyof BookingData) => (invalid(key) ? id(`${key}-erro`) : undefined);
  const err = (key: keyof BookingData) =>
    errors[key] ? (
      <p id={id(`${key}-erro`)} className="mt-1.5 text-sm font-medium text-[#9b3a2e]">
        {errors[key]}
      </p>
    ) : null;

  return (
    <section id="agendar" aria-labelledby="agendar-title" className="section-y bg-nude/70">
      <div className="container-x">
        <Reveal>
          <SectionHead id="agendar-title" eyebrow={t.bookingEyebrow} title={t.bookingTitle} subtitle={t.bookingText} />
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-2xl">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="rounded-3xl border border-champagne/40 bg-offwhite p-6 shadow-soft sm:p-10" aria-describedby={id('nota')}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={id('name')} className="font-sans text-sm font-semibold text-cocoa">
                  Nome
                </label>
                <input id={id('name')} name="name" type="text" autoComplete="name" value={data.name} onChange={set('name')} className={fieldClass('name')} aria-invalid={invalid('name')} aria-describedby={describe('name')} placeholder="Seu nome" />
                {err('name')}
              </div>
              <div>
                <label htmlFor={id('phone')} className="font-sans text-sm font-semibold text-cocoa">
                  Telefone (WhatsApp)
                </label>
                <input id={id('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" value={data.phone} onChange={set('phone')} className={fieldClass('phone')} aria-invalid={invalid('phone')} aria-describedby={describe('phone')} placeholder="(69) 99999-9999" />
                {err('phone')}
              </div>
              <div>
                <label htmlFor={id('procedure')} className="font-sans text-sm font-semibold text-cocoa">
                  Tratamento
                </label>
                <select id={id('procedure')} name="procedure" value={data.procedure} onChange={set('procedure')} className={fieldClass('procedure')} aria-invalid={invalid('procedure')} aria-describedby={describe('procedure')}>
                  <option value="">Escolha um tratamento</option>
                  {procedures.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {err('procedure')}
              </div>
              <div>
                <label htmlFor={id('day')} className="font-sans text-sm font-semibold text-cocoa">
                  Melhor dia
                </label>
                <select id={id('day')} name="day" value={data.day} onChange={set('day')} className={fieldClass('day')} aria-invalid={invalid('day')} aria-describedby={describe('day')}>
                  <option value="">Escolha o melhor dia</option>
                  {site.booking.days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {err('day')}
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor={id('message')} className="font-sans text-sm font-semibold text-cocoa">
                Mensagem <span className="font-normal text-taupe">(opcional)</span>
              </label>
              <textarea id={id('message')} name="message" rows={4} value={data.message} onChange={set('message')} className={fieldClass('message')} aria-invalid={invalid('message')} aria-describedby={describe('message')} placeholder="Conte o que você procura ou tire uma dúvida." />
              <div className="flex justify-between">
                <span>{err('message')}</span>
                <span className={`mt-1.5 text-xs ${data.message.length > site.booking.maxMessage ? 'font-semibold text-[#9b3a2e]' : 'text-taupe/70'}`}>
                  {data.message.length}/{site.booking.maxMessage}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-whats mt-6 w-full">
              <WhatsAppIcon className="size-4" />
              Enviar pelo WhatsApp
            </button>
            <p id={id('nota')} className="mt-4 text-center text-xs leading-relaxed text-taupe">
              {t.bookingNote}
            </p>

            <div role="status" aria-live="polite" className="mt-4">
              {status.kind === 'invalid' && <p className="fade-up rounded-xl bg-[#9b3a2e]/10 px-4 py-3 text-center text-sm font-medium text-[#7a2c22]">Confira os campos destacados e tente de novo.</p>}
              {status.kind === 'sent' && (
                <p className="fade-up rounded-xl bg-nude px-4 py-3 text-center text-sm text-cocoa">
                  Sua mensagem foi preparada e o WhatsApp foi aberto. Envie a mensagem para finalizar o pedido de contato. O horário só será confirmado pela profissional.{' '}
                  <a href={status.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                    O WhatsApp não abriu? Toque aqui.
                  </a>
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
