import { useEffect, useRef, useState } from "react";

const GHOST_SHRINK_PER_SEC = 20;
const GHOST_DELAY_MS = 150;

export interface HealthCardTheme {
  barFill: string;
  borderColor: string;
  glowColor: string;
  barGlow: string;
  labelColor: string;
  hpColor: string;
  iconColor: string;
}

interface HealthCardProps {
  health: number;
  maxHealth: number;
  label: string;
  icon: React.ReactNode;
  theme: HealthCardTheme;
}

export const HealthCard = ({ health, maxHealth, label, icon, theme }: HealthCardProps) => {
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
      if (!shrinkingRef.current) {
        if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
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
      className="pointer-events-none"
      style={{
        width: 190,
        background: "linear-gradient(160deg, rgba(8,8,28,0.92) 0%, rgba(4,4,18,0.95) 100%)",
        border: `1px solid ${theme.borderColor}`,
        borderRadius: 10,
        padding: "8px 11px 9px",
        boxShadow: `0 0 18px ${theme.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: theme.iconColor, display: "flex", alignItems: "center" }}>{icon}</span>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.32em]"
          style={{ color: theme.labelColor }}
        >
          {label}
        </span>
        <span
          className="ml-auto text-[9px] font-semibold tabular-nums"
          style={{ color: theme.hpColor }}
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
          border: `1px solid ${theme.borderColor}`,
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
            background: theme.barFill,
            borderRadius: 6,
            transition: "background 0.5s",
            boxShadow: theme.barGlow,
          }}
        />
      </div>
    </div>
  );
};
