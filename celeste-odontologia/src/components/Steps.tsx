import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { Eyebrow, Rich } from './ui';

export function Steps() {
  const { steps, texts } = site;
  const t = texts.steps;
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="como-funciona" aria-labelledby="como-title" className="plate bg-mist px-5 py-16 sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal}>
        <Eyebrow className="text-ocean">{t.eyebrow}</Eyebrow>
        <h2 id="como-title" className="font-title mt-4 max-w-2xl text-4xl sm:text-6xl">
          <Rich text={t.title} />
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t border-navy/25 pt-6">
              <span className="font-serif text-6xl font-medium italic text-ocean/70">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-title mt-4 text-3xl">{s.title}</h3>
              <p className="mt-3 max-w-xs font-light leading-relaxed text-ocean">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
