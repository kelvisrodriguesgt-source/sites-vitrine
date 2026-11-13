import { Check, Package, Sandwich, Utensils, CupSoda, IceCreamCone, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import type { IconName, Product } from '../config/types';
import { useCart } from '../context/CartContext';
import { isAvailable } from '../shared/catalog';
import { useReveal } from '../hooks/useReveal';
import { formatBRL, toCents } from '../lib/money';
import { BrushStroke } from './icons';

const ICONS: Record<IconName, typeof Package> = {
  sandwich: Sandwich,
  utensils: Utensils,
  cup: CupSoda,
  'ice-cream': IceCreamCone,
  package: Package
};

export function AddButton({ product, className = 'btn btn-tomato w-full' }: { product: Product; className?: string }) {
  const { add, items } = useCart();
  const [done, setDone] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const qty = items[product.id] ?? 0;
  if (!isAvailable(product)) {
    return (
      <button type="button" disabled className={`${className} cursor-not-allowed opacity-60`} aria-label={`${product.name} está indisponível no momento`}>
        <span>INDISPONÍVEL</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={`Adicionar ${product.name} ao pedido${qty ? ` (${qty} no pedido)` : ''}`}
      onClick={() => {
        add(product.id);
        setDone(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDone(false), 1300);
      }}
    >
      {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
      <span>{done ? 'ADICIONADO' : 'ADICIONAR AO PEDIDO'}</span>
      {qty > 0 && !done && <span className="rounded bg-black/20 px-1.5 text-xs">{qty}</span>}
    </button>
  );
}

/** Bloco de marca para itens ainda sem fotografia. */
function BrandTile({ product }: { product: Product }) {
  const category = site.categories.find((c) => c.id === product.category);
  const Icon = ICONS[category?.icon ?? 'utensils'];
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-wine">
      <BrushStroke className="absolute -left-4 top-1/2 h-24 w-[120%] -translate-y-1/2 -rotate-6 text-tomato/70" />
      <Icon className="relative h-16 w-16 text-mustard" strokeWidth={1.6} aria-hidden="true" />
      <span className="absolute bottom-3 left-4 font-display text-lg uppercase tracking-wider text-cream/80">
        {category?.label}
      </span>
    </div>
  );
}

interface Props {
  product: Product;
  tone?: 'light' | 'dark';
  priority?: boolean;
}

export function ProductCard({ product, tone = 'light', priority = false }: Props) {
  const ref = useReveal<HTMLElement>();
  const dark = tone === 'dark';
  const available = isAvailable(product);
  return (
    <article
      ref={ref}
      className={`group flex flex-col overflow-hidden rounded-lg transition duration-300 hover:-translate-y-1 ${
        dark ? 'bg-[#2e211e] text-white hover:shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8)]' : 'bg-white text-char shadow-card hover:shadow-[0_18px_40px_-14px_rgb(33_23_21/0.45)]'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-wine">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt ?? product.name}
            width={800}
            height={600}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${product.imagePosition ?? ''} ${available ? '' : 'grayscale opacity-60'}`}
          />
        ) : (
          <BrandTile product={product} />
        )}
        {!available && (
          <span className="absolute inset-0 flex items-center justify-center bg-char/55">
            <span className="rounded bg-white px-3 py-1.5 font-heading text-xs font-extrabold uppercase tracking-wider text-char">Indisponível</span>
          </span>
        )}
        {available && product.badge && (
          <span className="absolute left-3 top-3 rounded bg-mustard px-2.5 py-1 font-heading text-[0.68rem] font-extrabold uppercase tracking-wider text-char">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-extrabold uppercase leading-tight">{product.name}</h3>
        <p className={`mt-2 flex-1 text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-char/70'}`}>{product.description}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <span className={`font-heading text-2xl font-extrabold ${dark ? 'text-mustard' : 'text-tomato'}`}>
            {formatBRL(toCents(product.price))}
          </span>
        </div>
        <div className="mt-4">
          <AddButton product={product} className={`btn w-full ${dark ? 'btn-primary' : 'btn-tomato'}`} />
        </div>
      </div>
    </article>
  );
}
