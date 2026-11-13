import { ArrowRight } from 'lucide-react';
import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { BrushStroke } from './icons';

export function Story() {
  const { story } = site.texts;
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="historia" className="bg-cream px-5 py-20 md:py-28" aria-labelledby="historia-titulo">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <BrushStroke className="absolute -bottom-5 -left-4 h-16 w-3/4 text-mustard" />
          <img
            src={site.images.story}
            alt={site.images.storyAlt}
            width={1000}
            height={848}
            loading="lazy"
            decoding="async"
            className="relative aspect-[5/4] w-full rounded-lg object-cover shadow-card"
          />
        </div>
        <div>
          <p className="eyebrow text-tomato">{story.kicker}</p>
          <h2 id="historia-titulo" className="section-title mt-3 text-wine">
            {story.title}
          </h2>
          <BrushStroke className="mt-4 h-3 w-40 text-mustard" />
          <p className="mt-6 text-lg leading-relaxed text-char/80">{story.text}</p>
          <a href="#cardapio" className="btn btn-tomato mt-9">
            {story.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
