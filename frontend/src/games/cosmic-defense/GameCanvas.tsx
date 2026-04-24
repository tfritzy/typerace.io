import { useCallback, useEffect, useRef, useState } from "react";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { TargetingMode, xpForNextLevel } from "./state";
import type { EntityState } from "./state";
import { InspectionPanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { ShipChoiceOverlay } from "./ShipChoiceOverlay";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import type { EntityType } from "./types";

const UI_REFERENCE_WIDTH = 700;

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CosmicDefenseGame | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PlacementSlot | null>(null);
  const [shipPreviews, setShipPreviews] = useState<Map<EntityType, string>>(new Map());
  const [slots, setSlots] = useState<PlacementSlot[]>(() => generateSlots());
  const [uiScale, setUiScale] = useState(1);
  const [, setInspectTick] = useState(0);
  const [pendingChoice, setPendingChoice] = useState(true);
  const [level, setLevel] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpNeeded, setXpNeeded] = useState(() => xpForNextLevel(1));
  const [choices, setChoices] = useState<EntityType[]>([]);

  const syncFromGame = useCallback((game: CosmicDefenseGame) => {
    setSlots(game.getSlots());
    setChoices(game.getChoices());
    setPendingChoice(game.state.pendingChoice);
    setLevel(game.state.level);
    setElapsed(Math.floor(game.state.spawner.elapsed));
    setXp(game.state.xp);
    setXpNeeded(xpForNextLevel(game.state.level));
    setSelectedSlot((prev) => {
      if (!prev) return prev;
      return game.getSlots().find((slot) => slot.index === prev.index) ?? null;
    });
  }, []);

  useEffect(() => {
    if (!selectedSlot?.entityId) return;
    const interval = setInterval(() => setInspectTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, [selectedSlot?.entityId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const game = gameRef.current;
      if (game) syncFromGame(game);
    }, 200);
    return () => clearInterval(interval);
  }, [syncFromGame]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    game.setPaused(selectedSlot !== null || pendingChoice);
  }, [selectedSlot, pendingChoice]);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setUiScale(Math.min(1, entry.contentRect.width / UI_REFERENCE_WIDTH));
    });
    ro.observe(div);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;
    let unsubLevelUp: (() => void) | null = null;

    createCosmicDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        setShipPreviews(game.shipPreviews);
        syncFromGame(game);
        unsubLevelUp = game.state.onLevelUp.subscribe(() => {
          queueMicrotask(() => syncFromGame(game));
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Cosmic Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubLevelUp?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleSlotClick = useCallback((slot: PlacementSlot) => {
    if (pendingChoice) return;
    setSelectedSlot(slot);
  }, [pendingChoice]);

  const handleShipChoice = useCallback((entityType: EntityType) => {
    const game = gameRef.current;
    if (!game) return;
    if (!game.selectChoice(entityType)) return;
    syncFromGame(game);
  }, [syncFromGame]);

  const handleCloseInspection = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const getSelectedEntity = useCallback((): EntityState | null => {
    const game = gameRef.current;
    if (!game || !selectedSlot) return null;
    return game.getEntityForSlot(selectedSlot.index);
  }, [selectedSlot]);

  const handleTargetingChange = useCallback((mode: TargetingMode) => {
    const game = gameRef.current;
    if (!game || !selectedSlot) return;
    game.setTargetingMode(selectedSlot.index, mode);
    setInspectTick((t) => t + 1);
  }, [selectedSlot]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none"
      style={{ touchAction: "none" }}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${100 / uiScale}%`,
          height: `${100 / uiScale}%`,
          transformOrigin: "top left",
          transform: `scale(${uiScale})`,
        }}
      >
        <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
          <span className="text-[11px] text-[#f9e2af] font-semibold">
            Lv {level}
          </span>
          <div
            className="relative rounded-full overflow-hidden"
            style={{
              width: 100,
              height: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${Math.min(100, (xp / xpNeeded) * 100)}%`,
                background: "linear-gradient(90deg, #f9e2af, #fab387)",
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
          <span className="text-[11px] text-[#585b70]">
            {elapsed}s
          </span>
        </div>
        <PlacementOverlay
          slots={slots}
          onSlotClick={handleSlotClick}
          activeSlotIndex={selectedSlot?.index ?? null}
        />
        {selectedSlot && selectedSlot.occupant && !pendingChoice && (
          <InspectionPanel
            onClose={handleCloseInspection}
            shipPreviews={shipPreviews}
            slot={selectedSlot}
            entity={getSelectedEntity()}
            onTargetingChange={handleTargetingChange}
          />
        )}
        {pendingChoice && (
          <ShipChoiceOverlay
            onSelect={handleShipChoice}
            shipPreviews={shipPreviews}
            slots={slots}
            level={level}
            choices={choices}
          />
        )}
        <PhraseOverlay gameRef={gameRef} isPaused={selectedSlot !== null || pendingChoice} />
      </div>
    </div>
  );
};
