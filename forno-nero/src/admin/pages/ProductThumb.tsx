import { CakeSlice, Cookie, CupSoda, IceCreamCone, Package, Pizza, Sandwich, Utensils } from 'lucide-react';
import { site } from '../../config/site';
import type { IconName, Product } from '../../config/types';
import { isAvailable } from '../../shared/catalog';

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

/** Foto do produto (ou bloco de marca quando não há foto), usada nos cards do painel e na prévia. */
export function ProductThumb({ product }: { product: Product }) {
  const category = site.categories.find((c) => c.id === product.category);
  const Icon = ICONS[category?.icon ?? 'utensils'];
  const off = !isAvailable(product);
  return (
    <>
      {product.image ? (
        <img src={product.image} alt="" width={400} height={300} loading="lazy" className={`h-full w-full object-contain p-2 ${off ? 'opacity-60 grayscale' : ''}`} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-line to-coal">
          <Icon className={`h-12 w-12 ${off ? 'text-ember/40' : 'text-ember'}`} strokeWidth={1.4} aria-hidden="true" />
        </div>
      )}
      {product.badge && isAvailable(product) && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ember px-2.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider text-ink">{product.badge}</span>
      )}
    </>
  );
}
