import { useCallback, useEffect, useRef, useState } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import type { LabelData } from "./game";
import { spawnMeteor, handleTypedCharacter } from "./state";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

const PIXEL_FONT = "'Press Start 2P', monospace";
const LABEL_FONT_SIZE = 16;
const TYPED_COLOR = "#90ee90";
const UNTYPED_COLOR = "#ffffff";

interface LabelDom {
  container: HTMLDivElement;
  typedSpan: HTMLSpanElement;
  untypedSpan: HTMLSpanElement;
}

const LabelOverlay = ({ gameRef }: { gameRef: React.RefObject<PlanetaryDefenseGame | null> }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelDomsRef = useRef(new Map<number, LabelDom>());
  const shadowRef = useRef("");
  const lastScaleRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const buildShadow = (s: number): string => {
      return [
        `${-s}px ${-s}px 0 #000`,
        `${s}px ${-s}px 0 #000`,
        `${-s}px ${s}px 0 #000`,
        `${s}px ${s}px 0 #000`,
        `0 ${-s}px 0 #000`,
        `0 ${s}px 0 #000`,
        `${-s}px 0 0 #000`,
        `${s}px 0 0 #000`,
      ].join(", ");
    };

    const createLabelDom = (overlay: HTMLDivElement, shadow: string, fontSize: string): LabelDom => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.fontFamily = PIXEL_FONT;
      container.style.whiteSpace = "nowrap";
      container.style.pointerEvents = "none";
      container.style.transform = "translate(-50%, -100%)";
      container.style.fontSize = fontSize;
      container.style.textShadow = shadow;
      container.style.lineHeight = "1";

      const typedSpan = document.createElement("span");
      typedSpan.style.color = TYPED_COLOR;
      container.appendChild(typedSpan);

      const untypedSpan = document.createElement("span");
      untypedSpan.style.color = UNTYPED_COLOR;
      container.appendChild(untypedSpan);

      overlay.appendChild(container);
      return { container, typedSpan, untypedSpan };
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const game = gameRef.current;
      const overlay = overlayRef.current;
      if (!game || !overlay) return;

      const labels: LabelData[] = game.labels;
      const containerWidth = overlay.clientWidth;
      const scale = containerWidth / CANVAS_WIDTH;
      const fontSize = Math.max(6, Math.round(LABEL_FONT_SIZE * scale));
      const fontSizePx = `${fontSize}px`;

      if (scale !== lastScaleRef.current) {
        lastScaleRef.current = scale;
        const strokePx = Math.max(1, Math.round(2 * scale));
        shadowRef.current = buildShadow(strokePx);
        for (const dom of labelDomsRef.current.values()) {
          dom.container.style.fontSize = fontSizePx;
          dom.container.style.textShadow = shadowRef.current;
        }
      }

      const activeIds = new Set<number>();
      for (const label of labels) {
        activeIds.add(label.id);
        let dom = labelDomsRef.current.get(label.id);
        if (!dom) {
          dom = createLabelDom(overlay, shadowRef.current, fontSizePx);
          labelDomsRef.current.set(label.id, dom);
        }

        dom.container.style.left = `${(label.x / CANVAS_WIDTH) * 100}%`;
        dom.container.style.top = `${(label.y / CANVAS_HEIGHT) * 100}%`;
        dom.typedSpan.textContent = label.word.slice(0, label.typedCount);
        dom.untypedSpan.textContent = label.word.slice(label.typedCount);
      }

      for (const [id, dom] of labelDomsRef.current) {
        if (!activeIds.has(id)) {
          dom.container.remove();
          labelDomsRef.current.delete(id);
        }
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      for (const dom of labelDomsRef.current.values()) {
        dom.container.remove();
      }
      labelDomsRef.current.clear();
    };
  }, [gameRef]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
};

const PlanetHealthBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#fbbf24" : "#ef4444";

  return (
    <div className="absolute top-3 right-3 z-10" style={{ fontFamily: PIXEL_FONT }}>
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
        unsubscribe = game.state.onPlanetDamaged.subscribe(() => {
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;
      handleTypedCharacter(game.state, e.key);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSpawnMeteor = useCallback(() => {
    const game = gameRef.current;
    if (game) spawnMeteor(game.state);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <LabelOverlay gameRef={gameRef} />
      <PlanetHealthBar ratio={healthRatio} />
      <button
        onClick={handleSpawnMeteor}
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: "10px",
          letterSpacing: "1px",
          imageRendering: "pixelated",
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
