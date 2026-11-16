import type { ImageSlot } from '../config/types';
import { ASPECT_CLASS, imageUrl } from '../lib/images';
import { Monogram } from './Monogram';

interface PhotoProps {
  slot: ImageSlot;
  /** Classes do quadro (arredondamento, sombra). */
  className?: string;
  /** Primeira imagem da página: carrega já e com prioridade. */
  priority?: boolean;
  /** Preenche o contêiner pai em vez de reservar proporção (fundos). */
  fill?: boolean;
  /** Rótulo do espaço reservado quando ainda não há foto. */
  label?: string;
  /** Classes extras da <img> (por exemplo, o ponto de foco do recorte). */
  imgClass?: string;
}

/**
 * Foto do config. Existindo src/assets/images/<arquivo>.webp, mostra a imagem; senão, um espaço reservado discreto
 * (com o nome do arquivo esperado), sem nunca usar foto aleatória.
 */
export function Photo({ slot, className = '', priority = false, fill = false, label, imgClass = '' }: PhotoProps) {
  const url = imageUrl(slot.file);
  const frame = fill ? 'absolute inset-0 h-full w-full' : `${ASPECT_CLASS[slot.ratio]} w-full`;
  if (url) {
    return (
      <div className={`${frame} overflow-hidden bg-nude ${className}`}>
        <img
          src={url}
          alt={slot.alt}
          width={slot.width}
          height={slot.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={`h-full w-full object-cover ${imgClass}`}
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={label ?? slot.alt}
      data-placeholder={slot.file}
      className={`${frame} flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-nude via-nude/60 to-champagne/35 text-champagne ${className}`}
    >
      <Monogram className="h-1/3 max-h-24 w-auto opacity-70" />
      <span className="px-4 text-center font-sans text-[0.6rem] font-medium uppercase tracking-[0.22em] text-taupe/70">{label ?? `Foto · ${slot.file}`}</span>
    </div>
  );
}
