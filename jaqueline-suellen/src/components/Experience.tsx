import { HandHeart, Heart, Sparkles } from 'lucide-react';
import { site } from '../config/site';
import { imageUrl } from '../lib/images';
import { Monogram } from './Monogram';
import { Photo } from './Photo';
import { Reveal } from './Reveal';

// Os três valores vêm do texto da profissional ("individualizado, acolhedor, com atenção aos detalhes").
const values = [
  { icon: HandHeart, label: 'Atendimento individualizado' },
  { icon: Heart, label: 'Ambiente acolhedor' },
  { icon: Sparkles, label: 'Atenção aos detalhes' }
];

export function Experience() {
  const t = site.texts;
  const hasImage = Boolean(imageUrl(site.images.clinic.file));
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="relative isolate overflow-hidden bg-cocoa py-24 text-offwhite sm:py-32">
      {hasImage ? (
        <>
          <Photo slot={site.images.clinic} fill className="-z-20" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cocoa/75" />
        </>
      ) : (
        <Monogram aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/2 -z-10 w-[30rem] -translate-y-1/2 text-champagne/[0.07] sm:left-[2%] sm:w-[36rem]" />
      )}
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow !text-champagne">{t.clinicEyebrow}</p>
          <h2 id="sobre-title" className="title-main mt-4 text-[2.1rem] text-offwhite sm:text-5xl">
            {t.clinicTitle}
          </h2>
          <span className="rule mt-6" />
          <p className="mx-auto mt-8 max-w-2xl font-display text-2xl italic leading-relaxed text-offwhite/90 sm:text-3xl">{t.clinicText}</p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3" aria-label="Valores do atendimento">
            {values.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-3 rounded-2xl border border-champagne/30 bg-offwhite/5 px-5 py-6">
                <Icon className="size-6 text-champagne" aria-hidden="true" />
                <span className="font-sans text-[0.78rem] font-medium uppercase tracking-[0.16em] text-offwhite/90">{label}</span>
              </li>
            ))}
          </ul>
          <a href="#tratamentos" className="btn btn-outline-light mt-12">
            {t.clinicCta}
          </a>
          {!hasImage && <p className="mt-8 text-xs text-offwhite/50">{t.clinicNote}</p>}
        </Reveal>
      </div>
    </section>
  );
}
