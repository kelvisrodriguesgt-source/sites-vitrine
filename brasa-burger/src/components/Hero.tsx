import { ArrowRight, MessageCircle } from 'lucide-react';
import { site } from '../config/site';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { BrushStroke } from './icons';

function Title() {
  const { title, highlight } = site.texts.hero;
  const at = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-mustard">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

export function Hero() {
  const { hero } = site.texts;
  const whatsapp = buildWhatsAppUrl(site.contact.whatsapp, site.contact.greeting);
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-wine text-white md:min-h-[100svh]">
      {/* Mobile: foto em bloco próprio no topo. Desktop: foto ocupa o fundo, burger à direita. */}
      <div className="relative h-[52svh] min-h-[300px] md:absolute md:inset-0 md:-z-10 md:h-auto">
        <picture>
          <source media="(max-width: 767px)" srcSet={site.images.heroMobile} width={900} height={778} />
          <img
            src={site.images.hero}
            alt={site.images.heroAlt}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[50%_60%] md:object-[78%_50%]"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-wine to-transparent md:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-wine via-wine/80 to-transparent md:block md:w-[68%]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-7xl px-5 pb-14 pt-2 md:min-h-[100svh] md:items-center md:pb-20 md:pt-28">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="eyebrow inline-block text-mustard">{hero.kicker}</p>
          <BrushStroke className="mb-5 mt-2 h-3 w-48 text-tomato" />
          <h1 className="font-display text-[2.85rem] uppercase leading-[0.98] tracking-wide sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
            <Title />
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/85 md:max-w-md md:text-xl">{hero.subtitle}</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href="#cardapio" className="btn btn-primary">
              {hero.primary}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-ghost">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {hero.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
