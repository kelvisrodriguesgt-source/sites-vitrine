import { site } from '../config/site';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-white ${className}`}>
      <svg viewBox="0 0 24 32" className="h-8 w-6 shrink-0" aria-hidden="true">
        <path
          d="M12 1c1 5 7 8 7 16a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5.3 2 1.2 3 2.2 3.5C10 10 9.5 5 12 1Z"
          fill={site.colors.mustard}
        />
        <path d="M12 16c.8 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.5 1-2.5 3-5.5Z" fill={site.colors.tomato} />
      </svg>
      <span className="font-display text-[1.65rem] uppercase leading-none tracking-wider">{site.brand.name}</span>
    </span>
  );
}
