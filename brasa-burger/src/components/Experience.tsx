import { Droplet, Flame, Heart, Sprout } from 'lucide-react';
import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

const ICONS = { sprout: Sprout, flame: Flame, droplet: Droplet, heart: Heart };

export function Experience() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="diferenciais" className="relative isolate overflow-hidden bg-char px-5 py-24 text-white md:py-32">
      <img
        src={site.images.experience}
        alt=""
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-char/85" />
      <div className="mx-auto max-w-7xl">
        <SectionHeading tone="dark" title={site.texts.experience.title} subtitle={site.texts.experience.subtitle} brush="text-tomato" />
        <div ref={ref} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {site.differentials.map((d) => {
            const Icon = ICONS[d.icon];
            return (
              <div key={d.title} className="rounded-lg border border-white/10 bg-black/35 p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-mustard/60">
                <span className="flex h-14 w-14 items-center justify-center rounded-md bg-mustard text-char">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-extrabold uppercase leading-tight">{d.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{d.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
