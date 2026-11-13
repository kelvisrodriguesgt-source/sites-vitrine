import { Plus } from 'lucide-react';
import { site } from '../config/site';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';
import { singleKey } from '../lib/cart';
import { formatBRL, toCents } from '../lib/money';
import { SectionHeading } from './SectionHeading';

export function Promos() {
  const { products } = useCatalog();
  const { add } = useCart();
  const ref = useReveal<HTMLDivElement>();
  const { promos } = site.texts;
  // Banner sem combo correspondente (removido no painel) não aparece.
  const banners = promos.items.map((b) => ({ banner: b, product: products.find((p) => p.id === b.productId) })).filter((x) => x.product);
  if (banners.length === 0) return null;

  return (
    <section id="promocoes" aria-labelledby="promocoes-titulo" className="py-20 sm:py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Promoções" title={promos.title} subtitle={promos.subtitle} id="promocoes-titulo" />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {banners.map(({ banner, product }, i) => (
            <li key={banner.id} className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-ink p-6">
              <img src={site.images.pepperoni[(i * 2) % site.images.pepperoni.length]} alt="" width={120} height={120} loading="lazy" decoding="async" aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 w-28 rotate-12 opacity-90" />
              <img src={site.images.pepperoni[(i * 2 + 3) % site.images.pepperoni.length]} alt="" width={120} height={120} loading="lazy" decoding="async" aria-hidden="true" className="pointer-events-none absolute -bottom-8 right-14 w-20 -rotate-12 opacity-40" />
              <div className="relative">
                <p className="eyebrow">Combo</p>
                <h3 className="title-display mt-2 max-w-[11ch] text-2xl">{banner.title}</h3>
                <p className="mt-2 max-w-[18rem] text-sm text-ash">{banner.text}</p>
              </div>
              <div className="relative mt-6 flex items-end justify-between gap-3">
                <p className="text-2xl font-extrabold">{formatBRL(toCents((product as NonNullable<typeof product>).price))}</p>
                <button type="button" onClick={() => add(singleKey((product as NonNullable<typeof product>).id), banner.title)} disabled={product?.available === false} className="btn btn-red px-5">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {banner.cta}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
