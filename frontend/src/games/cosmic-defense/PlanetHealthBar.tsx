import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import type { GameState } from "./state";
import { HealthCard, type HealthCardTheme } from "../components/HealthCard";

interface PlanetHealthBarProps {
  state: GameState;
}

function planetTheme(ratio: number): HealthCardTheme {
  const isLow = ratio < 0.3;
  const isMid = ratio >= 0.3 && ratio < 0.6;
  return {
    barFill: isLow
      ? "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)"
      : isMid
      ? "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)"
      : "linear-gradient(90deg, #0ea5e9 0%, #22d3ee 60%, #6ee7f7 100%)",
    borderColor: isLow ? "rgba(239,68,68,0.55)" : isMid ? "rgba(245,158,11,0.5)" : "rgba(34,211,238,0.45)",
    glowColor: isLow ? "rgba(239,68,68,0.28)" : isMid ? "rgba(245,158,11,0.22)" : "rgba(14,165,233,0.22)",
    barGlow: isLow ? "0 0 6px rgba(239,68,68,0.6)" : isMid ? "0 0 6px rgba(245,158,11,0.5)" : "0 0 6px rgba(34,211,238,0.5)",
    iconColor: isLow ? "#f87171" : isMid ? "#fbbf24" : "#38bdf8",
    labelColor: isLow ? "#fca5a5" : isMid ? "#fcd34d" : "#7dd3fc",
    hpColor: isLow ? "rgba(252,165,165,0.75)" : isMid ? "rgba(253,211,77,0.7)" : "rgba(125,211,252,0.7)",
  };
}

export const PlanetHealthBar = ({ state }: PlanetHealthBarProps) => {
  const [health, setHealth] = useState(() => state.planetHealth);
  const [maxHealth, setMaxHealth] = useState(() => state.maxPlanetHealth);

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

  const ratio = maxHealth > 0 ? Math.max(0, health / maxHealth) : 1;

  return (
    <HealthCard
      health={health}
      maxHealth={maxHealth}
      label="Planet"
      icon={<Globe size={11} strokeWidth={2} />}
      theme={planetTheme(ratio)}
    />
  );
};

