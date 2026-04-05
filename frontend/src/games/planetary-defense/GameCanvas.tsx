import { useCallback, useEffect, useRef, useState } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import { startNextWave, getPhraseText } from "./state";
import { LabelOverlay } from "./LabelOverlay";
import { CANVAS_WIDTH } from "./constants";

const PIXEL_FONT = "'Press Start 2P', monospace";

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

const PhraseOverlay = ({
  gameRef,
  visible,
}: {
  gameRef: React.RefObject<PlanetaryDefenseGame | null>;
  visible: boolean;
}) => {
  const typedRef = useRef<HTMLSpanElement>(null);
  const untypedRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const game = gameRef.current;
      if (!game || !typedRef.current || !untypedRef.current || !containerRef.current) return;

      const phrase = game.state.phrase;
      const text = getPhraseText(phrase);
      typedRef.current.textContent = text.slice(0, phrase.typedCount);
      untypedRef.current.textContent = text.slice(phrase.typedCount);

      const overlayWidth = containerRef.current.parentElement?.clientWidth ?? 0;
      const scale = overlayWidth / CANVAS_WIDTH;
      const fontSize = Math.max(10, Math.round(14 * scale));
      containerRef.current.style.fontSize = `${fontSize}px`;
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameRef, visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        fontFamily: PIXEL_FONT,
        fontSize: "14px",
        lineHeight: "2.4",
        height: "4.8em",
        overflow: "hidden",
        background: "rgba(10, 10, 26, 0.9)",
        padding: "10px 20px",
        border: "2px solid #4a5568",
        zIndex: 10,
        overflowWrap: "break-word",
      }}
    >
      <span ref={typedRef} style={{ color: "#90ee90" }} />
      <span ref={untypedRef} style={{ color: "#ffffff" }} />
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
      })
      .catch((err) => {
        console.error("Failed to initialize Planetary Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubDamage?.();
      unsubWaveComplete?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
      className="w-full h-full relative"
      style={{ fontFamily: PIXEL_FONT }}
    >
      <LabelOverlay gameRef={gameRef} />
      <PhraseOverlay gameRef={gameRef} visible={waveActive} />
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
