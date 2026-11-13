import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { scheduleLink } from '../lib/whatsapp';
import { PillButton } from './ui';

export function Highlights() {
  const { highlights, texts, contact } = site;
  const t = texts.highlights;
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section aria-label="Destaques" className="plate bg-frost px-5 py-12 sm:px-12 sm:py-16 lg:px-16">
      <div ref={reveal} className="grid gap-8 lg:grid-cols-4 lg:items-stretch">
        {highlights.map((h) => (
          <div key={h.label} className="flex flex-col justify-center border-navy/15 lg:border-r lg:pr-6">
            <p className="font-title text-5xl sm:text-6xl">{h.value}</p>
            <p className="mt-2 text-sm font-light leading-snug text-ocean">{h.label}</p>
          </div>
        ))}
        <div className="rounded-[28px] bg-navy p-7 text-white">
          <h2 className="font-title text-3xl">{t.ctaTitle}</h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">{t.ctaText}</p>
          <div className="mt-6">
            <PillButton href={scheduleLink(contact)} external tone="champagne">
              {t.ctaButton}
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
