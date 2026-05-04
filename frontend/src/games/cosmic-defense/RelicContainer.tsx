import { useCallback, useEffect, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { RELIC_MAP, type RelicId } from "./relics";
import { RelicDropOverlay } from "./RelicDropOverlay";

interface RelicContainerProps {
  game: CosmicDefenseGame | null;
}

export const RelicContainer = ({ game }: RelicContainerProps) => {
  const [pendingRelic, setPendingRelic] = useState<RelicId | null>(null);
  const [collectedRelics, setCollectedRelics] = useState<RelicId[]>([]);

  useEffect(() => {
    if (!game) {
      setCollectedRelics([]);
      setPendingRelic(null);
      return;
    }
    setCollectedRelics([...game.state.relics]);
    const unsub = game.state.onRelicDropped.subscribe((relicId) => {
      setCollectedRelics([...game.state.relics]);
      setPendingRelic(relicId);
    });
    return unsub;
  }, [game]);

  const handleContinue = useCallback(() => {
    setPendingRelic(null);
    game?.setPaused(false);
  }, [game]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        {collectedRelics.map((relicId) => {
          const relic = RELIC_MAP.get(relicId);
          if (!relic) return null;
          return (
            <img
              key={relicId}
              src={relic.sprite}
              alt={relic.name}
              title={`${relic.name}: ${relic.description}`}
              style={{ width: 22, height: 22, imageRendering: "pixelated" }}
            />
          );
        })}
      </div>
      {pendingRelic && (
        <RelicDropOverlay relicId={pendingRelic} onContinue={handleContinue} />
      )}
    </>
  );
};
