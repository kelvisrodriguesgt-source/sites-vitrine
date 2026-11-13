import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

/** Janela modal acessível: foco preso, Esc fecha, fundo travado e foco devolvido ao fechar. */
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`fade-up relative flex max-h-[92dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl border border-line bg-coal text-snow shadow-card outline-none sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
          <h2 id={titleId} className="font-display text-xl font-extrabold tracking-tight">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
