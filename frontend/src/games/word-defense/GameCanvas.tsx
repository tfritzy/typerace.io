import { useEffect, useRef } from "react";
import { createWordDefenseGame } from "./game";
import type { WordDefenseGame } from "./game";

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<WordDefenseGame | null>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;

    createWordDefenseGame(div).then((game) => {
      if (cancelled) {
        game.destroy();
        return;
      }
      gameRef.current = game;
    });

    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ aspectRatio: "16/9" }} />;
};
