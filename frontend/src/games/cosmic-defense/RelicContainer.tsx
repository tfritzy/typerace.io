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
      {collectedRelics.map((relicId) => {
        const relic = RELIC_MAP.get(relicId);
        if (!relic) return null;
        return (
          <div
            key={relicId}
            className="w-8 h-8 rounded border border-[rgba(249,226,175,0.3)] bg-[rgba(249,226,175,0.06)] flex items-center justify-center"
            title={`${relic.name}: ${relic.description}`}
          >
            <img
              src={relic.sprite}
              alt={relic.name}
              style={{ width: 22, height: 22, imageRendering: "pixelated" }}
            />
          </div>
        );
      })}
      {collectedRelics.length === 0 && (
        <>
          <div className="w-8 h-8 rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]" />
          <div className="w-8 h-8 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]" />
        </>
      )}
      {pendingRelic && (
        <RelicDropOverlay relicId={pendingRelic} onContinue={handleContinue} />
      )}
    </>
  );
};
