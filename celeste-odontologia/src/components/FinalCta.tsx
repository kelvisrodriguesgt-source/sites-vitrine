import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { scheduleLink } from '../lib/whatsapp';
import { PillButton, Rich } from './ui';

export function FinalCta() {
  const { texts, images, contact } = site;
  const t = texts.finalCta;
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section aria-labelledby="cta-title" className="plate bg-navy px-5 py-20 text-center text-white sm:px-12 sm:py-32">
      <img src={images.ctaFinal} alt="" width={1600} height={900} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy/70" aria-hidden="true" />
      <div ref={reveal} className="relative mx-auto max-w-3xl">
        <h2 id="cta-title" className="font-title text-4xl sm:text-7xl">
          <Rich text={t.title} />
        </h2>
        <p className="mx-auto mt-6 max-w-lg font-light leading-relaxed text-white/80">{t.text}</p>
        <div className="mt-10 flex justify-center">
          <PillButton href={scheduleLink(contact)} external tone="champagne">
            {t.button}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
