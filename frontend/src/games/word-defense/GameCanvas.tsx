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
    }).catch((err) => {
      console.error("Failed to initialize Word Defense:", err);
    });

    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
