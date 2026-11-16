import { site } from '../config/site';
import { Photo } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { InstagramIcon } from './icons';

export function InstagramGrid() {
  const t = site.texts;
  return (
    <section id="instagram" aria-labelledby="instagram-title" className="section-y bg-offwhite">
      <div className="container-x">
        <Reveal>
          <SectionHead id="instagram-title" eyebrow={t.instagramEyebrow} title={t.instagramTitle} subtitle={t.instagramSubtitle} />
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {site.instagramTiles.map((slot, i) => (
            <li key={`${slot.file}-${i}`}>
              <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver publicações no Instagram ${site.contact.instagramHandle}`} className="group relative block overflow-hidden rounded-2xl">
                <Photo slot={{ ...slot, ratio: '1/1' }} className="transition duration-700 group-hover:scale-105" label={`Foto · ${slot.file}`} />
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-cocoa/0 text-offwhite opacity-0 transition duration-300 group-hover:bg-cocoa/35 group-hover:opacity-100 group-focus-visible:bg-cocoa/35 group-focus-visible:opacity-100">
                  <InstagramIcon className="size-7" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <InstagramIcon className="size-4" />
            {t.instagramCta}
          </a>
          <p className="mt-5 text-xs text-taupe/70">{t.instagramNote}</p>
        </div>
      </div>
    </section>
  );
}
