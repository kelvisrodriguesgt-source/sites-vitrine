import { CupSoda, IceCreamCone, Package, Sandwich, Utensils } from 'lucide-react';
import { site } from '../../config/site';
import type { IconName, Product } from '../../config/types';
import { isAvailable } from '../../shared/catalog';

const ICONS: Record<IconName, typeof Package> = {
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
        <img src={product.image} alt="" width={400} height={300} loading="lazy" className={`h-full w-full object-cover ${product.imagePosition ?? ''} ${off ? 'grayscale opacity-60' : ''}`} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-wine">
          <Icon className={`h-12 w-12 ${off ? 'text-mustard/40' : 'text-mustard'}`} strokeWidth={1.6} aria-hidden="true" />
        </div>
      )}
      {product.badge && isAvailable(product) && (
        <span className="absolute left-2.5 top-2.5 rounded bg-mustard px-2 py-0.5 font-heading text-[0.62rem] font-extrabold uppercase tracking-wider text-char">{product.badge}</span>
      )}
    </>
  );
}
