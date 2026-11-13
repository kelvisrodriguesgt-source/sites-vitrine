import { site } from '../config/site';

/** Fatia de pizza simplificada. */
export function SliceIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 30 3.6 8.4A18 18 0 0 1 28.4 8.4Z" fill={site.colors.ember} />
      <path d="M3.6 8.4A18 18 0 0 1 28.4 8.4l-1.7 2.9a14.6 14.6 0 0 0-21.4 0Z" fill="#F2B24A" />
      <circle cx="12.5" cy="14.5" r="2.4" fill={site.colors.red} />
      <circle cx="19.5" cy="13.5" r="2.1" fill={site.colors.red} />
      <circle cx="16" cy="20" r="2.2" fill={site.colors.red} />
    </svg>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-snow ${className}`}>
      <SliceIcon />
      <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight">{site.brand.name}</span>
    </span>
  );
}
