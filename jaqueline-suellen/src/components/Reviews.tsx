import { Quote, Star } from 'lucide-react';
import { site } from '../config/site';
import { ratingLabel, stars } from '../lib/format';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function Reviews() {
  const { reviews, googleRating, texts } = site;
  const single = reviews.length === 1;
  return (
    <section id="depoimentos" aria-labelledby="depoimentos-title" className="section-y bg-nude/70">
      <div className="container-x">
        <Reveal>
          <SectionHead id="depoimentos-title" eyebrow={texts.reviewsEyebrow} title={texts.reviewsTitle} />
          <p className="mt-6 flex items-center justify-center gap-2 font-ui text-sm font-medium text-taupe">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-champagne text-champagne" />
              ))}
            </span>
            {ratingLabel(googleRating.score, googleRating.count)}
          </p>
        </Reveal>
        {reviews.length === 0 ? (
          <p className="mt-12 text-center text-taupe">{texts.reviewsEmpty}</p>
        ) : (
          <ul className={`mt-12 grid gap-6 ${single ? 'mx-auto max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {reviews.map((r) => (
              <Reveal as="li" key={`${r.author}-${r.text}`}>
                <figure className="relative h-full rounded-3xl border border-champagne/40 bg-offwhite p-8 shadow-soft sm:p-10">
                  <Quote className="size-8 text-champagne" aria-hidden="true" />
                  <div className="mt-4 flex" role="img" aria-label={`${stars(r.rating)} de 5 estrelas`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`size-4 ${i < stars(r.rating) ? 'fill-champagne text-champagne' : 'text-champagne/40'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-5 font-display text-[1.65rem] font-medium italic leading-snug text-cocoa sm:text-3xl">“{r.text}”</blockquote>
                  <figcaption className="mt-6 font-sans text-sm text-taupe">
                    <strong className="font-semibold text-cocoa">{r.author}</strong>
                    <span className="block text-xs uppercase tracking-[0.16em]">{r.source}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
