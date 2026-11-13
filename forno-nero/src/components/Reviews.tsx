import { Star } from 'lucide-react';
import { site } from '../config/site';
import { SectionHeading } from './SectionHeading';

export function Reviews() {
  const { reviews, texts, googleReviewsUrl } = site;
  return (
    <section id="avaliacoes" aria-labelledby="avaliacoes-titulo" className="bg-coal py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Avaliações" title={texts.reviews.title} subtitle={texts.reviews.subtitle} id="avaliacoes-titulo" />
        {reviews.length > 0 ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={`${r.author}-${r.source}`} className="rounded-2xl border border-line bg-card p-6">
                <p className="text-base leading-relaxed">“{r.text}”</p>
                <p className="mt-4 text-sm font-bold">{r.author}</p>
                <p className="text-xs text-ash">Fonte: {r.source}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl border border-dashed border-line bg-card/60 px-6 py-12 text-center">
            <div className="flex gap-1 text-ember/70" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-6 w-6" strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-lg font-semibold">{texts.reviews.empty}</p>
            {googleReviewsUrl ? (
              <a href={googleReviewsUrl} target="_blank" rel="noopener" className="btn btn-outline">
                {texts.reviews.cta}
              </a>
            ) : (
              <button type="button" disabled title="Ativa quando o link do Google Meu Negócio for informado" className="btn btn-outline">
                {texts.reviews.cta}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
