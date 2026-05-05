import { useCallback, useEffect, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { RELIC_MAP, type RelicId, type RelicDefinition } from "./relics";
import { RelicDropOverlay } from "./RelicDropOverlay";
import { STREAK_MILESTONE_INTERVAL } from "./state";
import { MAX_VITAL_MATRIX_BONUS } from "./constants";

interface RelicContainerProps {
  game: CosmicDefenseGame | null;
}

function getRelicBadge(
  relicId: RelicId,
  relic: RelicDefinition,
  streak: number,
  killHealthBonus: number,
): string | null {
  switch (relicId) {
    case "flow_state":
      if (relic.effects.streakDamageBonus === undefined) return null;
      return `${Math.round(Math.min(25, streak * relic.effects.streakDamageBonus * 100))}`;
    case "vital_matrix":
      return `${Math.min(MAX_VITAL_MATRIX_BONUS, killHealthBonus)}`;
    case "chrono_burst":
      return `${streak % STREAK_MILESTONE_INTERVAL}`;
    case "blizzard":
      if (relic.effects.blizzardFreezeInterval === undefined) return null;
      return `${streak % relic.effects.blizzardFreezeInterval}`;
    default:
      return null;
  }
}

export const RelicContainer = ({ game }: RelicContainerProps) => {
  const [pendingRelic, setPendingRelic] = useState<RelicId | null>(null);
  const [collectedRelics, setCollectedRelics] = useState<RelicId[]>([]);
  const [streak, setStreak] = useState(0);
  const [killHealthBonus, setKillHealthBonus] = useState(0);

  useEffect(() => {
    if (!game) {
      setCollectedRelics([]);
      setPendingRelic(null);
      setStreak(0);
      setKillHealthBonus(0);
      return;
    }
    setCollectedRelics([...game.state.relics]);
    setStreak(game.state.perfectWordStreak);
    setKillHealthBonus(game.state.planetHealthFromKills);
    const unsubRelic = game.state.onRelicDropped.subscribe((relicId) => {
      setCollectedRelics([...game.state.relics]);
      setPendingRelic(relicId);
    });
    const unsubStreak = game.state.onStreakChanged.subscribe((s) => {
      setStreak(s);
    });
    const unsubKills = game.state.onEnemyEntityDeath.subscribe(() => {
      setKillHealthBonus(game.state.planetHealthFromKills);
    });
    return () => {
      unsubRelic();
      unsubStreak();
      unsubKills();
    };
  }, [game]);

  const handleContinue = useCallback(() => {
    setPendingRelic(null);
    game?.setPaused(false);
  }, [game]);

  return (
    <>
      <div className="flex items-center gap-1">
        {collectedRelics.map((relicId) => {
          const relic = RELIC_MAP.get(relicId);
          if (!relic) return null;
          const badge = getRelicBadge(relicId, relic, streak, killHealthBonus);
          return (
            <div
              key={relicId}
              style={{ position: "relative", width: 22, height: 22, flexShrink: 0 }}
            >
              <img
                src={relic.sprite}
                alt={relic.name}
                title={`${relic.name}: ${relic.description}`}
                style={{ width: 22, height: 22, imageRendering: "pixelated" }}
              />
              {badge !== null && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -2,
                    fontSize: 7,
                    fontWeight: "bold",
                    lineHeight: 1,
                    background: "rgba(0,0,0,0.8)",
                    color: "#fff",
                    padding: "1px 2px",
                    borderRadius: 2,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {pendingRelic && (
        <RelicDropOverlay relicId={pendingRelic} onContinue={handleContinue} />
      )}
    </>
  );
};
