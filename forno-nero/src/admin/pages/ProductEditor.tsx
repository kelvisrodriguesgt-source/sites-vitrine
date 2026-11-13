import { Check, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { site } from '../../config/site';
import type { Product, SizeId, SizeOption } from '../../config/types';
import { SIZE_ORDER, fromCents, hasSizes } from '../../lib/menu';
import { formatBRL } from '../../lib/money';
import { DEFAULT_SLICES, SIZE_LABELS, formatPriceInput, parsePrice, slugId, validateProduct, withMinPrice, type ProductErrors } from '../../shared/catalog';
import { resizeImage } from '../image';
import { Dialog, DialogHeader, Switch } from '../ui';
import { ProductThumb } from './ProductThumb';

const BADGES = ['Mais pedida', 'Nova', 'Favorita da casa', 'Picante', 'Combo'];

interface Props {
  /** null = produto novo. */
  initial: Product | null;
  existingIds: string[];
  defaultCategory: string;
  onSave: (product: Product) => void;
  onClose: () => void;
}

interface Row {
  on: boolean;
  price: string;
  slices: string;
}
type Rows = Record<SizeId, Row>;

const SITE_PHOTOS: { src: string; alt: string }[] = (() => {
  const seen = new Set<string>();
  const out: { src: string; alt: string }[] = [];
  for (const p of site.products) {
    if (p.image && !seen.has(p.image)) {
      seen.add(p.image);
      out.push({ src: p.image, alt: p.imageAlt ?? p.name });
    }
  }
  return out;
})();

function initialRows(initial: Product | null): Rows {
  const rows = {} as Rows;
  for (const id of SIZE_ORDER) {
    const found = initial?.sizes?.find((s) => s.id === id);
    rows[id] = {
      on: found ? true : !initial || !hasSizes(initial),
      price: found ? formatPriceInput(found.price) : '',
      slices: String(found?.slices ?? DEFAULT_SLICES[id])
    };
  }
  return rows;
}

export function ProductEditor({ initial, existingIds, defaultCategory, onSave, onClose }: Props) {
  const uid = useId();
  const file = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? '');
  const [priceText, setPriceText] = useState(initial && !hasSizes(initial) ? formatPriceInput(initial.price) : '');
  const [withSizes, setWithSizes] = useState(initial ? hasSizes(initial) : defaultCategory === 'pizzas' || defaultCategory === 'doces');
  const [rows, setRows] = useState<Rows>(() => initialRows(initial));
  const [category, setCategory] = useState(initial?.category ?? defaultCategory);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [badge, setBadge] = useState(initial?.badge ?? '');
  const [available, setAvailable] = useState(initial?.available !== false);
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);

  const clear = (k: keyof ProductErrors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  const price = parsePrice(priceText);
  const setRow = (id: SizeId, patch: Partial<Row>) => {
    setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));
    clear('sizes');
  };

  /** Tamanhos digitados (só os ligados), ou null se algum preço está inválido. */
  const readSizes = (): SizeOption[] | null => {
    const out: SizeOption[] = [];
    for (const id of SIZE_ORDER) {
      const row = rows[id];
      if (!row.on) continue;
      const p = parsePrice(row.price);
      const slices = Number(row.slices);
      if (p === null || p <= 0) return null;
      out.push({ id, label: SIZE_LABELS[id], slices: Number.isInteger(slices) ? slices : 0, price: p });
    }
    return out;
  };

  const sizesNow = withSizes ? readSizes() : null;
  const preview: Product = useMemo(() => {
    const base: Product = { id: initial?.id ?? 'preview', name: name.trim() || 'Nome do produto', description, price: price ?? 0, category, image, badge: badge.trim() || undefined, available };
    return withSizes && sizesNow && sizesNow.length ? withMinPrice({ ...base, sizes: sizesNow }) : base;
  }, [initial?.id, name, description, price, category, image, badge, available, withSizes, sizesNow]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    setPhotoError('');
    try {
      setImage(await resizeImage(f));
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Não foi possível usar esta imagem.');
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = withSizes ? readSizes() : undefined;
    const found = validateProduct({ name, price: withSizes ? 1 : (price ?? 0), category, description, sizes: withSizes && sizes && sizes.length ? sizes : undefined }, site.categories);
    if (withSizes) {
      if (sizes === null) found.sizes = 'Informe o preço de cada tamanho ligado, como 49,90.';
      else if (sizes?.length === 0) found.sizes = 'Ligue pelo menos um tamanho.';
    } else if (price === null) found.price = 'Informe um preço válido, como 32,90.';
    setErrors(found);
    const first = (['name', 'price', 'sizes', 'category', 'description'] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    let product: Product = {
      id: initial?.id ?? slugId(name, existingIds),
      name: name.trim(),
      description: description.trim(),
      price: withSizes ? 0 : (price as number),
      category
    };
    if (withSizes && sizes) product = withMinPrice({ ...product, sizes });
    if (image) {
      product.image = image;
      product.imageAlt = name.trim();
    }
    if (badge.trim()) product.badge = badge.trim().slice(0, 24);
    if (!available) product.available = false;
    onSave(product);
  };

  const err = (k: keyof ProductErrors) => (errors[k] ? <p id={`${uid}-${k}-err`} role="alert" className="mt-1.5 text-sm font-semibold text-danger">{errors[k]}</p> : null);
  const invalid = (k: keyof ProductErrors) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${uid}-${k}-err` } : {});

  return (
    <Dialog open onClose={onClose} label={initial ? 'Editar produto' : 'Novo produto'} maxWidth="max-w-4xl">
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <DialogHeader title={initial ? 'Editar produto' : 'Novo produto'} subtitle="As mudanças aparecem no site assim que você salvar." onClose={onClose} />
        <div className="grid flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-[1fr_17rem]">
          <div className="space-y-5">
            <div>
              <p className="a-label">Foto</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => file.current?.click()} disabled={busy} className="a-btn a-btn-ghost">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
                  {image ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {image && (
                  <button type="button" onClick={() => setImage(undefined)} className="a-btn text-danger hover:bg-danger/10">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
                  </button>
                )}
                <input ref={file} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label="Escolher foto do produto" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
              {photoError && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{photoError}</p>}
              <p className="mt-2 text-xs text-ink/55">A foto é reduzida automaticamente. Para pizza, use uma foto vista de cima, de preferência recortada em círculo. Sem foto, o site mostra um cartão provisório com a marca.</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-red">Ou escolha uma foto do site</summary>
                <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {SITE_PHOTOS.map((p) => (
                    <li key={p.src}>
                      <button type="button" onClick={() => setImage(p.src)} aria-label={`Usar foto: ${p.alt}`} aria-pressed={image === p.src} className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-coal ${image === p.src ? 'border-red' : 'border-transparent hover:border-ink/30'}`}>
                        <img src={p.src} alt="" width={96} height={96} loading="lazy" className="h-full w-full object-contain" />
                        {image === p.src && (
                          <span className="absolute inset-0 flex items-center justify-center bg-red/40">
                            <Check className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <div>
              <label htmlFor={`${uid}-name`} className="a-label">Nome</label>
              <input id={`${uid}-name`} className="a-input mt-1.5" value={name} maxLength={60} onChange={(e) => { setName(e.target.value); clear('name'); }} placeholder="Ex.: Calabresa" data-autofocus {...invalid('name')} />
              {err('name')}
            </div>

            <div>
              <label htmlFor={`${uid}-category`} className="a-label">Categoria</label>
              <select id={`${uid}-category`} className="a-input mt-1.5" value={category} onChange={(e) => { setCategory(e.target.value); clear('category'); }} {...invalid('category')}>
                {site.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {err('category')}
            </div>

            <div className="a-card divide-y divide-ink/10 border border-ink/10 shadow-none">
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold">Tem tamanhos (P, M, G)</p>
                  <p className="text-sm text-ink/60">Pizzas têm um preço para cada tamanho. Desligado, o item tem preço único.</p>
                </div>
                <Switch checked={withSizes} onChange={(v) => { setWithSizes(v); clear('sizes'); clear('price'); }} label="Tem tamanhos" />
              </div>
              {withSizes ? (
                <div className="space-y-3 p-4">
                  {SIZE_ORDER.map((id) => {
                    const row = rows[id];
                    return (
                      <div key={id} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 sm:grid-cols-[auto_6rem_1fr_6rem]">
                        <Switch checked={row.on} onChange={(v) => setRow(id, { on: v })} label={`Oferecer tamanho ${SIZE_LABELS[id]}`} />
                        <span className="font-bold">{id} · {SIZE_LABELS[id]}</span>
                        <div className="relative col-span-2 sm:col-span-1">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-ink/55">R$</span>
                          <input
                            id={id === 'P' ? `${uid}-sizes` : undefined}
                            className="a-input pl-11"
                            inputMode="decimal"
                            disabled={!row.on}
                            aria-label={`Preço do tamanho ${SIZE_LABELS[id]}`}
                            value={row.price}
                            onChange={(e) => setRow(id, { price: e.target.value })}
                            onBlur={() => { const p = parsePrice(row.price); if (p !== null) setRow(id, { price: formatPriceInput(p) }); }}
                            placeholder="49,90"
                          />
                        </div>
                        <label className="col-span-2 flex items-center gap-2 text-sm text-ink/65 sm:col-span-1">
                          <input className="a-input w-20" inputMode="numeric" disabled={!row.on} aria-label={`Fatias do tamanho ${SIZE_LABELS[id]}`} value={row.slices} onChange={(e) => setRow(id, { slices: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
                          fatias
                        </label>
                      </div>
                    );
                  })}
                  {err('sizes')}
                </div>
              ) : (
                <div className="p-4">
                  <label htmlFor={`${uid}-price`} className="a-label">Preço</label>
                  <div className="relative mt-1.5 max-w-xs">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-ink/55">R$</span>
                    <input
                      id={`${uid}-price`}
                      className="a-input pl-11"
                      inputMode="decimal"
                      value={priceText}
                      onChange={(e) => { setPriceText(e.target.value); clear('price'); }}
                      onBlur={() => price !== null && setPriceText(formatPriceInput(price))}
                      placeholder="24,90"
                      {...invalid('price')}
                    />
                  </div>
                  {err('price')}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor={`${uid}-description`} className="a-label">Descrição / ingredientes</label>
                <span className={`text-xs ${description.length > 220 ? 'font-bold text-danger' : 'text-ink/50'}`}>{description.length}/220</span>
              </div>
              <textarea id={`${uid}-description`} className="a-input mt-1.5 min-h-24" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); clear('description'); }} placeholder="Ingredientes: o site também busca por eles" {...invalid('description')} />
              {err('description')}
            </div>

            <div>
              <label htmlFor={`${uid}-badge`} className="a-label">Selo (opcional)</label>
              <input id={`${uid}-badge`} className="a-input mt-1.5" list={`${uid}-badges`} value={badge} maxLength={24} onChange={(e) => setBadge(e.target.value)} placeholder="Ex.: Mais pedida" />
              <datalist id={`${uid}-badges`}>
                {BADGES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="a-card border border-ink/10 shadow-none">
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold">Disponível para pedido</p>
                  <p className="text-sm text-ink/60">Desligado, o item aparece como indisponível no site.</p>
                </div>
                <Switch checked={available} onChange={setAvailable} label="Disponível para pedido" />
              </div>
            </div>
            {category === 'pizzas' && withSizes && site.halfAndHalf.enabled && <p className="rounded-xl bg-ember/15 p-3 text-sm">Pizzas desta categoria também aparecem no <strong>meio a meio</strong>.</p>}
          </div>

          <aside aria-label="Prévia no site" className="md:sticky md:top-0 md:self-start">
            <p className="a-label">Prévia no site</p>
            <div className="mt-2 overflow-hidden rounded-2xl bg-card text-snow shadow-card">
              <div className="relative aspect-[4/3] overflow-hidden bg-coal">
                <ProductThumb product={preview} />
              </div>
              <div className="p-4 text-center">
                <p className="font-extrabold leading-tight">{preview.name}</p>
                <p className="mt-1.5 line-clamp-3 text-sm text-ash">{description || 'A descrição aparece aqui.'}</p>
                {hasSizes(preview) && (
                  <p className="mt-3 flex justify-center gap-2" aria-hidden="true">
                    {preview.sizes.map((s) => (
                      <span key={s.id} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-line text-xs font-extrabold">{s.id}</span>
                    ))}
                  </p>
                )}
                <p className="mt-3 text-lg font-extrabold">
                  {hasSizes(preview) && <span className="mr-1.5 text-xs font-normal text-ash">a partir de</span>}
                  {formatBRL(fromCents(preview))}
                </p>
                <div className="mt-3 rounded-full bg-red py-2.5 text-center text-xs font-bold uppercase tracking-wide text-snow">{available ? 'Adicionar ao carrinho' : 'Indisponível'}</div>
              </div>
            </div>
          </aside>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-ink/10 bg-white p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="a-btn a-btn-ghost">Cancelar</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={busy}>
            {initial ? 'Salvar alterações' : 'Adicionar produto'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
