import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: 'dark' | 'light';
  align?: 'center' | 'left';
  id?: string;
  children?: ReactNode;
}

export function SectionHead({ eyebrow, title, subtitle, tone = 'dark', align = 'center', id, children }: Props) {
  const center = align === 'center';
  return (
    <header className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      {eyebrow && <p className={`eyebrow ${tone === 'light' ? '!text-champagne' : ''}`}>{eyebrow}</p>}
      <h2 id={id} className={`title-main mt-4 text-[2.1rem] sm:text-5xl ${tone === 'light' ? 'text-offwhite' : 'text-cocoa'}`}>
        {title}
      </h2>
      <span className={`rule mt-6 ${center ? '' : '!mx-0'}`} />
      {subtitle && <p className={`mt-6 text-base leading-relaxed sm:text-lg ${tone === 'light' ? 'text-offwhite/80' : 'text-taupe'}`}>{subtitle}</p>}
      {children}
    </header>
  );
}
