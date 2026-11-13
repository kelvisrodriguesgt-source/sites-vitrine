import { forwardRef } from 'react';
import type { Product, SizeId } from '../config/types';
import { sortedSizes } from '../lib/menu';

interface Props {
  product: Product;
  value: SizeId | undefined;
  onChange: (id: SizeId) => void;
  /** Tamanhos permitidos (no meio a meio, só os que as duas pizzas têm). */
  allowed?: SizeId[];
  invalid?: boolean;
  groupLabel?: string;
}

/** Seletor circular P · M · G. */
export const SizePicker = forwardRef<HTMLDivElement, Props>(function SizePicker({ product, value, onChange, allowed, invalid, groupLabel }, ref) {
  return (
    <div ref={ref} role="group" aria-label={groupLabel ?? `Tamanho de ${product.name}`} className={`flex items-center justify-center gap-3 ${invalid ? 'shake' : ''}`}>
      {sortedSizes(product).map((s) => {
        const on = value === s.id;
        const off = allowed ? !allowed.includes(s.id) : false;
        return (
          <button
            key={s.id}
            type="button"
            disabled={off}
            aria-pressed={on}
            aria-label={`${s.label}, ${s.slices} fatias`}
            title={`${s.label} · ${s.slices} fatias`}
            onClick={() => onChange(s.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-30 ${
              on ? 'border-red bg-red text-snow' : invalid ? 'border-ember text-snow hover:bg-white/10' : 'border-line text-snow hover:border-snow'
            }`}
          >
            {s.id}
          </button>
        );
      })}
    </div>
  );
});
