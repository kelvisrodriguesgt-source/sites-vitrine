import { site } from '../config/site';
import { genericMessage } from '../lib/booking';
import { waLink } from '../lib/whatsapp';
import { Photo } from './Photo';
import { WhatsAppIcon } from './icons';

/** Hero dividido: texto à esquerda, foto colada à direita (no celular, a foto vem primeiro, mais baixa). */
export function Hero() {
  const t = site.texts;
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-offwhite pt-[4.5rem]">
      <div className="flex flex-col lg:grid lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex items-center py-14 sm:py-20 lg:order-first lg:py-24">
          <div className="w-full px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))] lg:pr-14">
            <div className="max-w-xl">
              <p className="hero-in eyebrow [--d:0s]">{t.heroEyebrow}</p>
              <h1 id="hero-title" className="hero-in title-main mt-6 text-[2.6rem] [--d:0.1s] sm:text-6xl lg:text-[4.3rem]">
                {t.heroTitle}
                <span className="sr-only"> — {t.heroSrTitle}</span>
              </h1>
              <span className="hero-in rule mt-8 !mx-0 [--d:0.2s]" />
              <p className="hero-in mt-8 text-base leading-[1.85] text-taupe sm:text-lg [--d:0.3s]">{t.heroSubtitle}</p>
              <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row [--d:0.4s]">
                <a href={waLink(site.contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                  <WhatsAppIcon className="size-4" />
                  {t.heroPrimary}
                </a>
                <a href="#tratamentos" className="btn btn-outline">
                  {t.heroSecondary}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="relative order-first h-72 sm:h-96 lg:order-last lg:h-auto">
          <Photo slot={site.images.hero} fill priority imgClass="object-[85%_center]" label="Foto principal · hero-estetica" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-champagne/40" />
    </section>
  );
}
