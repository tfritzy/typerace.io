import { useCallback, useEffect, useRef } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

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
    const game = gameRef.current;
    const div = containerRef.current;
    if (!game || !div) return;

    const canvas = div.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const cx = (rect.width / 2) * scaleX;
    const cy = (rect.height / 2) * scaleY;
    game.handleSpawnMeteor(cx, cy);
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
