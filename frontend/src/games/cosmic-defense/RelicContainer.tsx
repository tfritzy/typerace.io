import { useCallback, useEffect, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { RELIC_MAP, type RelicId } from "./relics";
import { RelicDropOverlay } from "./RelicDropOverlay";

interface RelicContainerProps {
  game: CosmicDefenseGame | null;
}

const RELIC_ICON_SIZE = 22;
const RELICS_PER_ROW = 8;

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
    game?.removePauseReason("relic");
  }, [game]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${RELICS_PER_ROW}, ${RELIC_ICON_SIZE}px)`, gap: 4 }}>
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
