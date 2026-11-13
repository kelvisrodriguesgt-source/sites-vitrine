import { Check, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { site } from '../../config/site';
import type { Product } from '../../config/types';
import { formatBRL, toCents } from '../../lib/money';
import { formatPriceInput, parsePrice, slugId, validateProduct, type ProductErrors } from '../../shared/catalog';
import { resizeImage } from '../image';
import { Dialog, DialogHeader, Switch } from '../ui';
import { ProductThumb } from './ProductThumb';

const BADGES = ['Mais pedido', 'Novo', 'Favorito da casa', 'Picante', 'Combo'];

interface Props {
  /** null = produto novo. */
  initial: Product | null;
  existingIds: string[];
  defaultCategory: string;
  featuredCount: number;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const SITE_PHOTOS: { src: string; alt: string }[] = (() => {
  const seen = new Set<string>();
  const out: { src: string; alt: string }[] = [];
  for (const p of [...site.gallery, ...site.products.map((x) => ({ src: x.image ?? '', alt: x.imageAlt ?? x.name }))]) {
    if (p.src && !seen.has(p.src)) {
      seen.add(p.src);
      out.push(p);
    }
  }
  return out.filter((p) => !p.src.includes('mesa') && !p.src.includes('quadro'));
})();

export function ProductEditor({ initial, existingIds, defaultCategory, featuredCount, onSave, onClose }: Props) {
  const uid = useId();
  const file = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? '');
  const [priceText, setPriceText] = useState(initial ? formatPriceInput(initial.price) : '');
  const [category, setCategory] = useState(initial?.category ?? defaultCategory);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [badge, setBadge] = useState(initial?.badge ?? '');
  const [featured, setFeatured] = useState(initial?.featured === true);
  const [available, setAvailable] = useState(initial?.available !== false);
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);

  const clear = (k: keyof ProductErrors) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  const price = parsePrice(priceText);
  const featureBlocked = !featured && featuredCount >= 3;

  const preview: Product = useMemo(
    () => ({ id: initial?.id ?? 'preview', name: name.trim() || 'Nome do produto', description, price: price ?? 0, category, image, badge: badge.trim() || undefined, available }),
    [initial?.id, name, description, price, category, image, badge, available]
  );

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
    const found = validateProduct({ name, price: price ?? 0, category, description }, site.categories);
    if (price === null) found.price = 'Informe um preço válido, como 32,90.';
    setErrors(found);
    const first = (['name', 'price', 'category', 'description'] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const product: Product = {
      id: initial?.id ?? slugId(name, existingIds),
      name: name.trim(),
      description: description.trim(),
      price: price as number,
      category
    };
    if (image) {
      product.image = image;
      product.imageAlt = name.trim();
      if (initial?.image === image && initial.imagePosition) product.imagePosition = initial.imagePosition;
    }
    if (badge.trim()) product.badge = badge.trim().slice(0, 24);
    if (featured) product.featured = true;
    if (!available) product.available = false;
    onSave(product);
  };

  const err = (k: keyof ProductErrors) => (errors[k] ? <p id={`${uid}-${k}-err`} role="alert" className="mt-1.5 text-sm font-semibold text-tomato">{errors[k]}</p> : null);
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
                  <button type="button" onClick={() => setImage(undefined)} className="a-btn text-tomato hover:bg-tomato/10">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
                  </button>
                )}
                <input ref={file} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label="Escolher foto do produto" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
              {photoError && <p role="alert" className="mt-2 text-sm font-semibold text-tomato">{photoError}</p>}
              <p className="mt-2 text-xs text-char/55">A foto é reduzida automaticamente. Sem foto, o site mostra um bloco com a marca.</p>
              <details className="mt-3">
                <summary className="cursor-pointer font-heading text-sm font-bold text-wine">Ou escolha uma foto do site</summary>
                <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {SITE_PHOTOS.map((p) => (
                    <li key={p.src}>
                      <button type="button" onClick={() => setImage(p.src)} aria-label={`Usar foto: ${p.alt}`} aria-pressed={image === p.src} className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 ${image === p.src ? 'border-tomato' : 'border-transparent hover:border-char/30'}`}>
                        <img src={p.src} alt="" width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
                        {image === p.src && (
                          <span className="absolute inset-0 flex items-center justify-center bg-tomato/40">
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
              <input id={`${uid}-name`} className="a-input mt-1.5" value={name} maxLength={60} onChange={(e) => { setName(e.target.value); clear('name'); }} placeholder="Ex.: X-Bacon Duplo" data-autofocus {...invalid('name')} />
              {err('name')}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-price`} className="a-label">Preço</label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-char/55">R$</span>
                  <input
                    id={`${uid}-price`}
                    className="a-input pl-11"
                    inputMode="decimal"
                    value={priceText}
                    onChange={(e) => { setPriceText(e.target.value); clear('price'); }}
                    onBlur={() => price !== null && setPriceText(formatPriceInput(price))}
                    placeholder="32,90"
                    {...invalid('price')}
                  />
                </div>
                {err('price')}
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
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor={`${uid}-description`} className="a-label">Descrição</label>
                <span className={`text-xs ${description.length > 220 ? 'font-bold text-tomato' : 'text-char/50'}`}>{description.length}/220</span>
              </div>
              <textarea id={`${uid}-description`} className="a-input mt-1.5 min-h-24" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); clear('description'); }} placeholder="Ingredientes e o que torna o item especial" {...invalid('description')} />
              {err('description')}
            </div>

            <div>
              <label htmlFor={`${uid}-badge`} className="a-label">Selo (opcional)</label>
              <input id={`${uid}-badge`} className="a-input mt-1.5" list={`${uid}-badges`} value={badge} maxLength={24} onChange={(e) => setBadge(e.target.value)} placeholder="Ex.: Mais pedido" />
              <datalist id={`${uid}-badges`}>
                {BADGES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="a-card divide-y divide-char/10">
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-heading font-bold">Disponível para pedido</p>
                  <p className="text-sm text-char/60">Desligado, o item aparece como indisponível no site.</p>
                </div>
                <Switch checked={available} onChange={setAvailable} label="Disponível para pedido" />
              </div>
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-heading font-bold">Destaque na página inicial</p>
                  <p className="text-sm text-char/60">{featureBlocked ? 'Já há 3 destaques. Tire um deles para marcar este.' : `Até 3 itens (${featuredCount + (featured ? 1 : 0)} de 3 em uso).`}</p>
                </div>
                <Switch checked={featured} onChange={setFeatured} label="Destaque na página inicial" disabled={featureBlocked} />
              </div>
            </div>
          </div>

          <aside aria-label="Prévia no site" className="md:sticky md:top-0 md:self-start">
            <p className="a-label">Prévia no site</p>
            <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-card">
              <div className="relative aspect-[4/3] overflow-hidden bg-wine">
                <ProductThumb product={preview} />
              </div>
              <div className="p-4">
                <p className="font-heading font-extrabold uppercase leading-tight">{preview.name}</p>
                <p className="mt-1.5 line-clamp-3 text-sm text-char/70">{description || 'A descrição aparece aqui.'}</p>
                <p className="mt-3 font-heading text-xl font-extrabold text-tomato">{formatBRL(toCents(preview.price))}</p>
                <div className="mt-3 rounded-md bg-tomato py-2.5 text-center font-heading text-xs font-extrabold uppercase tracking-wide text-white">{available ? 'Adicionar ao pedido' : 'Indisponível'}</div>
              </div>
            </div>
          </aside>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-char/10 bg-white p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="a-btn a-btn-ghost">Cancelar</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={busy}>
            {initial ? 'Salvar alterações' : 'Adicionar produto'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
