import { site } from '../config/site';

export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const main = tone === 'dark' ? 'text-cocoa' : 'text-offwhite';
  const sub = tone === 'dark' ? 'text-taupe' : 'text-champagne';
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className={`font-display whitespace-nowrap text-[1.2rem] font-semibold uppercase tracking-[0.18em] sm:text-[1.4rem] ${main}`}>{site.brand.professional}</span>
      <span className={`mt-1.5 font-sans text-[0.58rem] font-medium uppercase tracking-[0.34em] sm:text-[0.62rem] ${sub}`}>Estética e bem-estar</span>
    </span>
  );
}
