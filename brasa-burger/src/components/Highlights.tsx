import { site } from '../config/site';
import { ProductCard } from './ProductCard';
import { SectionHeading } from './SectionHeading';

export function Highlights() {
  const featured = site.products.filter((p) => p.featured).slice(0, 3);
  return (
    <section id="destaques" className="bg-cream px-5 py-20 md:py-28" aria-labelledby="destaques-titulo">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="destaques-titulo" title={site.texts.highlights.title} subtitle={site.texts.highlights.subtitle} />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
