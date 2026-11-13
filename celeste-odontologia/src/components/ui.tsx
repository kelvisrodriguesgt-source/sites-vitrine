import {
  ArrowRight,
  Award,
  CalendarCheck,
  Clock,
  ClipboardList,
  Cpu,
  Gem,
  Heart,
  Layers,
  MessageCircle,
  Radiation,
  Scan,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
  type LucideIcon
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { IconName } from '../config/types';
import { parseRich } from '../lib/rich';

const ICONS: Record<IconName, LucideIcon> = {
  sparkles: Sparkles,
  implant: Gem,
  braces: Layers,
  shield: Shield,
  cpu: Cpu,
  users: Users,
  heart: Heart,
  scan: Scan,
  xray: Radiation,
  smile: Smile,
  calendar: CalendarCheck,
  message: MessageCircle,
  clipboard: ClipboardList,
  clock: Clock,
  award: Award,
  stethoscope: Stethoscope
};

/** Ícone de linha fina dentro de um círculo. */
export function RingIcon({ name, tone = 'light', className = '' }: { name: IconName; tone?: 'light' | 'dark'; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return (
    <span className={`icon-ring ${tone === 'light' ? 'border-white/40' : 'border-navy/30'} ${className}`} aria-hidden="true">
      <Cmp size={22} strokeWidth={1.25} />
    </span>
  );
}

export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.94 9.94 0 1 0 12.04 2Zm0 1.8a8.14 8.14 0 1 1-4.15 15.14l-.3-.18-3.1.82.83-3.02-.2-.31A8.14 8.14 0 0 1 12.04 3.8Zm-3.2 4.1c-.17 0-.45.06-.69.32-.23.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.45 3.9 2.2.87 2.65.7 3.12.65.48-.04 1.54-.63 1.76-1.24.22-.6.22-1.13.15-1.24-.06-.1-.23-.17-.49-.3-.26-.13-1.54-.76-1.78-.85-.23-.08-.4-.13-.58.13-.17.26-.67.85-.82 1.02-.15.18-.3.2-.56.07-.26-.13-1.1-.4-2.09-1.29-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.18.04-.33-.02-.46-.07-.13-.58-1.4-.8-1.9-.2-.5-.4-.43-.58-.44h-.5Z" />
    </svg>
  );
}

/** Texto com trechos em itálico marcados por *asteriscos*. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {parseRich(text).map((p, i) =>
        p.italic ? (
          <em key={`${i}-${p.text}`} className="font-medium italic">
            {p.text}
          </em>
        ) : (
          <span key={`${i}-${p.text}`}>{p.text}</span>
        )
      )}
    </>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

// Nomes completos no código: o Tailwind só mantém as classes que encontra escritas por inteiro.
const TONE_CLASS = { champagne: 'btn-champagne', white: 'btn-white', navy: 'btn-navy' } as const;

interface PillProps {
  href: string;
  children: ReactNode;
  tone?: 'champagne' | 'white' | 'navy';
  external?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Botão principal: pílula com círculo e seta (a seta desliza e gira no hover). */
export function PillButton({ href, children, tone = 'champagne', external = false, className = '', onClick }: PillProps) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a href={href} className={`group btn-pill ${TONE_CLASS[tone]} ${className}`} onClick={onClick} {...ext}>
      <span>{children}</span>
      <span className="btn-dot" aria-hidden="true">
        <ArrowRight size={16} strokeWidth={1.5} className="btn-arrow" />
      </span>
    </a>
  );
}

/** Botão secundário: só texto com sublinhado fino. */
export function TextLink({ href, children, external = false, className = '' }: { href: string; children: ReactNode; external?: boolean; className?: string }) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a href={href} className={`text-link ${className}`} {...ext}>
      {children}
    </a>
  );
}

export function Logo({ name, segment, className = '' }: { name: string; segment: string; className?: string }) {
  const first = name.split(' ')[0] ?? name;
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-serif text-[1.6rem] font-semibold uppercase tracking-[0.3em]">{first}</span>
      <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.42em] opacity-80">{segment}</span>
    </span>
  );
}
