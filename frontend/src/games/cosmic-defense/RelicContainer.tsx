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
  const [animatingRelic, setAnimatingRelic] = useState<RelicId | null>(null);
  const [collectedRelics, setCollectedRelics] = useState<RelicId[]>([]);

  useEffect(() => {
    if (!game) {
      setCollectedRelics([]);
      setPendingRelic(null);
      setAnimatingRelic(null);
      return;
    }

    setCollectedRelics([...game.state.relics]);

    const unsubDropped = game.state.onRelicDropped.subscribe((data) => {
      setCollectedRelics([...game.state.relics]);
      setAnimatingRelic(data.relicId);
      setPendingRelic(null);
    });

    const unsubArrived = game.state.onRelicPickupArrived.subscribe((relicId) => {
      setAnimatingRelic(null);
      setPendingRelic(relicId);
    });

    return () => {
      unsubDropped();
      unsubArrived();
    };
  }, [game]);

  const handleContinue = useCallback(() => {
    setPendingRelic(null);
    game?.unpause();
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
              style={{
                width: RELIC_ICON_SIZE,
                height: RELIC_ICON_SIZE,
                imageRendering: "pixelated",
                opacity: animatingRelic === relicId ? 0 : 1,
              }}
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
