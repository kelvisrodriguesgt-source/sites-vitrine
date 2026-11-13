import { Check, Info, Lightbulb, X } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import type { IconName } from '../config/types';
import { ICONS } from '../components/ui';

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
      <button type="button" tabIndex={-1} aria-label="Fechar" onClick={onClose} className="a-fade absolute inset-0 cursor-default bg-abyss/65 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative flex w-full flex-col overflow-hidden bg-paper shadow-pop outline-none ${
          side ? `a-slide ml-auto h-full ${maxWidth}` : `a-rise mt-auto max-h-[92dvh] rounded-t-3xl sm:a-pop sm:m-auto sm:rounded-3xl ${maxWidth}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ title, subtitle, onClose }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-navy/10 bg-white px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-serif text-2xl font-semibold leading-tight">{title}</h2>
        {subtitle && <div className="mt-1 text-sm text-navy/65">{subtitle}</div>}
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar" className="a-icon-btn -mr-2">
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  danger = true,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  text: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} label={title} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        <div className="mt-2 text-navy/75">{text}</div>
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
      window.setTimeout(() => dismiss(id), opts.ms ?? 5000);
    },
    [dismiss]
  );
  const api = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {items.map((t) => (
          <div key={t.id} role="status" className={`a-pop pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl py-2.5 pl-4 pr-2 text-sm font-medium text-white shadow-pop ${t.tone === 'error' ? 'bg-rose-800' : 'bg-navy'}`}>
            {t.tone === 'ok' && <Check className="h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />}
            <span>{t.text}</span>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                className="rounded-full px-3 py-2 font-medium uppercase tracking-wide text-champagne hover:bg-white/10"
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

/** Aviso padrão depois de salvar, com atalho para ver o resultado no site. */
export function useSaved(): (ok: boolean, what?: string) => void {
  const toast = useToast();
  return useCallback(
    (ok, what = 'Salvo!') => {
      if (!ok) {
        toast.push('Não foi possível salvar: o espaço do navegador está cheio. Use fotos menores ou clique em "Voltar ao padrão".', { tone: 'error', ms: 9000 });
        return;
      }
      toast.push(`${what} Já aparece no site.`, { actionLabel: 'Ver o site', onAction: () => window.open('/', '_blank', 'noopener') });
    },
    [toast]
  );
}

/* ---------- Formulário ---------- */

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className = '' }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="a-label">
        {label}
      </label>
      <div className="mt-1.5">{children({ id, describedBy, invalid: Boolean(error) })}</div>
      {error ? (
        <p id={errId} role="alert" className="a-err">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="a-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'text' | 'tel' | 'url' | 'numeric';
  autoFocus?: boolean;
  className?: string;
}

export function TextField({ label, value, onChange, hint, error, placeholder, maxLength, inputMode, autoFocus, className }: TextProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          inputMode={inputMode}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`a-input ${invalid ? 'border-rose-600' : ''}`}
        />
      )}
    </Field>
  );
}

interface AreaProps extends Omit<TextProps, 'inputMode' | 'autoFocus'> {
  rows?: number;
}

/** Caixa de texto com contador de caracteres quando há limite. */
export function TextArea({ label, value, onChange, hint, error, placeholder, maxLength, rows = 3, className }: AreaProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <>
          <textarea
            id={id}
            value={value}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            className={`a-input resize-y leading-relaxed ${invalid ? 'border-rose-600' : ''}`}
          />
          {maxLength ? <p className="mt-1 text-right text-xs text-navy/50">{value.length}/{maxLength}</p> : null}
        </>
      )}
    </Field>
  );
}

/* ---------- Estrutura de página ---------- */

export function PageHeader({ title, intro, action }: { title: string; intro?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="a-h1">{title}</h1>
        {intro && <p className="mt-2 text-lg leading-relaxed text-navy/70">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Tip({ children, tone = 'tip' }: { children: ReactNode; tone?: 'tip' | 'warn' }) {
  const Icon = tone === 'tip' ? Lightbulb : Info;
  return (
    <div className={`flex gap-3 rounded-2xl p-4 text-sm leading-relaxed ${tone === 'tip' ? 'bg-champagne/60 text-navy' : 'bg-amber-100 text-amber-950'}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mist text-ocean">{icon}</span>
      <p className="font-serif text-2xl font-semibold">{title}</p>
      {text && <p className="max-w-sm text-navy/65">{text}</p>}
      {action}
    </div>
  );
}

/** Barra fixa no rodapé: aparece só quando há alterações não salvas. */
export function SaveBar({ dirty, onSave, onDiscard, saveLabel = 'Salvar alterações' }: { dirty: boolean; onSave: () => void; onDiscard: () => void; saveLabel?: string }) {
  return (
    <div
      aria-hidden={!dirty}
      className={`fixed inset-x-0 bottom-16 z-40 px-4 transition duration-200 lg:bottom-4 lg:left-64 ${dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full bg-navy py-2 pl-5 pr-2 text-white shadow-pop">
        <p className="text-sm font-medium">Você tem alterações para salvar.</p>
        <div className="flex gap-2">
          <button type="button" tabIndex={dirty ? 0 : -1} onClick={onDiscard} className="a-btn min-h-10 text-white hover:bg-white/10">
            Descartar
          </button>
          <button type="button" tabIndex={dirty ? 0 : -1} onClick={onSave} className="a-btn a-btn-accent min-h-10">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Escolha de ícone com os desenhos à vista (nada de nomes técnicos). */
export function IconPicker({ value, onChange, label }: { value: IconName; onChange: (v: IconName) => void; label: string }) {
  const names = Object.keys(ICONS) as IconName[];
  return (
    <fieldset>
      <legend className="a-label">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {names.map((n) => {
          const Icon = ICONS[n];
          const on = n === value;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              aria-label={n}
              onClick={() => onChange(n)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${on ? 'border-navy bg-navy text-champagne' : 'border-navy/20 bg-white text-navy/70 hover:border-navy/50'}`}
            >
              <Icon size={20} strokeWidth={1.4} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
