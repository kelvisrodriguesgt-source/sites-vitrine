export interface RichPart {
  text: string;
  italic: boolean;
}

/** Divide "Mais que *um sorriso.*" em partes romanas e itálicas. */
export function parseRich(input: string): RichPart[] {
  const parts: RichPart[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (const match of input.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: input.slice(last, index), italic: false });
    parts.push({ text: match[1] ?? '', italic: true });
    last = index + match[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last), italic: false });
  return parts;
}

/** Remove a marcação (para texto puro: title, aria-label). */
export const plain = (input: string): string => input.replace(/\*/g, '');
