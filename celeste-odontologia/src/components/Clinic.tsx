import { useSite } from '../context/SiteContext';
import { useReveal } from '../hooks/useReveal';
import { Eyebrow, RingIcon, Rich } from './ui';

export function Clinic() {
  const site = useSite();
  const { differentials, texts, images } = site;
  const t = texts.clinic;
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="a-clinica" aria-labelledby="clinica-title" className="plate bg-navy px-5 py-16 text-white sm:px-12 sm:py-24 lg:px-16">
      <img src={images.reception} alt="" width={1600} height={900} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy/85" aria-hidden="true" />
      <div ref={reveal} className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Eyebrow className="text-champagne">{t.eyebrow}</Eyebrow>
          <h2 id="clinica-title" className="font-title mt-4 max-w-xl text-4xl sm:text-6xl">
            {t.title}
          </h2>
          <ul className="mt-10 space-y-7">
            {differentials.map((d) => (
              <li key={d.title} className="flex items-start gap-5">
                <RingIcon name={d.icon} />
                <div>
                  <h3 className="font-serif text-2xl font-medium">{d.title}</h3>
                  <p className="mt-1 max-w-md font-light leading-relaxed text-white/75">{d.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="font-title mt-12 text-3xl text-champagne sm:text-4xl">
            <Rich text={t.quote} />
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-md">
          <div className="aspect-square overflow-hidden rounded-full border border-white/25 p-2">
            <img src={images.clinicRoom} alt={images.clinicRoomAlt} width={900} height={900} loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover" />
          </div>
          <figcaption className="bubble absolute -bottom-3 left-1/2 w-max max-w-[90%] -translate-x-1/2 px-5 py-2.5 text-center text-xs sm:text-sm">{t.roomCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
