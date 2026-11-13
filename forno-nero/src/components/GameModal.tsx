import { useCallback, useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { useGame } from '../context/GameContext';
import { BOX_H, BOX_W, BOX_Y, GAME_H, GAME_W, clamp, readRecord, saveRecord, spawn, spawnInterval, step, type Pep } from '../lib/game';
import { Modal } from './Modal';

type Phase = 'intro' | 'playing' | 'over';

function Game() {
  const { texts, game, images } = site;
  const canvas = useRef<HTMLCanvasElement>(null);
  const boxX = useRef(GAME_W / 2);
  const keys = useRef({ left: false, right: false });
  const [phase, setPhase] = useState<Phase>('intro');
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(game.durationSeconds);
  const [record, setRecord] = useState(0);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => setRecord(readRecord()), []);

  const start = useCallback(() => {
    boxX.current = GAME_W / 2;
    setScore(0);
    setLeft(game.durationSeconds);
    setIsNew(false);
    setPhase('playing');
  }, [game.durationSeconds]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = GAME_W * dpr;
    el.height = GAME_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sprites = images.pepperoni.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    let peps: Pep[] = [];
    let points = 0;
    let elapsed = 0;
    let sinceSpawn = 0;
    let last = performance.now();
    let hud = 0;
    let frame = 0;
    let done = false;

    const move = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) boxX.current = clamp(((clientX - rect.left) / rect.width) * GAME_W, BOX_W / 2, GAME_W - BOX_W / 2);
    };
    const onPointer = (e: PointerEvent) => move(e.clientX);
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = down;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = down;
    };
    const kd = onKey(true);
    const ku = onKey(false);
    el.addEventListener('pointermove', onPointer);
    el.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    const draw = () => {
      ctx.clearRect(0, 0, GAME_W, GAME_H);
      const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
      bg.addColorStop(0, site.colors.coal);
      bg.addColorStop(1, site.colors.ink);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      for (const p of peps) {
        const img = sprites[p.img];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (img?.complete && img.naturalWidth > 0) ctx.drawImage(img, -p.r, -p.r, p.r * 2, p.r * 2);
        else {
          ctx.fillStyle = site.colors.red;
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      // Caixa de pizza.
      const x = boxX.current - BOX_W / 2;
      ctx.fillStyle = '#C98E4E';
      ctx.beginPath();
      ctx.roundRect(x, BOX_Y, BOX_W, BOX_H, 6);
      ctx.fill();
      ctx.fillStyle = '#A8733A';
      ctx.fillRect(x, BOX_Y + 9, BOX_W, 3);
      ctx.fillStyle = site.colors.ink;
      ctx.font = '800 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FORNO NERO', boxX.current, BOX_Y + 28);
    };

    const finish = () => {
      done = true;
      const saved = saveRecord(points);
      setRecord(saved.record);
      setIsNew(saved.isNew);
      setScore(points);
      setLeft(0);
      setPhase('over');
    };

    const tick = (now: number) => {
      if (done) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir) boxX.current = clamp(boxX.current + dir * 320 * dt, BOX_W / 2, GAME_W - BOX_W / 2);
      sinceSpawn += dt;
      if (sinceSpawn >= spawnInterval(elapsed, game.durationSeconds)) {
        sinceSpawn = 0;
        peps.push(spawn(Math.random, elapsed, game.durationSeconds, sprites.length));
      }
      const res = step(peps, dt, boxX.current);
      peps = res.peps;
      points += res.caught;
      draw();
      hud += dt;
      if (hud >= 0.2) {
        hud = 0;
        setScore(points);
        setLeft(Math.max(0, Math.ceil(game.durationSeconds - elapsed)));
      }
      if (elapsed >= game.durationSeconds) finish();
      else frame = window.requestAnimationFrame(tick);
    };
    draw();
    frame = window.requestAnimationFrame(tick);
    return () => {
      done = true;
      window.cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onPointer);
      el.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [phase, game.durationSeconds, images.pepperoni]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm" aria-live="off">
        <p>
          Pontos: <strong data-testid="game-score" className="text-lg text-ember">{score}</strong>
        </p>
        <p>
          Tempo: <strong data-testid="game-time">{left}s</strong>
        </p>
        <p>
          {texts.game.recordLabel}: <strong data-testid="game-record">{record}</strong>
        </p>
      </div>
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-line bg-ink">
        <canvas ref={canvas} width={GAME_W} height={GAME_H} role="img" aria-label="Área do jogo: mova a caixa de pizza para pegar os pepperonis" className="block aspect-[3/4] w-full touch-none" />
        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/85 p-6 text-center">
            {phase === 'over' ? (
              <>
                <p className="font-display text-2xl font-extrabold">{score} {score === 1 ? 'pepperoni' : 'pepperonis'}!</p>
                {isNew && score > 0 && <p className="font-bold text-ember">Novo recorde!</p>}
              </>
            ) : (
              <p className="text-sm text-ash">{texts.game.instruction}</p>
            )}
            <button type="button" onClick={start} className="btn btn-red" data-autofocus>
              {phase === 'over' ? texts.game.again : texts.game.start}
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ash">Sem prêmio: é só diversão enquanto a pizza chega. No teclado, use as setas.</p>
    </div>
  );
}

export default function GameModal() {
  const { open, closeGame } = useGame();
  return (
    <Modal open={open} onClose={closeGame} title={site.texts.game.title} maxWidth="max-w-md">
      <Game />
    </Modal>
  );
}
