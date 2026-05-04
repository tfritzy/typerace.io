import { useEffect, useRef, useState } from "react";

const GHOST_SHRINK_PER_SEC = 36;
const GHOST_DELAY_MS = 100;

interface AnimatedHealthBarProps {
  health: number;
  maxHealth: number;
  name: string;
}

export const AnimatedHealthBar = ({ health, maxHealth, name }: AnimatedHealthBarProps) => {
  const toPct = (h: number) =>
    maxHealth > 0 ? Math.max(0, Math.min(100, (h / maxHealth) * 100)) : 0;

  const healthPct = toPct(health);

  const prevHealthRef = useRef(health);
  const ghostPctRef = useRef(healthPct);
  const targetPctRef = useRef(healthPct);
  const [ghostPct, setGhostPct] = useState(healthPct);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const shrinkingRef = useRef(false);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startShrinking = () => {
    shrinkingRef.current = true;
    lastTimeRef.current = null;
    const animate = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const next = Math.max(targetPctRef.current, ghostPctRef.current - GHOST_SHRINK_PER_SEC * dt);
      ghostPctRef.current = next;
      setGhostPct(next);
      if (next > targetPctRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        shrinkingRef.current = false;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    targetPctRef.current = healthPct;

    if (health < prevHealthRef.current) {
      const prevPct = toPct(prevHealthRef.current);
      if (prevPct > ghostPctRef.current) {
        ghostPctRef.current = prevPct;
        setGhostPct(prevPct);
      }
      if (!shrinkingRef.current && !delayTimerRef.current) {
        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          startShrinking();
        }, GHOST_DELAY_MS);
      }
    } else if (health > prevHealthRef.current) {
      ghostPctRef.current = healthPct;
      setGhostPct(healthPct);
    }

    prevHealthRef.current = health;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [health, maxHealth]);

  return (
    <div
      className="px-4 pb-3 pt-2"
      style={{ background: "linear-gradient(to top, rgba(10,10,26,0.82) 0%, transparent 100%)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "rgba(180,30,60,0.8)" }}
          >
            Boss
          </span>
          <span
            className="text-[12px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "#e03050" }}
          >
            {name}
          </span>
        </div>
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: "rgba(200,50,80,0.7)" }}
        >
          {Math.round(health)} / {maxHealth}
        </span>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 14,
          borderRadius: 4,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(180,30,60,0.4)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${ghostPct}%`,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${healthPct}%`,
            background: "#c0192f",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
};
