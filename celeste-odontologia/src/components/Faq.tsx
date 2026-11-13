import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { useReveal } from '../hooks/useReveal';
import { Eyebrow, Rich } from './ui';

export function Faq() {
  const site = useSite();
  const { faq, texts } = site;
  const t = texts.faq;
  const reveal = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="duvidas" aria-labelledby="faq-title" className="plate bg-ocean px-5 py-16 text-white sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal} className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow className="text-champagne">{t.eyebrow}</Eyebrow>
          <h2 id="faq-title" className="font-title mt-4 text-4xl sm:text-6xl">
            <Rich text={t.title} />
          </h2>
        </div>
        <ul className="space-y-3">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="glass overflow-hidden !rounded-[24px]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-btn-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-serif text-xl font-medium sm:text-2xl"
                  >
                    {item.q}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40" aria-hidden="true">
                      {isOpen ? <Minus size={16} strokeWidth={1.25} /> : <Plus size={16} strokeWidth={1.25} />}
                    </span>
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen}>
                  <p className="px-6 pb-6 font-light leading-relaxed text-white/80">{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
