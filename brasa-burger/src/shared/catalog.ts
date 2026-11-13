import type { Category, Product } from '../config/types';
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

export type ProductErrors = Partial<Record<'name' | 'price' | 'category' | 'description', string>>;

export function validateProduct(p: Pick<Product, 'name' | 'price' | 'category' | 'description'>, categories: Category[]): ProductErrors {
  const errors: ProductErrors = {};
  if (p.name.trim().length < 2) errors.name = 'Informe o nome do produto.';
  if (!Number.isFinite(p.price) || p.price <= 0) errors.price = 'Informe um preço maior que zero.';
  if (p.price > 9999) errors.price = 'Preço muito alto.';
  if (!categories.some((c) => c.id === p.category)) errors.category = 'Escolha uma categoria.';
  if (p.description.length > 220) errors.description = 'Use até 220 caracteres.';
  return errors;
}

const MAX_IMAGE_CHARS = 400_000;

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
  const product: Product = {
    id: r.id,
    name: r.name,
    description: typeof r.description === 'string' ? r.description : '',
    price: r.price,
    category
  };
  if (image) {
    product.image = image;
    if (typeof r.imageAlt === 'string') product.imageAlt = r.imageAlt;
    if (typeof r.imagePosition === 'string' && /^[\w\-[\]%_.]+$/.test(r.imagePosition)) product.imagePosition = r.imagePosition;
  }
  if (r.featured === true) product.featured = true;
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
