import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import type { GameState } from "./state";

const GHOST_SHRINK_PER_SEC = 20;
const GHOST_DELAY_MS = 150;

interface PlanetHealthBarProps {
  state: GameState;
}

export const PlanetHealthBar = ({ state }: PlanetHealthBarProps) => {
  const [health, setHealth] = useState(() => state.planetHealth);
  const [maxHealth, setMaxHealth] = useState(() => state.maxPlanetHealth);

  const toPct = (h: number) =>
    maxHealth > 0 ? Math.max(0, Math.min(100, (h / maxHealth) * 100)) : 0;

  const healthPct = toPct(health);
  const ratio = maxHealth > 0 ? Math.max(0, health / maxHealth) : 1;

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

  useEffect(() => {
    const sync = () => {
      setHealth(Math.max(0, state.planetHealth));
      setMaxHealth(state.maxPlanetHealth);
    };
    const unsub = state.onPlanetDamaged.subscribe(sync);
    const interval = setInterval(sync, 250);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [state]);

  const isLow = ratio < 0.3;
  const isMid = ratio >= 0.3 && ratio < 0.6;

  const barFill = isLow
    ? "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)"
    : isMid
    ? "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)"
    : "linear-gradient(90deg, #0ea5e9 0%, #22d3ee 60%, #6ee7f7 100%)";

  const borderColor = isLow
    ? "rgba(239,68,68,0.55)"
    : isMid
    ? "rgba(245,158,11,0.5)"
    : "rgba(34,211,238,0.45)";

  const glowColor = isLow
    ? "rgba(239,68,68,0.28)"
    : isMid
    ? "rgba(245,158,11,0.22)"
    : "rgba(14,165,233,0.22)";

  const iconColor = isLow ? "#f87171" : isMid ? "#fbbf24" : "#38bdf8";
  const labelColor = isLow ? "#fca5a5" : isMid ? "#fcd34d" : "#7dd3fc";
  const hpColor = isLow ? "rgba(252,165,165,0.75)" : isMid ? "rgba(253,211,77,0.7)" : "rgba(125,211,252,0.7)";

  return (
    <div
      className="pointer-events-none"
      style={{
        width: 190,
        background: "linear-gradient(160deg, rgba(8,8,28,0.92) 0%, rgba(4,4,18,0.95) 100%)",
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "8px 11px 9px",
        boxShadow: `0 0 18px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Globe size={11} color={iconColor} strokeWidth={2} />
        <span
          className="text-[9px] font-bold uppercase tracking-[0.32em]"
          style={{ color: labelColor }}
        >
          Planet
        </span>
        <span
          className="ml-auto text-[9px] font-semibold tabular-nums"
          style={{ color: hpColor }}
        >
          {Math.round(health)}&thinsp;/&thinsp;{maxHealth}
        </span>
      </div>
      <div
        className="relative w-full"
        style={{
          height: 11,
          borderRadius: 6,
          background: "rgba(0,0,0,0.55)",
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${ghostPct}%`,
            background: "rgba(255,255,255,0.55)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${healthPct}%`,
            background: barFill,
            borderRadius: 6,
            transition: "background 0.5s",
            boxShadow: isLow ? "0 0 6px rgba(239,68,68,0.6)" : isMid ? "0 0 6px rgba(245,158,11,0.5)" : "0 0 6px rgba(34,211,238,0.5)",
          }}
        />
      </div>
    </div>
  );
};
