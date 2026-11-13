import { Check, X } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { type OrderStatus, statusLabel } from '../shared/orders';
import type { OrderType } from '../lib/whatsapp';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  /** center: janela no meio (folha inferior no celular). side: painel lateral. */
  variant?: 'center' | 'side';
  maxWidth?: string;
  children: ReactNode;
}

/** Janela modal acessível: foco preso, Esc fecha, rolagem do fundo travada, foco devolvido ao fechar. */
export function Dialog({ open, onClose, label, variant = 'center', maxWidth = 'max-w-lg', children }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current;
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      const a = nodes[0];
      const b = nodes[nodes.length - 1];
      if (!a || !b) return;
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  const side = variant === 'side';
  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <button type="button" tabIndex={-1} aria-label="Fechar" onClick={onClose} className="a-fade absolute inset-0 cursor-default bg-char/65 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative flex w-full flex-col overflow-hidden bg-paper outline-none shadow-pop ${
          side
            ? `a-slide ml-auto h-full ${maxWidth}`
            : `a-rise sm:a-pop mt-auto max-h-[92dvh] rounded-t-3xl sm:m-auto sm:rounded-2xl ${maxWidth}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ title, subtitle, onClose }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-char/10 bg-white px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-extrabold leading-tight">{title}</h2>
        {subtitle && <div className="mt-1 text-sm text-char/65">{subtitle}</div>}
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar" className="a-icon-btn -mr-2 shrink-0">
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  text: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, text, confirmLabel, danger = true, onConfirm, onClose }: ConfirmProps) {
  return (
    <Dialog open={open} onClose={onClose} label={title} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="font-heading text-xl font-extrabold">{title}</h2>
        <div className="mt-2 text-char/75">{text}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" data-autofocus onClick={onClose} className="a-btn a-btn-ghost">
            Voltar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`a-btn ${danger ? 'a-btn-danger' : 'a-btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function Switch({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${checked ? 'bg-emerald-600' : 'bg-char/25'}`}
    >
      <span className={`absolute left-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}>
        {checked && <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />}
      </span>
    </button>
  );
}

const BADGE: Record<OrderStatus, string> = {
  novo: 'bg-tomato text-white',
  preparo: 'bg-mustard text-char',
  pronto: 'bg-sky-100 text-sky-900',
  concluido: 'bg-emerald-100 text-emerald-900',
  cancelado: 'bg-wine/10 text-wine'
};

export function StatusBadge({ status, type }: { status: OrderStatus; type: OrderType }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 font-heading text-xs font-extrabold ${BADGE[status]}`}>
      {statusLabel(status, type)}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-char/10 text-char/55">{icon}</span>
      <p className="font-heading text-lg font-extrabold">{title}</p>
      {text && <p className="max-w-sm text-char/65">{text}</p>}
      {action}
    </div>
  );
}

/* ---------- Avisos (toasts) ---------- */

interface ToastItem {
  id: number;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: 'ok' | 'error';
}
interface ToastApi {
  push: (text: string, opts?: { actionLabel?: string; onAction?: () => void; ms?: number; tone?: 'ok' | 'error' }) => void;
}
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback<ToastApi['push']>(
    (text, opts = {}) => {
      const id = ++seq.current;
      setItems((l) => [...l.slice(-2), { id, text, actionLabel: opts.actionLabel, onAction: opts.onAction, tone: opts.tone ?? 'ok' }]);
      window.setTimeout(() => dismiss(id), opts.ms ?? 4000);
    },
    [dismiss]
  );
  const api = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {items.map((t) => (
          <div key={t.id} role="status" className={`a-pop pointer-events-auto flex max-w-md items-center gap-3 rounded-xl py-2.5 pl-4 pr-2 text-sm font-semibold text-white shadow-pop ${t.tone === 'error' ? 'bg-wine' : 'bg-char'}`}>
            <span>{t.text}</span>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="rounded-lg px-3 py-2 font-heading font-extrabold uppercase tracking-wide text-mustard hover:bg-white/10"
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
