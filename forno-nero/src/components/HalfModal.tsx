import { useEffect, useMemo, useState } from 'react';
import { site } from '../config/site';
import type { Product, SizeId } from '../config/types';
import { useCart } from '../context/CartContext';
import { halfKey, lineName } from '../lib/cart';
import { commonSizes, halfCents, isHalfEligible, sizeOf, sortedSizes } from '../lib/menu';
import { formatBRL } from '../lib/money';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Sabor já escolhido no card de onde o usuário partiu. */
  initial?: Product | null;
  products: Product[];
}

export function HalfModal({ open, onClose, initial, products }: Props) {
  const { add } = useCart();
  const flavors = useMemo(() => products.filter((p) => isHalfEligible(p, site.halfAndHalf)), [products]);
  const [firstId, setFirstId] = useState('');
  const [secondId, setSecondId] = useState('');
  const [size, setSize] = useState<SizeId>('G');

  useEffect(() => {
    if (!open) return;
    const first = initial && flavors.some((f) => f.id === initial.id) ? initial.id : (flavors[0]?.id ?? '');
    setFirstId(first);
    setSecondId('');
    setSize('G');
  }, [open, initial, flavors]);

  const first = flavors.find((f) => f.id === firstId);
  const second = flavors.find((f) => f.id === secondId);
  const sizes: SizeId[] = first && second ? commonSizes(first, second) : first ? sortedSizes(first).map((s) => s.id) : [];
  const active = sizes.includes(size) ? size : sizes[sizes.length - 1];
  const a = first && active ? sizeOf(first, active) : undefined;
  const b = second && active ? sizeOf(second, active) : undefined;
  const price = a && b ? halfCents(a, b, site.halfAndHalf.pricing) : null;
  const pricingNote = site.halfAndHalf.pricing === 'highest' ? 'O valor segue o sabor mais caro.' : 'O valor é a média dos dois sabores.';

  if (!open) return null;
  const submit = () => {
    if (!first || !second || !a || !active) return;
    add(halfKey(first.id, second.id, active), lineName(first, a, second));
    onClose();
  };

  const select = 'field mt-1.5';
  return (
    <Modal open={open} onClose={onClose} title="Pizza meio a meio">
      <p className="text-sm text-ash">Escolha dois sabores do mesmo tamanho. {pricingNote}</p>
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="half-1" className="text-sm font-bold">1º sabor</label>
          <select id="half-1" className={select} value={firstId} onChange={(e) => { setFirstId(e.target.value); if (e.target.value === secondId) setSecondId(''); }}>
            {flavors.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="half-2" className="text-sm font-bold">2º sabor</label>
          <select id="half-2" className={select} value={secondId} onChange={(e) => setSecondId(e.target.value)}>
            <option value="">Escolha o segundo sabor</option>
            {flavors.filter((f) => f.id !== firstId && (!first || commonSizes(first, f).length > 0)).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="text-sm font-bold">Tamanho</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(first ? sortedSizes(first) : []).map((s) => {
              const ok = sizes.includes(s.id);
              const on = active === s.id;
              return (
                <button key={s.id} type="button" disabled={!ok} aria-pressed={on} onClick={() => setSize(s.id)} className={`rounded-xl border-2 px-2 py-2.5 text-center transition disabled:opacity-30 ${on ? 'border-red bg-red' : 'border-line hover:border-snow'}`}>
                  <span className="block text-base font-extrabold">{s.id}</span>
                  <span className="block text-[0.7rem]">{s.slices} fatias</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <div className="mt-5 rounded-xl bg-card p-4" aria-live="polite">
        {first && second && a ? (
          <>
            <p className="text-sm font-semibold">Pizza {a.id} meio a meio</p>
            <p className="text-sm text-ash">{first.name} / {second.name}</p>
            <p className="mt-1 text-2xl font-extrabold">{price !== null ? formatBRL(price) : ''}</p>
          </>
        ) : (
          <p className="text-sm text-ash">Escolha o segundo sabor para ver o valor.</p>
        )}
      </div>
      <button type="button" onClick={submit} disabled={!first || !second || !a} className="btn btn-red mt-4 w-full">
        Adicionar ao carrinho
      </button>
    </Modal>
  );
}
