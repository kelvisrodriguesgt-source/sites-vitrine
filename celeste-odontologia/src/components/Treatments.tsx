import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { treatmentLink } from '../lib/whatsapp';
import { Eyebrow, Rich, TextLink } from './ui';

export function Treatments() {
  const { treatments, texts, contact } = site;
  const t = texts.treatments;
  const reveal = useReveal<HTMLDivElement>();
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = (card?.clientWidth ?? 320) + 16;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <section id="tratamentos" aria-labelledby="tratamentos-title" className="plate bg-mist px-5 py-16 sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow className="text-ocean">{t.eyebrow}</Eyebrow>
            <h2 id="tratamentos-title" className="font-title mt-4 text-4xl sm:text-6xl">
              <Rich text={t.title} />
            </h2>
            <p className="mt-5 max-w-xl font-light leading-relaxed text-ocean">{t.subtitle}</p>
          </div>
          <div className="hidden gap-3 lg:flex">
            <button type="button" className="round-btn" aria-label="Tratamentos anteriores" disabled={edge.start} onClick={() => go(-1)}>
              <ChevronLeft size={20} strokeWidth={1.25} />
            </button>
            <button type="button" className="round-btn" aria-label="Próximos tratamentos" disabled={edge.end} onClick={() => go(1)}>
              <ChevronRight size={20} strokeWidth={1.25} />
            </button>
          </div>
        </div>

        <ul ref={track} onScroll={measure} className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-2 sm:-mx-12 sm:scroll-pl-12 sm:px-12 lg:-mx-16 lg:scroll-pl-16 lg:px-16">
          {treatments.map((tr) => (
            <li key={tr.id} className="relative aspect-[3/4] w-[82%] shrink-0 snap-start overflow-hidden rounded-[28px] bg-ocean sm:w-[46%] lg:w-[31%]">
              <img src={tr.image} alt={tr.imageAlt} width={900} height={675} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-transparent" aria-hidden="true" />
              <div className="glass absolute inset-x-3 bottom-3 p-5 sm:p-6">
                <h3 className="font-title text-3xl">{tr.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm font-light text-white/90">
                  {tr.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-champagne" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={treatmentLink(contact, tr.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.cardCta} ${tr.title} pelo WhatsApp`}
                  className="group mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-champagne transition hover:bg-champagne hover:text-navy"
                >
                  <ArrowRight size={18} strokeWidth={1.5} className="transition duration-300 group-hover:-rotate-45" />
                </a>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <TextLink href={treatmentLink(contact, 'todos os tratamentos')} external className="text-navy">
            {t.allCta}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
