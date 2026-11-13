import { ArrowDown } from 'lucide-react';
import { site } from '../config/site';
import { useGame } from '../context/GameContext';
import { useParallax } from '../hooks/useParallax';
import { HandArrow } from './icons';

/** Selo ondulado do "Jogar": círculo com borda em ondas, calculado uma vez (determinístico no servidor e no navegador). */
const SEAL_PATH = (() => {
  const pts: string[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 46 + 3.2 * Math.sin(a * 12);
    pts.push(`${i === 0 ? 'M' : 'L'}${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `${pts.join('')}Z`;
})();

/** Posição, tamanho, rotação e profundidade de cada pepperoni voador (o sexto some no celular). */
const PEPPERONIS = [
  { cls: 'left-[4%] top-[22%] w-12 sm:w-16 [--r:20deg] [--d:0s]', speed: -0.18 },
  { cls: 'left-[42%] top-[10%] w-10 sm:w-14 [--r:-35deg] [--d:1.2s]', speed: -0.3 },
  { cls: 'right-[6%] top-[14%] w-14 sm:w-20 [--r:50deg] [--d:0.6s]', speed: -0.12 },
  { cls: 'left-[36%] top-[58%] w-9 sm:w-12 [--r:-10deg] [--d:2s]', speed: -0.24 },
  { cls: 'right-[34%] top-[70%] w-11 sm:w-16 [--r:75deg] [--d:1.6s]', speed: -0.1 },
  { cls: 'hidden sm:block left-[18%] top-[78%] w-12 [--r:5deg] [--d:0.3s]', speed: -0.2 }
] as const;

export function Hero() {
  const { texts, images, game } = site;
  const root = useParallax<HTMLElement>();
  const { openGame } = useGame();
  const [line1, line2] = texts.hero.title.split('\n');

  return (
    <section id="topo" ref={root} className="relative z-10 overflow-x-clip bg-[radial-gradient(ellipse_at_80%_40%,rgb(229_57_53/0.16),transparent_55%)] pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 pb-6 pt-10 sm:px-8 lg:min-h-[640px] lg:grid-cols-2 lg:pb-0 lg:pt-6">
        <div className="relative z-10">
          <h1 className="font-display text-[clamp(3rem,9vw,6rem)] font-extrabold leading-[0.98] tracking-tight">
            <span className="sr-only">{texts.hero.srTitle}. </span>
            <span className="block">{line1}</span>
            {line2 && <span className="block text-ember">{line2}</span>}
          </h1>
          {texts.promoHeroText && <p className="mt-5 max-w-md text-lg text-snow/85">{texts.promoHeroText}</p>}
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <a href="#cardapio" className="btn btn-red">
              {texts.hero.primary}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            {game.enabled && (
              <div className="relative flex items-center gap-3">
                <button type="button" onClick={openGame} aria-label={`${texts.game.seal}: ${texts.game.title}`} className="group relative flex h-24 w-24 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="seal-spin absolute inset-0 h-full w-full transition group-hover:scale-105" aria-hidden="true">
                    <path d={SEAL_PATH} fill={site.colors.ember} />
                  </svg>
                  <span className="relative font-display text-base font-extrabold uppercase text-ink">{texts.game.seal}</span>
                </button>
                <HandArrow className="-ml-1 hidden h-10 w-14 -rotate-12 text-ember sm:block" />
                <p className="max-w-[13rem] text-sm text-ash">{texts.game.text}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative h-[340px] sm:h-[420px] lg:h-[600px]">
          <img
            src={images.hero}
            alt={images.heroAlt}
            width={1500}
            height={1500}
            fetchPriority="high"
            decoding="async"
            className="absolute -right-[18%] top-0 z-0 w-[min(98vw,520px)] max-w-none rotate-[-14deg] translate-y-[4%] drop-shadow-[0_30px_40px_rgb(0_0_0/0.6)] sm:-right-[8%] sm:w-[560px] sm:translate-y-[16%] lg:-right-[10%] lg:w-[700px] lg:translate-y-[30%]"
          />
        </div>
      </div>

      {PEPPERONIS.map((p, i) => (
        <span key={p.cls} data-speed={p.speed} aria-hidden="true" className={`parallax pointer-events-none absolute z-[5] ${p.cls}`}>
          <img src={images.pepperoni[i % images.pepperoni.length]} alt="" width={120} height={120} loading="lazy" decoding="async" className="float h-auto w-full" />
        </span>
      ))}
    </section>
  );
}
