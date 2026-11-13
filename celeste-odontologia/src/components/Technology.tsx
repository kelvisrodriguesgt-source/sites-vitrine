import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { Eyebrow, RingIcon, Rich } from './ui';

export function Technology() {
  const { technology, texts, images } = site;
  const t = texts.technology;
  const reveal = useReveal<HTMLDivElement>();
  const side = technology.slice(0, 2);
  const onPhoto = technology.slice(2);

  return (
    <section id="tecnologia" aria-labelledby="tecnologia-title" className="plate bg-navy px-5 py-16 text-white sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal}>
        <div className="max-w-2xl">
          <Eyebrow className="text-champagne">{t.eyebrow}</Eyebrow>
          <h2 id="tecnologia-title" className="font-title mt-4 text-4xl sm:text-6xl">
            <Rich text={t.title} />
          </h2>
          <p className="mt-5 max-w-xl font-light leading-relaxed text-white/75">{t.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="plate relative min-h-[22rem] bg-ocean lg:col-span-7 lg:min-h-[34rem]">
            <img src={images.technology} alt={images.technologyAlt} width={900} height={675} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss/75 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-3 bottom-3 space-y-3 sm:inset-x-5 sm:bottom-5">
              {onPhoto.map((item) => (
                <article key={item.id} className="glass flex items-start gap-4 p-5 sm:max-w-md">
                  <RingIcon name={item.icon} />
                  <div>
                    <h3 className="font-serif text-2xl font-medium">{item.title}</h3>
                    <p className="mt-1 text-sm font-light leading-relaxed text-white/85">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:col-span-5">
            {side.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/15 bg-ocean/60 p-7 sm:p-9">
                <RingIcon name={item.icon} />
                <h3 className="font-title mt-6 text-3xl sm:text-4xl">{item.title}</h3>
                <p className="mt-3 max-w-sm font-light leading-relaxed text-white/75">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
