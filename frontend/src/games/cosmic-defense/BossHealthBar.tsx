import { useEffect, useRef, useState } from "react";
import { Skull } from "lucide-react";
import type { GameState } from "./state";
import { HealthCard, type HealthCardTheme } from "../components/HealthCard";

interface BossHealthBarProps {
  state: GameState;
  entityId: number;
}

const BOSS_THEME: HealthCardTheme = {
  barFill: "linear-gradient(90deg, #9f1239 0%, #e11d48 60%, #fb7185 100%)",
  borderColor: "rgba(225,29,72,0.5)",
  glowColor: "rgba(225,29,72,0.25)",
  barGlow: "0 0 6px rgba(225,29,72,0.65)",
  iconColor: "#fb7185",
  labelColor: "#fda4af",
  hpColor: "rgba(253,164,175,0.7)",
};

export const BossHealthBar = ({ state, entityId }: BossHealthBarProps) => {
  const entity = state.entityById.get(entityId);
  const maxHealth = useRef(entity?.maxHealth ?? 0).current;
  const name = useRef(entity?.entityType ?? "").current;
  const [health, setHealth] = useState(() => entity?.health ?? maxHealth);

  useEffect(() => {
    return state.onDamageDealt.subscribe(() => {
      const e = state.entityById.get(entityId);
      if (e) setHealth(Math.max(0, e.health));
    });
  }, [state, entityId]);

  return (
    <HealthCard
      health={health}
      maxHealth={maxHealth}
      label={name}
      icon={<Skull size={11} strokeWidth={2} />}
      theme={BOSS_THEME}
    />
  );
};

