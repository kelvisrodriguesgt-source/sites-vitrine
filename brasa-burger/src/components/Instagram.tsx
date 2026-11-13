import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { InstagramIcon } from './icons';
import { SectionHeading } from './SectionHeading';

export function Instagram() {
  const { instagram } = site.texts;
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="instagram" className="bg-white px-5 py-20 md:py-28" aria-labelledby="instagram-titulo">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="instagram-titulo" title={instagram.title} subtitle={instagram.subtitle} brush="text-tomato" />
        <div ref={ref} className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {site.gallery.slice(0, 6).map((g) => (
            <a
              key={g.src}
              href={site.contact.instagramUrl}
              target="_blank"
              rel="noopener"
              aria-label={`Ver no Instagram: ${g.alt}`}
              className="group relative block aspect-square overflow-hidden rounded-md bg-wine"
            >
              <img
                src={g.src}
                alt={g.alt}
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-wine/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <InstagramIcon className="h-9 w-9 text-white" />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-char/55">Fotografias demonstrativas. Não há integração real com o Instagram.</p>
        <div className="mt-8 text-center">
          <a href={site.contact.instagramUrl} target="_blank" rel="noopener" className="btn btn-dark">
            <InstagramIcon className="h-5 w-5" />
            {instagram.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
