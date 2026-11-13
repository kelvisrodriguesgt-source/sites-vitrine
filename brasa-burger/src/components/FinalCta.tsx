import { ArrowRight } from 'lucide-react';
import { site } from '../config/site';
import { useCart } from '../context/CartContext';
import { BrushStroke } from './icons';

export function FinalCta() {
  const { finalCta } = site.texts;
  const { totals, openCart } = useCart();
  return (
    <section className="relative isolate overflow-hidden bg-char px-5 py-28 text-center text-white md:py-36" aria-labelledby="chamada-final">
      <img
        src={site.images.finalCta}
        alt=""
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[80%_50%]"
      />
      <div className="absolute inset-0 -z-10 bg-char/75" />
      <div className="mx-auto max-w-3xl">
        <h2 id="chamada-final" className="font-display text-5xl uppercase leading-[1] tracking-wide sm:text-6xl lg:text-7xl">
          {finalCta.title}
        </h2>
        <BrushStroke className="mx-auto mt-5 h-3 w-44 text-mustard" />
        <p className="mt-6 text-xl text-white/85">{finalCta.subtitle}</p>
        <a
          href="#cardapio"
          onClick={(e) => {
            if (totals.count > 0) {
              e.preventDefault();
              openCart();
            }
          }}
          className="btn btn-primary mt-10 !min-h-16 !px-12 !text-lg"
        >
          {finalCta.cta}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
