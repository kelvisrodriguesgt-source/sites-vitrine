import { CupSoda, IceCreamCone, Package, Pizza, Sandwich, Cookie, CakeSlice, Utensils } from 'lucide-react';
import { useRef, useState } from 'react';
import { site } from '../config/site';
import type { IconName, Product, SizeId } from '../config/types';
import { useCart } from '../context/CartContext';
import { singleKey, lineName } from '../lib/cart';
import { fromCents, hasSizes, isHalfEligible, sizeOf } from '../lib/menu';
import { formatBRL, toCents } from '../lib/money';
import { SizePicker } from './SizePicker';

const ICONS: Record<IconName, typeof Package> = {
  pizza: Pizza,
  cake: CakeSlice,
  cookie: Cookie,
  sandwich: Sandwich,
  utensils: Utensils,
  cup: CupSoda,
  'ice-cream': IceCreamCone,
  package: Package
};

/** Foto do produto ou, sem foto, o cartão provisório da marca. */
function Visual({ product, className }: { product: Product; className: string }) {
  const off = product.available === false;
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.imageAlt ?? product.name}
        width={600}
        height={600}
        loading="lazy"
        decoding="async"
        className={`${className} object-contain ${off ? 'opacity-50 grayscale' : ''}`}
      />
    );
  }
  const Icon = ICONS[site.categories.find((c) => c.id === product.category)?.icon ?? 'utensils'];
  return (
    <span className={`${className} flex items-center justify-center rounded-full bg-gradient-to-br from-line to-coal ring-1 ring-line ${off ? 'opacity-50' : ''}`} aria-hidden="true">
      <Icon className="h-1/3 w-1/3 text-ember" strokeWidth={1.4} />
    </span>
  );
}

interface Props {
  product: Product;
  onHalf: (product: Product) => void;
}

export function ProductCard({ product, onHalf }: Props) {
  const { add } = useCart();
  const sized = hasSizes(product);
  const [size, setSize] = useState<SizeId | undefined>(undefined);
  const [hint, setHint] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const off = product.available === false;
  const chosen = sizeOf(product, size);
  const priceCents = chosen ? toCents(chosen.price) : fromCents(product);
  const canHalf = isHalfEligible(product, site.halfAndHalf);

  const addToCart = () => {
    if (off) return;
    if (sized && !chosen) {
      setHint(true);
      picker.current?.querySelector('button')?.focus();
      return;
    }
    add(singleKey(product.id, chosen?.id), lineName(product, chosen));
  };

  return (
    <li className="relative mt-20 flex flex-col rounded-2xl border border-line bg-card px-5 pb-5 pt-28 text-center shadow-card sm:mt-24 sm:pt-32 max-sm:mt-0 max-sm:grid max-sm:grid-cols-[6.5rem_1fr] max-sm:items-center max-sm:gap-x-4 max-sm:p-4 max-sm:text-left">
      {product.badge && !off && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-ember px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-ink max-sm:left-auto max-sm:right-4">{product.badge}</span>
      )}
      <div className="pointer-events-none absolute -top-16 left-1/2 w-44 -translate-x-1/2 sm:-top-20 sm:w-52 max-sm:static max-sm:w-[6.5rem] max-sm:translate-x-0 max-sm:self-start">
        <Visual product={product} className="block aspect-square w-full drop-shadow-[0_14px_16px_rgb(0_0_0/0.55)]" />
      </div>

      <div className="max-sm:col-start-2 max-sm:row-start-1">
        <h3 className="text-lg font-extrabold leading-tight">{product.name}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-ash">{product.description}</p>
      </div>

      <div className="mt-auto pt-4 max-sm:col-span-2">
        {sized && (
          <>
            <SizePicker
              ref={picker}
              product={product}
              value={size}
              onChange={(s) => {
                setSize(s);
                setHint(false);
              }}
              invalid={hint}
            />
            <p className={`mt-2 min-h-5 text-xs ${hint ? 'font-bold text-ember' : 'text-ash'}`} aria-live="polite">
              {chosen ? `${chosen.label} · ${chosen.slices} fatias` : hint ? 'Escolha o tamanho' : 'Escolha o tamanho'}
            </p>
          </>
        )}
        <p className="mt-2 flex items-baseline justify-center gap-1.5 max-sm:justify-start">
          {sized && !chosen && <span className="text-xs text-ash">a partir de</span>}
          <span className="text-xl font-extrabold">{formatBRL(priceCents)}</span>
        </p>
        <button type="button" onClick={addToCart} disabled={off} className="btn btn-red mt-3 w-full">
          {off ? 'Indisponível' : 'Adicionar ao carrinho'}
        </button>
        {canHalf && (
          <button type="button" onClick={() => onHalf(product)} className="mt-1 inline-flex min-h-11 items-center px-3 text-sm font-semibold text-ember underline-offset-4 hover:underline">
            {site.texts.menu.halfCta}
          </button>
        )}
      </div>
    </li>
  );
}
