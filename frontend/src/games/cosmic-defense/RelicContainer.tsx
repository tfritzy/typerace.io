import { useCallback, useEffect, useRef, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { RELIC_MAP, type RelicId } from "./relics";
import { RelicDropOverlay } from "./RelicDropOverlay";

interface RelicContainerProps {
  game: CosmicDefenseGame | null;
}

const RELIC_ICON_SIZE = 22;
const RELICS_PER_ROW = 8;
const FLYING_RELIC_SIZE = 104;
const RELIC_FLIGHT_DURATION_MS = 700;

interface RelicFlightState {
  relicId: RelicId;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active: boolean;
}

export const RelicContainer = ({ game }: RelicContainerProps) => {
  const [pendingRelic, setPendingRelic] = useState<RelicId | null>(null);
  const [popupRelic, setPopupRelic] = useState<RelicId | null>(null);
  const [collectedRelics, setCollectedRelics] = useState<RelicId[]>([]);
  const [flight, setFlight] = useState<RelicFlightState | null>(null);
  const relicSlotRefs = useRef(new Map<RelicId, HTMLDivElement | null>());

  useEffect(() => {
    if (!game) {
      setCollectedRelics([]);
      setPendingRelic(null);
      setPopupRelic(null);
      setFlight(null);
      return;
    }
    setCollectedRelics([...game.state.relics]);
    const unsub = game.state.onRelicDropped.subscribe((relicId) => {
      setCollectedRelics([...game.state.relics]);
      setPendingRelic(relicId);
      setPopupRelic(null);
      setFlight(null);
    });
    return unsub;
  }, [game]);

  useEffect(() => {
    if (!pendingRelic || popupRelic === pendingRelic) return;
    const targetNode = relicSlotRefs.current.get(pendingRelic);
    if (!targetNode) return;

    const targetRect = targetNode.getBoundingClientRect();
    const startX = window.innerWidth / 2 - FLYING_RELIC_SIZE / 2;
    const startY = window.innerHeight * 0.38 - FLYING_RELIC_SIZE / 2;
    const endX = targetRect.left + targetRect.width / 2 - FLYING_RELIC_SIZE / 2;
    const endY = targetRect.top + targetRect.height / 2 - FLYING_RELIC_SIZE / 2;

    setFlight({
      relicId: pendingRelic,
      startX,
      startY,
      endX,
      endY,
      active: false,
    });

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setFlight((current) =>
          current?.relicId === pendingRelic ? { ...current, active: true } : current
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [pendingRelic, popupRelic]);

  const handleContinue = useCallback(() => {
    setPendingRelic(null);
    setPopupRelic(null);
    setFlight(null);
    game?.unpause();
  }, [game]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${RELICS_PER_ROW}, ${RELIC_ICON_SIZE}px)`, gap: 4 }}>
        {collectedRelics.map((relicId) => {
          const relic = RELIC_MAP.get(relicId);
          if (!relic) return null;
          const isPendingFlight = pendingRelic === relicId && popupRelic !== relicId;
          return (
            <div
              key={relicId}
              ref={(node) => {
                relicSlotRefs.current.set(relicId, node);
              }}
              style={{ width: RELIC_ICON_SIZE, height: RELIC_ICON_SIZE }}
            >
              <img
                src={relic.sprite}
                alt={relic.name}
                title={`${relic.name}: ${relic.description}`}
                style={{
                  width: RELIC_ICON_SIZE,
                  height: RELIC_ICON_SIZE,
                  imageRendering: "pixelated",
                  opacity: isPendingFlight ? 0 : 1,
                  transition: "opacity 0.15s ease-out",
                }}
              />
            </div>
          );
        })}
      </div>
      {flight && (
        <img
          src={RELIC_MAP.get(flight.relicId)?.sprite}
          alt=""
          aria-hidden="true"
          onTransitionEnd={() => {
            if (!flight.active) return;
            setPopupRelic(flight.relicId);
            setFlight(null);
          }}
          style={{
            position: "fixed",
            left: flight.startX,
            top: flight.startY,
            width: FLYING_RELIC_SIZE,
            height: FLYING_RELIC_SIZE,
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 45,
            filter: "drop-shadow(0 0 26px rgba(249,226,175,0.65))",
            transform: flight.active
              ? `translate(${flight.endX - flight.startX}px, ${flight.endY - flight.startY}px) scale(0.24)`
              : "translate(0px, 0px) scale(1)",
            opacity: flight.active ? 0.9 : 1,
            transition: `transform ${RELIC_FLIGHT_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${RELIC_FLIGHT_DURATION_MS}ms ease-out`,
          }}
        />
      )}
      {popupRelic && (
        <RelicDropOverlay relicId={popupRelic} onContinue={handleContinue} />
      )}
    </>
  );
};
