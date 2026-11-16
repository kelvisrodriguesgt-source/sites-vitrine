import { site } from '../config/site';

/** Monograma "JS" em círculo fino, desenhado em SVG (herda a cor do texto). */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Monograma ${site.brand.initials}`}>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      <text x="100" y="122" textAnchor="middle" className="font-display" fontSize="78" fontWeight="500" letterSpacing="2" fill="currentColor">
        {site.brand.initials}
      </text>
    </svg>
  );
}
