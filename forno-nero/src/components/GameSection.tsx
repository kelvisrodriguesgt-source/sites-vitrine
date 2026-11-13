import { Gamepad2 } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { site } from '../config/site';
import { useGame } from '../context/GameContext';

// O jogo só é baixado quando alguém abre o modal.
const GameModal = lazy(() => import('./GameModal'));

export function GameHost() {
  const { open } = useGame();
  if (!site.game.enabled || !open) return null;
  return (
    <Suspense fallback={null}>
      <GameModal />
    </Suspense>
  );
}

export function GameSection() {
  const { openGame } = useGame();
  const { texts, images } = site;
  if (!site.game.enabled) return null;
  return (
    <section id="jogo" aria-labelledby="jogo-titulo" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-card via-card to-red/20 p-8 sm:p-12">
          <img src={images.pepperoni[1]} alt="" width={120} height={120} loading="lazy" decoding="async" aria-hidden="true" className="pointer-events-none absolute -right-4 top-6 w-24 rotate-12 sm:right-20 sm:w-32" />
          <img src={images.pepperoni[4]} alt="" width={120} height={120} loading="lazy" decoding="async" aria-hidden="true" className="pointer-events-none absolute bottom-4 right-24 hidden w-16 -rotate-12 opacity-70 sm:block" />
          <p className="eyebrow">Minijogo</p>
          <h2 id="jogo-titulo" className="title-display mt-2 text-3xl sm:text-4xl">
            {texts.game.title}
          </h2>
          <p className="mt-3 max-w-md text-ash">{texts.game.text}</p>
          <button type="button" onClick={openGame} className="btn btn-red mt-6">
            <Gamepad2 className="h-5 w-5" aria-hidden="true" />
            {texts.game.seal}
          </button>
        </div>
      </div>
    </section>
  );
}
