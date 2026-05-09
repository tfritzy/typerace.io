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
  const [showRelicOverlay, setShowRelicOverlay] = useState(false);
  const [collectedRelics, setCollectedRelics] = useState<RelicId[]>([]);

  useEffect(() => {
    if (!game) {
      setCollectedRelics([]);
      setShowRelicOverlay(false);
      return;
    }

    setCollectedRelics([...game.state.relics]);

    const unsubArrived = game.onRelicCollected(() => {
      game.pause();
      setCollectedRelics([...game.state.relics]);
      setShowRelicOverlay(true);
    });

    return unsubArrived;
  }, [game]);

  const handleContinue = useCallback(() => {
    if (game) {
      game.unpause();
    }
    setShowRelicOverlay(false);
  }, [game]);

  const latestRelicId = showRelicOverlay && collectedRelics.length > 0 ? collectedRelics[collectedRelics.length - 1] : null;

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
              }}
            />
          );
        })}
      </div>
      {latestRelicId && (
        <RelicDropOverlay relicId={latestRelicId} onContinue={handleContinue} />
      )}
    </>
  );
};
