import { site } from '../config/site';
import { useReveal } from '../hooks/useReveal';
import { Eyebrow, Rich } from './ui';

const initials = (name: string): string =>
  name
    .replace(/^(Dra?\.|Prof\.?)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export function Team() {
  const { team, texts } = site;
  const t = texts.team;
  const reveal = useReveal<HTMLDivElement>();
  if (team.length === 0) return null;

  return (
    <section id="equipe" aria-labelledby="equipe-title" className="plate bg-pearl px-5 py-16 sm:px-12 sm:py-24 lg:px-16">
      <div ref={reveal}>
        <div className="max-w-2xl">
          <Eyebrow className="text-ocean">{t.eyebrow}</Eyebrow>
          <h2 id="equipe-title" className="font-title mt-4 text-4xl sm:text-6xl">
            <Rich text={t.title} />
          </h2>
          <p className="mt-5 max-w-xl font-light leading-relaxed text-ocean">{t.subtitle}</p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <li key={m.name} className="rounded-[28px] bg-frost p-8">
              <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-navy/30 font-serif text-2xl font-medium">
                {initials(m.name)}
              </span>
              <h3 className="font-title mt-6 text-3xl">{m.name}</h3>
              <p className="eyebrow mt-2 text-ocean">{m.specialty}</p>
              {m.cro ? <p className="mt-2 text-sm text-ocean">{m.cro}</p> : null}
              {m.bio ? <p className="mt-4 text-sm font-light leading-relaxed text-ocean">{m.bio}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
