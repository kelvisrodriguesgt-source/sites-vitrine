import type { SVGProps } from 'react';

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** Pincelada decorativa (herda a cor do texto). */
export function BrushStroke({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3 24C30 6 70 30 120 18S220 4 270 20 360 30 397 12l-3 16c-30 12-70-4-120 6S150 38 100 30 28 38 5 34Z" />
    </svg>
  );
}
