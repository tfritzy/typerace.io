import { useEffect, useRef, useState } from "react";

interface BossHealthBarProps {
  health: number;
  maxHealth: number;
  name: string;
}

export const BossHealthBar = ({ health, maxHealth, name }: BossHealthBarProps) => {
  const healthPct = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;
  const prevHealthRef = useRef(health);
  const [ghostPct, setGhostPct] = useState(healthPct);
  const [ghostTransition, setGhostTransition] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const newPct = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;

    if (health < prevHealthRef.current) {
      const prevPct = maxHealth > 0 ? Math.max(0, Math.min(100, (prevHealthRef.current / maxHealth) * 100)) : 0;
      setGhostPct(prevPct);
      setGhostTransition(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setGhostTransition(true);
        setGhostPct(newPct);
      }, 300);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGhostTransition(false);
      setGhostPct(newPct);
    }

    prevHealthRef.current = health;
  }, [health, maxHealth]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 pt-2"
      style={{ background: "linear-gradient(to top, rgba(10,10,26,0.82) 0%, transparent 100%)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "rgba(243,139,168,0.7)" }}
          >
            Boss
          </span>
          <span
            className="text-[12px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "#f38ba8" }}
          >
            {name}
          </span>
        </div>
        <span
          className="text-[10px] font-semibold tabular-nums"
          style={{ color: "rgba(243,139,168,0.6)" }}
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
          border: "1px solid rgba(243,139,168,0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${ghostPct}%`,
            background: "rgba(255,255,255,0.75)",
            borderRadius: 4,
            transition: ghostTransition ? "width 0.5s ease-out" : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${healthPct}%`,
            background: "#f38ba8",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
};
