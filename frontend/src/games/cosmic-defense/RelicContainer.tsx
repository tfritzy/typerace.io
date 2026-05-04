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
      <div className="flex items-center gap-1">
        {collectedRelics.map((relicId) => {
          const relic = RELIC_MAP.get(relicId);
          if (!relic) return null;
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
              {relic.displayValue && (
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
                  {relic.displayValue}
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
