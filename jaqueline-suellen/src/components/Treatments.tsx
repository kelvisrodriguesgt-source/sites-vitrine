import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { site } from '../config/site';
import type { Treatment } from '../config/types';
import { treatmentMessage } from '../lib/booking';
import { waLink } from '../lib/whatsapp';
import { Photo } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { WhatsAppIcon } from './icons';

function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const [open, setOpen] = useState(false);
  const panelId = `mais-${treatment.id}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-champagne/30 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="overflow-hidden">
        <Photo slot={treatment.image} className="transition duration-700 group-hover:scale-[1.03]" label={`Foto · ${treatment.name}`} />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-serif text-2xl font-medium leading-tight text-cocoa">{treatment.name}</h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-taupe">{treatment.description}</p>
        {treatment.price && <p className="mt-3 font-ui text-sm font-semibold text-cocoa">{treatment.price}</p>}
        <p id={panelId} hidden={!open} className="fade-up mt-4 border-l-2 border-champagne pl-4 text-[0.92rem] leading-relaxed text-cocoa/80">
          {treatment.more}
        </p>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)} className="inline-flex min-h-11 items-center gap-2 self-start font-ui text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-cocoa transition hover:text-taupe">
            {open ? <Minus className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            Saiba mais
            <span className="sr-only"> sobre {treatment.name}</span>
          </button>
          <a href={waLink(site.contact.whatsapp, treatmentMessage(site.brand.professional, treatment.name))} target="_blank" rel="noopener noreferrer" className="btn btn-whats !min-h-11 !px-5 !text-[0.7rem]">
            <WhatsAppIcon className="size-4" />
            Agendar
            <span className="sr-only"> {treatment.name} pelo WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function Treatments() {
  const t = site.texts;
  return (
    <section id="tratamentos" aria-labelledby="tratamentos-title" className="section-y bg-offwhite">
      <div className="container-x">
        <Reveal>
          <SectionHead id="tratamentos-title" eyebrow="Tratamentos" title={t.treatmentsTitle} subtitle={t.treatmentsSubtitle} />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {site.treatments.map((treatment) => (
            <Reveal key={treatment.id}>
              <TreatmentCard treatment={treatment} />
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-taupe/80">
          <ArrowRight className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
          {t.treatmentsNote}
        </p>
      </div>
    </section>
  );
}
