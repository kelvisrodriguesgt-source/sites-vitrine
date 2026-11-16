export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/** Link wa.me. O número vem só de site.contact.whatsapp (55 + DDD + número). */
export function waLink(number: string, text?: string): string {
  const base = `https://wa.me/${digitsOnly(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** 5569933004605 -> (69) 93300-4605 */
export function formatPhone(number: string): string {
  let d = digitsOnly(number);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return number;
}

/** Máscara de digitação para o campo de telefone. */
export function maskPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
