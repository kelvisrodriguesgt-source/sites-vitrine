import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface GameApi {
  open: boolean;
  openGame: () => void;
  closeGame: () => void;
}

const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openGame = useCallback(() => setOpen(true), []);
  const closeGame = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openGame, closeGame }), [open, openGame, closeGame]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame precisa estar dentro de <GameProvider>');
  return ctx;
}
