import { useCallback, useEffect, useRef, useState } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import { startNextWave } from "./state";
import { LabelOverlay } from "./LabelOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { InventoryOverlay } from "./inventory";
import { PIXEL_FONT } from "./constants";

const PlanetHealthBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#fbbf24" : "#ef4444";

  return (
    <div className="absolute top-3 right-3 z-10">
      <div
        style={{
          background: "rgba(10, 10, 26, 0.85)",
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
  const [waveNumber, setWaveNumber] = useState(0);
  const [waveActive, setWaveActive] = useState(false);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;
    let unsubDamage: (() => void) | null = null;
    let unsubWaveComplete: (() => void) | null = null;
    let unsubWaveActive: (() => void) | null = null;

    createPlanetaryDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        unsubDamage = game.state.onPlanetDamaged.subscribe(() => {
          setHealthRatio(game.state.planetHealth / game.state.maxPlanetHealth);
        });
        unsubWaveComplete = game.state.onWaveComplete.subscribe(() => {
          setWaveNumber(game.state.wave.wave);
          setWaveActive(false);
        });
        unsubWaveActive = game.state.onWaveActiveChanged.subscribe(() => {
          setWaveActive(game.state.waveActive);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Planetary Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubDamage?.();
      unsubWaveComplete?.();
      unsubWaveActive?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const waveActiveRef = useRef(false);
  waveActiveRef.current = waveActive;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (waveActiveRef.current) return;
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;
      game.handleTypedCharacter(e.key);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNextWave = useCallback(() => {
    const game = gameRef.current;
    if (game) {
      startNextWave(game.state);
      setWaveNumber(game.state.wave.wave);
      setWaveActive(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none"
      style={{ fontFamily: PIXEL_FONT }}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <LabelOverlay gameRef={gameRef} />
      <PhraseOverlay gameRef={gameRef} visible={waveActive} />
      <InventoryOverlay waveActive={waveActive} />
      <PlanetHealthBar ratio={healthRatio} />
      <div className="absolute top-3 left-3 z-10">
        <div
          style={{
            background: "rgba(10, 10, 26, 0.85)",
            padding: "10px 14px",
            imageRendering: "pixelated",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#cdd6f4",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
            }}
          >
            WAVE {waveNumber}
          </div>
        </div>
        {!waveActive && (
          <button
            onClick={handleNextWave}
            style={{
              fontSize: "10px",
              letterSpacing: "1px",
              imageRendering: "pixelated",
              background: "rgba(74, 222, 128, 0.85)",
              color: "#0a0a1a",
              padding: "8px 14px",
              marginTop: "6px",
              display: "block",
              width: "100%",
            }}
            className="cursor-pointer hover:brightness-125"
          >
            {waveNumber === 0 ? "START" : "NEXT WAVE"}
          </button>
        )}
      </div>
    </div>
  );
};
