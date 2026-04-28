import { useEffect, useRef, useState } from "react";
import type { GameState } from "./state";
import { AnimatedHealthBar } from "../components/AnimatedHealthBar";

interface BossHealthBarProps {
  state: GameState;
  entityId: number;
}

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

  return <AnimatedHealthBar health={health} maxHealth={maxHealth} name={name} />;
};
