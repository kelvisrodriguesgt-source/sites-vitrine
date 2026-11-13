import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  /** Camada atrás do conteúdo. */
  backdropClassName?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Diálogo acessível: foco preso, Esc fecha, rolagem da página travada e foco devolvido ao fechar. */
export function Dialog({ open, onClose, label, children, className = '', backdropClassName = 'bg-navy/70' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
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
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[60] flex">
      <button type="button" aria-label="Fechar" tabIndex={-1} className={`absolute inset-0 cursor-default backdrop-blur-sm ${backdropClassName}`} onClick={onClose} />
      <div className={`relative ${className}`}>{children}</div>
    </div>
  );
}
