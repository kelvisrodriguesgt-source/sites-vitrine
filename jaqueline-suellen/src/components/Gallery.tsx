import { site } from '../config/site';
import { Photo } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function Gallery() {
  const t = site.texts;
  return (
    <section id="resultados" aria-labelledby="resultados-title" className="section-y bg-offwhite">
      <div className="container-x">
        <Reveal>
          <SectionHead id="resultados-title" eyebrow={t.galleryEyebrow} title={t.galleryTitle} />
        </Reveal>
        {/* Colunas com proporções diferentes (1:1, 4:5, 3:4, 4:3): composição de revista, sem cortar as fotos. */}
        <div className="mt-14 columns-2 gap-4 sm:gap-6 lg:columns-3">
          {site.gallery.map((item, i) => (
            <Reveal key={`${item.image.file}-${i}`} className="mb-4 break-inside-avoid sm:mb-6">
              <Photo slot={{ ...item.image, ratio: item.ratio }} className="rounded-2xl shadow-soft" label={`Foto · ${item.image.file}`} />
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-taupe/80">{t.galleryNote}</p>
      </div>
    </section>
  );
}
