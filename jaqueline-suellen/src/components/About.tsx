import { Check } from 'lucide-react';
import { site } from '../config/site';
import { genericMessage } from '../lib/booking';
import { waLink } from '../lib/whatsapp';
import { Photo } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function About() {
  const { about, texts } = site;
  return (
    <section id="profissional" aria-labelledby="profissional-title" className="section-y bg-nude/70">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          <span aria-hidden="true" className="absolute -bottom-4 -right-4 hidden size-full rounded-[2.5rem] border border-champagne/60 sm:block" />
          <Photo slot={site.images.profile} className="relative rounded-[2.5rem] shadow-lift" label="Foto da profissional · jaqueline-perfil" />
        </Reveal>
        <Reveal>
          <SectionHead id="profissional-title" align="left" eyebrow={texts.aboutEyebrow} title={about.title} />
          <div className="mt-8 space-y-5 text-base leading-[1.85] text-cocoa/85 sm:text-[1.05rem]">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Áreas de atuação">
            {about.highlights.map((h) => (
              <li key={h} className="inline-flex items-center gap-2 rounded-full border border-champagne/70 bg-offwhite px-4 py-2 font-sans text-[0.78rem] font-medium uppercase tracking-[0.14em] text-taupe">
                <Check className="size-3.5 text-champagne" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
          <a href={waLink(site.contact.whatsapp, genericMessage(site.brand.professional))} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-10">
            {about.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
