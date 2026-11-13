import { Check } from 'lucide-react';
import { site } from '../config/site';
import { formatBRL, toCents } from '../lib/money';
import { useReveal } from '../hooks/useReveal';
import { AddButton } from './ProductCard';
import { SectionHeading } from './SectionHeading';

function ComboCard({ id }: { id: string }) {
  const ref = useReveal<HTMLElement>();
  const p = site.products.find((x) => x.id === id);
  if (!p) return null;
  const parts = p.description.replace(/\.$/, '').split(' + ');
  return (
    <article ref={ref} className="group flex flex-col overflow-hidden rounded-lg bg-char text-white shadow-[0_18px_40px_-18px_rgb(33_23_21/0.8)] transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-wine">
        {p.image && (
          <img
            src={p.image}
            alt={p.imageAlt ?? p.name}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${p.imagePosition ?? ''}`}
          />
        )}
        {p.badge && (
          <span className="absolute left-3 top-3 rounded bg-tomato px-2.5 py-1 font-heading text-[0.68rem] font-extrabold uppercase tracking-wider text-white">
            {p.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-3xl uppercase tracking-wide">{p.name}</h3>
        <ul className="mt-4 flex-1 space-y-2 text-sm text-white/80">
          {parts.map((part) => (
            <li key={part} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mustard" aria-hidden="true" />
              {part}
            </li>
          ))}
        </ul>
        <p className="mt-6 font-display text-4xl tracking-wide text-mustard">{formatBRL(toCents(p.price))}</p>
        <div className="mt-4">
          <AddButton product={p} className="btn btn-primary w-full" />
        </div>
      </div>
    </article>
  );
}

export function Combos() {
  const combos = site.products.filter((p) => p.category === 'combos');
  return (
    <section id="combos" className="bg-mustard px-5 py-20 md:py-28" aria-labelledby="combos-titulo">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="combos-titulo" title={site.texts.combos.title} subtitle={site.texts.combos.subtitle} brush="text-tomato" />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {combos.map((c) => (
            <ComboCard key={c.id} id={c.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
