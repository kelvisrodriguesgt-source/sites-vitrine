import { Play } from 'lucide-react';
import { useCallback, useState } from 'react';
import { site } from '../config/site';
import { scheduleLink } from '../lib/whatsapp';
import { Eyebrow, PillButton, Rich, TextLink } from './ui';
import { VideoModal } from './VideoModal';

export function Hero() {
  const { texts, images } = site;
  const t = texts.hero;
  const [video, setVideo] = useState(false);
  const closeVideo = useCallback(() => setVideo(false), []);

  return (
    <section id="inicio" aria-labelledby="hero-title" className="plate min-h-[calc(100svh-1rem)] bg-navy text-white sm:min-h-[calc(100svh-1.5rem)]">
      <picture>
        <source media="(max-width: 767px)" srcSet={images.heroMobile} />
        <img
          src={images.hero}
          alt={images.heroAlt}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-navy/25 to-abyss/45" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[calc(100svh-1rem)] flex-col justify-end px-5 pb-8 pt-32 sm:min-h-[calc(100svh-1.5rem)] sm:px-12 sm:pb-14 lg:px-16">
        <div className="bubble fade-up fade-up-3 absolute right-4 top-24 max-w-[13rem] px-5 py-3 text-xs leading-snug sm:right-10 sm:top-32 sm:max-w-xs sm:text-sm lg:right-16">
          {t.bubble}
        </div>

        <div className="max-w-4xl">
          <Eyebrow className="fade-up text-champagne">{t.eyebrow}</Eyebrow>
          <h1 id="hero-title" className="font-title fade-up fade-up-1 mt-5 text-[3.4rem] sm:text-8xl lg:text-[8.5rem]">
            <span className="sr-only">{t.srTitle}. </span>
            <Rich text={t.title} />
          </h1>
          <p className="fade-up fade-up-2 mt-6 max-w-xl text-base font-light leading-relaxed text-white/85 sm:text-lg">{t.subtitle}</p>
          <div className="fade-up fade-up-3 mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PillButton href={scheduleLink(site.contact)} external tone="champagne">
              {t.primary}
            </PillButton>
            <TextLink href="#a-clinica">{t.secondary}</TextLink>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVideo(true)}
          aria-label={`${t.videoLabel}: abrir vídeo`}
          className="glass fade-up fade-up-3 group mt-10 flex w-full max-w-sm items-center gap-4 p-3 text-left transition hover:bg-white/20 lg:absolute lg:bottom-16 lg:right-16 lg:mt-0 lg:w-72"
        >
          <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl">
            <img src={images.reception} alt="" width={1600} height={900} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-navy/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne text-navy transition group-hover:scale-110">
                <Play size={14} strokeWidth={2} fill="currentColor" />
              </span>
            </span>
          </span>
          <span className="eyebrow leading-relaxed">{t.videoLabel}</span>
        </button>

        <p aria-hidden="true" className="eyebrow absolute bottom-5 right-16 hidden items-center gap-3 text-white/70 lg:flex">
          <span className="text-white">01</span>
          <span>02</span>
          <span>03</span>
        </p>
      </div>
      <VideoModal open={video} onClose={closeVideo} />
    </section>
  );
}
