import { ArrowDown, ArrowUp, ImagePlus, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import { resizeImage } from './image';
import { useToast } from './ui';

export function moveItem<T>(list: readonly T[], index: number, dir: -1 | 1): T[] {
  const to = index + dir;
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(to, 0, item as T);
  return next;
}

/** Botões de cada item de uma lista: subir, descer, editar e remover. */
export function RowActions({
  index,
  count,
  name,
  onMove,
  onEdit,
  onRemove
}: {
  index: number;
  count: number;
  name: string;
  onMove: (dir: -1 | 1) => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className="a-icon-btn" aria-label={`Subir ${name}`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className="a-icon-btn" aria-label={`Descer ${name}`} disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className="a-btn a-btn-ghost min-h-10 px-4" onClick={onEdit}>
        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
      </button>
      <button type="button" className="a-icon-btn hover:bg-rose-50 hover:text-rose-700" aria-label={`Remover ${name}`} onClick={onRemove}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface PhotoPickerProps {
  value: string;
  alt: string;
  onChange: (url: string, ratio: number) => void;
  onRemove?: () => void;
  onReset?: () => void;
  maxSide?: number;
  /** Classe de proporção do quadro de prévia (ex.: "aspect-video"). */
  frame?: string;
  title: string;
  hint?: ReactNode;
}

/** Foto com prévia, botão de trocar e (opcional) voltar ao original. A foto é reduzida no próprio navegador. */
export function PhotoPicker({ value, alt, onChange, onRemove, onReset, maxSide = 900, frame = 'aspect-[4/3]', title, hint }: PhotoPickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { url, ratio } = await resizeImage(file, maxSide);
      onChange(url, ratio);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Não foi possível usar essa imagem.', { tone: 'error', ms: 7000 });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <div className={`relative overflow-hidden rounded-2xl bg-mist ${frame}`}>
        {value ? (
          <img src={value} alt={alt || title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-navy/50">
            <ImagePlus className="h-8 w-8" aria-hidden="true" />
            <span className="text-sm">Sem foto</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="a-btn a-btn-primary">
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> {busy ? 'Preparando…' : value ? 'Trocar foto' : 'Escolher foto'}
        </button>
        {onReset && (
          <button type="button" onClick={onReset} className="a-btn a-btn-ghost">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Voltar à original
          </button>
        )}
        {onRemove && value && (
          <button type="button" onClick={onRemove} className="a-btn a-btn-ghost">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Tirar foto
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" aria-label={`Escolher arquivo: ${title}`} tabIndex={-1} onChange={(e) => void pick(e.target.files?.[0])} />
      {hint ? <p className="a-hint">{hint}</p> : null}
    </div>
  );
}
