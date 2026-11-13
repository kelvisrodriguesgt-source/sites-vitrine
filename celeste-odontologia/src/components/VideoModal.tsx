import { X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Dialog } from './Dialog';

export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { images, texts } = useSite();
  return (
    <Dialog open={open} onClose={onClose} label={texts.hero.videoLabel} className="m-auto w-[min(92vw,960px)]" backdropClassName="bg-abyss/80">
      <div className="plate bg-navy">
        <div className="relative aspect-video">
          <img src={images.reception} alt={images.receptionAlt} width={1600} height={900} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-navy/55">
            <p className="glass px-8 py-4 text-center font-serif text-2xl italic sm:text-3xl">{texts.hero.videoPlaceholder}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fechar vídeo"
          onClick={onClose}
          className="bubble absolute right-4 top-4 flex h-11 w-11 items-center justify-center transition hover:bg-white/25"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>
    </Dialog>
  );
}
