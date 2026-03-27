import { useCallback, useEffect, useRef } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PlanetaryDefenseGame | null>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;

    createPlanetaryDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
      })
      .catch((err) => {
        console.error("Failed to initialize Planetary Defense:", err);
      });

    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleSpawnMeteor = useCallback(() => {
    gameRef.current?.store.dispatch({ type: "spawnMeteor" });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <button
        onClick={handleSpawnMeteor}
        className="absolute top-2 left-2 z-10 px-3 py-1.5 bg-accent/80 hover:bg-accent text-background text-sm font-semibold rounded cursor-pointer"
      >
        Spawn Meteor
      </button>
    </div>
  );
};
