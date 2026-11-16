import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** lucide-react não traz ícones de marcas: estes dois são SVGs próprios. */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2a9.93 9.93 0 0 0-8.5 15.07L2 22l5.07-1.5A9.94 9.94 0 1 0 12.04 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.01.89.9-2.93-.2-.31a8.2 8.2 0 1 1 6.79 3.67Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.1-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.54.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
