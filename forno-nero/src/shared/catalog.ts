import type { Category, Product, SizeId, SizeOption } from '../config/types';
import { SIZE_ORDER, hasSizes } from '../lib/menu';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';

/** Lê "R$ 1.234,56", "32,90" ou "32.9". Retorna null se não for um preço válido. */
export function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  let normalized: string;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    // O separador que aparece por último é o decimal.
    const decimal = lastComma > lastDot ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    normalized = cleaned.split(thousands).join('').replace(decimal, '.');
  } else if (lastComma >= 0) {
    normalized = cleaned.replace(',', '.');
  } else if (lastDot >= 0 && cleaned.length - lastDot - 1 === 3 && cleaned.indexOf('.') === lastDot) {
    // "1.234" = mil duzentos e trinta e quatro
    normalized = cleaned.replace('.', '');
  } else {
    normalized = cleaned;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

export const formatPriceInput = (price: number): string => price.toFixed(2).replace('.', ',');

const strip = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Gera um id único a partir do nome ("X-Bacon Duplo" -> "x-bacon-duplo", "-2" se já existir). */
export function slugId(name: string, existing: readonly string[]): string {
  const base =
    strip(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto';
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export type ProductErrors = Partial<Record<'name' | 'price' | 'category' | 'description' | 'sizes', string>>;

export const SIZE_LABELS: Record<SizeId, string> = { P: 'Pequena', M: 'Média', G: 'Grande' };
export const DEFAULT_SLICES: Record<SizeId, number> = { P: 4, M: 6, G: 8 };

export function validateProduct(p: Pick<Product, 'name' | 'price' | 'category' | 'description' | 'sizes'>, categories: Category[]): ProductErrors {
  const errors: ProductErrors = {};
  if (p.name.trim().length < 2) errors.name = 'Informe o nome do produto.';
  if (p.sizes && p.sizes.length > 0) {
    if (p.sizes.some((s) => !Number.isFinite(s.price) || s.price <= 0 || s.price > 9999)) errors.sizes = 'Informe um preço maior que zero em cada tamanho oferecido.';
    else if (p.sizes.some((s) => !Number.isInteger(s.slices) || s.slices < 1 || s.slices > 24)) errors.sizes = 'Informe o número de fatias (de 1 a 24).';
  } else {
    if (!Number.isFinite(p.price) || p.price <= 0) errors.price = 'Informe um preço maior que zero.';
    if (p.price > 9999) errors.price = 'Preço muito alto.';
  }
  if (!categories.some((c) => c.id === p.category)) errors.category = 'Escolha uma categoria.';
  if (p.description.length > 220) errors.description = 'Use até 220 caracteres.';
  return errors;
}

const MAX_IMAGE_CHARS = 400_000;

function sanitizeSizes(raw: unknown): SizeOption[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set<string>();
  const out: SizeOption[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const s = r as Record<string, unknown>;
    const id = s.id as SizeId;
    if (!SIZE_ORDER.includes(id) || seen.has(id)) continue;
    if (typeof s.price !== 'number' || !Number.isFinite(s.price) || s.price <= 0) continue;
    seen.add(id);
    out.push({
      id,
      label: typeof s.label === 'string' && s.label.trim() ? s.label.trim().slice(0, 20) : SIZE_LABELS[id],
      slices: typeof s.slices === 'number' && Number.isInteger(s.slices) && s.slices >= 1 && s.slices <= 24 ? s.slices : DEFAULT_SLICES[id],
      price: s.price
    });
  }
  out.sort((a, b) => SIZE_ORDER.indexOf(a.id) - SIZE_ORDER.indexOf(b.id));
  return out.length ? out : undefined;
}

/** Mantém `price` igual ao menor preço dos tamanhos (usado em "a partir de"). */
export const withMinPrice = (p: Product): Product => (hasSizes(p) ? { ...p, price: Math.min(...p.sizes.map((s) => s.price)) } : p);

function sanitizeProduct(raw: unknown, categories: Category[]): Product | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  if (typeof r.price !== 'number' || !Number.isFinite(r.price) || r.price < 0) return null;
  const category = typeof r.category === 'string' && categories.some((c) => c.id === r.category) ? r.category : categories[0]?.id;
  if (!category) return null;
  const image =
    typeof r.image === 'string' &&
    ((r.image.startsWith('/img/') && !r.image.includes('..')) ||
      (r.image.startsWith('data:image/') && r.image.length <= MAX_IMAGE_CHARS))
      ? r.image
      : undefined;
  const sizes = sanitizeSizes(r.sizes);
  const product: Product = {
    id: r.id,
    name: r.name,
    description: typeof r.description === 'string' ? r.description : '',
    price: sizes ? Math.min(...sizes.map((s) => s.price)) : r.price,
    category
  };
  if (sizes) product.sizes = sizes;
  if (image) {
    product.image = image;
    if (typeof r.imageAlt === 'string') product.imageAlt = r.imageAlt;
  }
  if (typeof r.badge === 'string' && r.badge.trim()) product.badge = r.badge.trim().slice(0, 24);
  if (r.available === false) product.available = false;
  return product;
}

/** Catálogo exibido: o salvo pelo painel, se existir; senão o padrão do arquivo de conteúdo. */
export function loadCatalog(defaults: Product[], categories: Category[]): Product[] {
  const saved = readJSON<unknown>(KEYS.catalog, null);
  if (!Array.isArray(saved)) return defaults;
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const item of saved) {
    const p = sanitizeProduct(item, categories);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

export const hasCustomCatalog = (): boolean => Array.isArray(readJSON<unknown>(KEYS.catalog, null));
export const saveCatalog = (products: Product[]): boolean => writeJSON(KEYS.catalog, products);
export const resetCatalog = (): void => removeKey(KEYS.catalog);

export const isAvailable = (p: Product): boolean => p.available !== false;
