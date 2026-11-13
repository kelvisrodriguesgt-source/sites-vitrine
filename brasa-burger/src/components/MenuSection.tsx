import { type KeyboardEvent, useRef, useState } from 'react';
import { site } from '../config/site';
import { ProductCard } from './ProductCard';
import { SectionHeading } from './SectionHeading';

export function MenuSection() {
  const [active, setActive] = useState(site.categories[0]?.id ?? '');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const products = site.products.filter((p) => p.category === active);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = site.categories.length - 1;
    const next = e.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : -1;
    if (next < 0) return;
    e.preventDefault();
    const category = site.categories[next];
    if (category) setActive(category.id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="cardapio" className="bg-char px-5 py-20 text-white md:py-28" aria-labelledby="cardapio-titulo">
      <div className="mx-auto max-w-7xl">
        <SectionHeading id="cardapio-titulo" tone="dark" title={site.texts.menu.title} subtitle={site.texts.menu.subtitle} brush="text-tomato" />

        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 md:flex-wrap md:justify-center md:overflow-visible"
        >
          {site.categories.map((c, i) => {
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={selected}
                aria-controls="painel-cardapio"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(c.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`min-h-11 shrink-0 rounded-md border-2 px-5 font-heading text-sm font-extrabold uppercase tracking-wide transition duration-200 ${
                  selected
                    ? 'border-mustard bg-mustard text-char'
                    : 'border-white/25 text-white hover:border-mustard hover:text-mustard'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div
          key={active}
          id="painel-cardapio"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="fade-up mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} tone="dark" />
          ))}
        </div>
      </div>
    </section>
  );
}
