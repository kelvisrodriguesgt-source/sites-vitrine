import type { Content, ContentFile } from '../config/types';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';

export const FILES: readonly ContentFile[] = ['info', 'texts', 'treatments', 'differentials', 'team', 'faq'];

type Json = unknown;
const isObject = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Faz o valor salvo ter exatamente o formato do modelo (o conteúdo padrão):
 * chaves desconhecidas são descartadas e tipos errados voltam ao padrão.
 * Listas usam o primeiro item do modelo como molde de cada elemento.
 */
export function coerce<T>(template: T, value: Json): T {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    const mold = template[0];
    if (isObject(mold)) return value.filter(isObject).map((v) => coerce(mold, v)) as T;
    if (typeof mold === 'string') return value.filter((v): v is string => typeof v === 'string') as T;
    return template;
  }
  if (isObject(template)) {
    const src = isObject(value) ? value : {};
    const out: Record<string, Json> = {};
    for (const key of Object.keys(template)) out[key] = coerce(template[key], src[key]);
    return out as T;
  }
  return (typeof value === typeof template ? value : template) as T;
}

const MAX_DATA_URL = 700_000;

/** Aceita só imagens do próprio site (/img/...) ou fotos enviadas pelo painel (data:image). */
export function safeImage(value: string, fallback: string): string {
  if (/^\/img\/[\w./-]+$/.test(value) && !value.includes('..')) return value;
  if (/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= MAX_DATA_URL) return value;
  return fallback;
}

export const MAP_PREFIX = 'https://www.google.com/maps/embed';

/** Aceita o endereço do mapa ou o código <iframe> inteiro que o Google Maps fornece. Retorna null se não for válido. */
export function parseMapEmbed(input: string): string | null {
  const text = input.trim();
  if (!text) return '';
  const match = /src\s*=\s*["']([^"']+)["']/i.exec(text);
  const src = (match?.[1] ?? text).replace(/&amp;/g, '&');
  return src.startsWith(MAP_PREFIX) && !/\s/.test(src) ? src : null;
}

const isHttps = (v: string): boolean => /^https:\/\/[^\s]+$/.test(v);

/** Aplica as regras de segurança e de formato. `defaults` fornece os valores de segurança. */
export function sanitizeContent(defaults: Content, raw: Json): Content {
  const src = isObject(raw) ? raw : {};
  const c = {} as Content;
  for (const file of FILES) (c as unknown as Record<string, Json>)[file] = coerce(defaults[file], src[file]);

  const imgs = c.info.images;
  const dImgs = defaults.info.images;
  for (const key of ['hero', 'heroMobile', 'reception', 'clinicRoom', 'technology', 'ctaFinal'] as const) {
    imgs[key] = safeImage(imgs[key], dImgs[key]);
  }
  c.treatments.treatments = c.treatments.treatments.map((t, i) => ({
    ...t,
    id: t.id || `tratamento-${i + 1}`,
    items: [...t.items.slice(0, 3), '', '', ''].slice(0, 3),
    image: t.image ? safeImage(t.image, '') : ''
  }));
  c.info.contact.whatsapp = c.info.contact.whatsapp.replace(/\D/g, '');
  if (!isHttps(c.info.contact.instagramUrl)) c.info.contact.instagramUrl = defaults.info.contact.instagramUrl;
  c.info.address.mapEmbedSrc = parseMapEmbed(c.info.address.mapEmbedSrc) ?? '';
  if (c.info.address.directionsUrl && !isHttps(c.info.address.directionsUrl)) c.info.address.directionsUrl = '';
  // Aviso de demonstração e CRO só mudam por decisão consciente; nada inventado aqui.
  return c;
}

type Stored = Partial<Record<ContentFile, Json>>;

const readStored = (): Stored => {
  const raw = readJSON<Json>(KEYS.content, {});
  return isObject(raw) ? (raw as Stored) : {};
};

/** Conteúdo exibido: padrão + o que foi salvo pelo painel. */
export function loadContent(defaults: Content): Content {
  return sanitizeContent(defaults, readStored());
}

export const customFiles = (): ContentFile[] => FILES.filter((f) => readStored()[f] !== undefined);

/** Salva uma área. Retorna false se o navegador recusar a gravação (armazenamento cheio). */
export function saveFile<K extends ContentFile>(file: K, value: Content[K]): boolean {
  return writeJSON(KEYS.content, { ...readStored(), [file]: value });
}

export function resetFile(file: ContentFile): boolean {
  const next = { ...readStored() };
  delete next[file];
  if (Object.keys(next).length === 0) {
    removeKey(KEYS.content);
    return true;
  }
  return writeJSON(KEYS.content, next);
}

export const resetAll = (): void => removeKey(KEYS.content);

/* ---------- Ajudas de formulário ---------- */

/** "(65) 99903-4981" -> "5565999034981" (acrescenta o 55 do Brasil quando faltar). */
export function toWhatsappNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
}

/** "5565999034981" -> "(65) 99903-4981". */
export function formatPhone(national: string): string {
  const d = national.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return national;
}

export const isValidWhatsapp = (digits: string): boolean => /^55\d{10,11}$/.test(digits);

/** "@minhaclinica" ou "minhaclinica" -> usuário limpo; vazio se inválido. */
export function cleanInstagram(input: string): string {
  const user = input.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(user) ? user : '';
}

const strip = (s: string): string => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Gera um identificador único a partir do nome ("Estética dental" -> "estetica-dental"). */
export function slugId(name: string, existing: readonly string[]): string {
  const base =
    strip(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
