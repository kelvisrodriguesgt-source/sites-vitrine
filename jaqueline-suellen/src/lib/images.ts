import type { AspectKey } from '../config/types';

/**
 * Fotos do site: arquivos em src/assets/images/<nome>.webp (ou .jpg/.png).
 * A lista é resolvida no build (SSR e navegador), então o HTML já sabe se existe foto ou espaço reservado.
 */
const found = import.meta.glob('../assets/images/*.{webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png'];

export function imageUrl(file: string): string | undefined {
  for (const ext of EXTENSIONS) {
    const url = found[`../assets/images/${file}.${ext}`];
    if (url) return url;
  }
  return undefined;
}

/** Classes literais (o Tailwind não enxerga nomes montados dinamicamente). */
export const ASPECT_CLASS: Record<AspectKey, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '16/9': 'aspect-video'
};
