import { PizzaIcon, Search } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { site } from '../config/site';
import type { Product } from '../config/types';
import { useCatalog } from '../context/CatalogContext';
import { matchesQuery } from '../lib/menu';
import { HalfModal } from './HalfModal';
import { ProductCard } from './ProductCard';
import { SectionHeading } from './SectionHeading';

const INITIAL = 6;

export function MenuSection() {
  const { products } = useCatalog();
  const { texts } = site;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');
  const [expanded, setExpanded] = useState(false);
  const [half, setHalf] = useState<{ open: boolean; initial: Product | null }>({ open: false, initial: null });

  const found = useMemo(() => products.filter((p) => matchesQuery(p, query)), [products, query]);
  const chips = useMemo(() => {
    const list = site.categories
      .map((c) => ({ id: c.id, label: c.label, count: found.filter((p) => p.category === c.id).length }))
      .filter((c) => c.count > 0 || (!query.trim() && products.some((p) => p.category === c.id)));
    return [{ id: 'todos', label: 'Todos', count: found.length }, ...list];
  }, [found, products, query]);

  const activeId = chips.some((c) => c.id === category) ? category : 'todos';
  const inCategory = activeId === 'todos' ? found : found.filter((p) => p.category === activeId);
  // Em "Todos", mostra os primeiros itens e o botão para abrir o cardápio inteiro (ordem das categorias).
  const ordered = useMemo(() => {
    if (activeId !== 'todos') return inCategory;
    const rank = new Map(site.categories.map((c, i) => [c.id, i]));
    return [...inCategory].sort((a, b) => (rank.get(a.category) ?? 99) - (rank.get(b.category) ?? 99));
  }, [inCategory, activeId]);
  const limited = activeId === 'todos' && !expanded && !query.trim();
  const shown = limited ? ordered.slice(0, INITIAL) : ordered;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    document.getElementById('itens')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="cardapio" aria-labelledby="cardapio-titulo" className="relative -mt-4 pb-24 pt-28 sm:pt-36 lg:pt-52">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-coal [clip-path:polygon(0_5%,100%_0,100%_95%,0_100%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Cardápio" title={texts.menu.title} subtitle={texts.menu.subtitle} id="cardapio-titulo" />
          {site.halfAndHalf.enabled && (
            <button type="button" onClick={() => setHalf({ open: true, initial: null })} className="btn btn-outline">
              <PizzaIcon className="h-4 w-4" aria-hidden="true" />
              {texts.menu.halfCta}
            </button>
          )}
        </div>

        <form role="search" onSubmit={submit} className="mt-8 flex items-center gap-2 rounded-full bg-[#E9E9E9] p-1.5 pl-5 text-ink">
          <Search className="h-5 w-5 shrink-0 text-ink/60" aria-hidden="true" />
          <label htmlFor="busca" className="sr-only">
            Buscar no cardápio por nome ou ingrediente
          </label>
          <input
            id="busca"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={texts.menu.searchPlaceholder}
            autoComplete="off"
            className="min-h-11 w-full min-w-0 bg-transparent text-base text-ink placeholder:text-ink/55 focus:outline-none"
          />
          <button type="submit" className="btn btn-red min-h-11 shrink-0 px-6">
            {texts.menu.searchButton}
          </button>
        </form>

        <div role="group" aria-label="Categorias" className="no-scrollbar -mx-5 mt-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => {
            const on = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setCategory(c.id);
                  setExpanded(false);
                }}
                className={`min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-5 text-sm font-bold transition ${on ? 'bg-ember text-ink' : 'border border-line bg-card text-snow hover:border-snow'}`}
              >
                {c.label} ({c.count})
              </button>
            );
          })}
        </div>

        <div id="itens" className="scroll-mt-24">
          <p className="sr-only" role="status" aria-live="polite">
            {ordered.length} {ordered.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
          {ordered.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-line bg-card p-8 text-center text-ash">{texts.menu.empty}</p>
          ) : (
            <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} onHalf={(prod) => setHalf({ open: true, initial: prod })} />
              ))}
            </ul>
          )}
          {limited && ordered.length > INITIAL && (
            <div className="mt-10 text-center">
              <button type="button" onClick={() => setExpanded(true)} className="btn btn-outline">
                {texts.menu.expand}
              </button>
            </div>
          )}
        </div>
      </div>
      <HalfModal open={half.open} onClose={() => setHalf((h) => ({ ...h, open: false }))} initial={half.initial} products={products} />
    </section>
  );
}
