import { useCallback, useEffect, useRef, useState } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import { spawnMeteor, subscribe } from "./state";

const PIXEL_FONT = "'Press Start 2P', monospace";

const PlanetHealthBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#fbbf24" : "#ef4444";

  return (
    <div className="absolute top-3 right-3 z-10" style={{ fontFamily: PIXEL_FONT }}>
      <div
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          border: "3px solid #8b8fa3",
          padding: "10px 14px",
          imageRendering: "pixelated",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#cdd6f4",
            marginBottom: "8px",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
          }}
        >
          PLANET HABITABILITY
        </div>
        <div
          style={{
            background: "#0f0f23",
            border: "2px solid #4a5568",
            height: "14px",
            width: "180px",
          }}
        >
          <div
            style={{
              background: barColor,
              height: "100%",
              width: `${pct}%`,
              transition: "width 0.3s, background-color 0.5s",
              imageRendering: "pixelated",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "8px",
            color: "#a6adc8",
            marginTop: "6px",
            textAlign: "right",
          }}
        >
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
};

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PlanetaryDefenseGame | null>(null);
  const [healthRatio, setHealthRatio] = useState(1);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    createPlanetaryDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        unsubscribe = subscribe(game.state, () => {
          setHealthRatio(game.state.planetHealth / game.state.maxPlanetHealth);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Planetary Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleSpawnMeteor = useCallback(() => {
    const game = gameRef.current;
    if (game) spawnMeteor(game.state);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <PlanetHealthBar ratio={healthRatio} />
      <button
        onClick={handleSpawnMeteor}
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: "10px",
          letterSpacing: "1px",
          imageRendering: "pixelated",
          border: "3px solid #8b8fa3",
          background: "rgba(10, 10, 26, 0.85)",
          color: "#cdd6f4",
          padding: "8px 14px",
        }}
        className="absolute top-3 left-3 z-10 cursor-pointer hover:brightness-125"
      >
        SPAWN METEOR
      </button>
    </div>
  );
};
