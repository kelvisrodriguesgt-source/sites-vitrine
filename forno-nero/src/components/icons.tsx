import type { SVGProps } from 'react';

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.03l-.3-.18-3.1.82.83-3.02-.2-.31A8.1 8.1 0 0 1 12.04 3.8Zm-3.3 4.1c-.17 0-.45.06-.68.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.43 3.9 2.2.87 2.64.7 3.12.65.48-.04 1.54-.63 1.76-1.24.22-.6.22-1.13.15-1.24-.06-.11-.24-.17-.5-.3-.26-.13-1.54-.76-1.78-.85-.24-.09-.4-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.4-2.1-1.3-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.4-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.58-1.42-.8-1.94-.21-.5-.43-.43-.58-.44h-.5Z" />
    </svg>
  );
}

/** Seta curva desenhada à mão (decorativa). */
export function HandArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 12c22-8 56-4 72 18 8 11 8 24 2 34" />
      <path d="M64 56l16 16 14-18" />
    </svg>
  );
}
