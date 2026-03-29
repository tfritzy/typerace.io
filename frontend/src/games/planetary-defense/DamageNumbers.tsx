import { useEffect, useRef, useState, useCallback } from "react";
import type { PlanetaryDefenseGame } from "./game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { DamageData } from "./state";

const PIXEL_FONT = "'Press Start 2P', monospace";
const DURATION_MS = 900;
const FLY_DISTANCE = 60;
const BASE_FONT_SIZE = 18;

interface DamageNumber {
  id: number;
  amount: number;
  xPct: number;
  yPct: number;
  dx: number;
  dy: number;
  killed: boolean;
}

export const DamageNumbers = ({
  gameRef,
}: {
  gameRef: React.RefObject<PlanetaryDefenseGame | null>;
}) => {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let animId: number;

    const trySubscribe = () => {
      const game = gameRef.current;
      if (!game) {
        animId = requestAnimationFrame(trySubscribe);
        return;
      }

      unsub = game.state.onDamageDealt.subscribe((data: DamageData) => {
        const id = nextIdRef.current++;
        const angle = Math.random() * Math.PI * 2;
        const dx = Math.cos(angle) * FLY_DISTANCE;
        const dy = Math.sin(angle) * FLY_DISTANCE;
        setNumbers((prev) => [
          ...prev,
          {
            id,
            amount: data.amount,
            xPct: (data.x / CANVAS_WIDTH) * 100,
            yPct: (data.y / CANVAS_HEIGHT) * 100,
            dx,
            dy,
            killed: data.killed,
          },
        ]);
      });
    };

    animId = requestAnimationFrame(trySubscribe);

    return () => {
      cancelAnimationFrame(animId);
      unsub?.();
    };
  }, [gameRef]);

  const handleAnimationEnd = useCallback((id: number) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <>
      <style>{`
        @keyframes damage-pop {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          12% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 1;
          }
          25% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4);
            opacity: 0;
          }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {numbers.map((n) => (
          <div
            key={n.id}
            onAnimationEnd={() => handleAnimationEnd(n.id)}
            style={{
              position: "absolute",
              left: `${n.xPct}%`,
              top: `${n.yPct}%`,
              fontFamily: PIXEL_FONT,
              fontSize: `${BASE_FONT_SIZE}px`,
              fontWeight: 400,
              color: n.killed ? "#fbbf24" : "#ffffff",
              ["--dx" as string]: `${n.dx}px`,
              ["--dy" as string]: `${n.dy}px`,
              animation: `damage-pop ${DURATION_MS}ms ease-out forwards`,
              WebkitTextStroke: "2px #000",
              paintOrder: "stroke fill",
              willChange: "transform, opacity",
            }}
          >
            {n.amount}
          </div>
        ))}
      </div>
    </>
  );
};
