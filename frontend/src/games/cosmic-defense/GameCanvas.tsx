import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import {
  GameEvent,
  TargetingMode,
  getChoices,
  getEntityForSlot,
  getSlot,
  getSlots,
  selectChoice,
  setPaused,
  setTargetingMode,
  xpForNextLevel,
  type GameState,
} from "./state";
import { InspectionPanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { ShipChoiceOverlay } from "./ShipChoiceOverlay";
import type { PlacementSlot } from "./PlacementPoints";
import type { EntityType } from "./types";

const UI_REFERENCE_WIDTH = 700;
const EMPTY_SLOTS: PlacementSlot[] = [];
const EMPTY_CHOICES: EntityType[] = [];
const EMPTY_HUD = { level: 1, elapsed: 0, xp: 0, xpNeeded: xpForNextLevel(1) };

function useGameSubscription<T>(
  state: GameState | null,
  getSnapshot: (state: GameState) => T,
  getEvents: (state: GameState) => GameEvent[],
  fallback: T
): T {
  const snapshotRef = useRef(getSnapshot);
  const eventsRef = useRef(getEvents);
  snapshotRef.current = getSnapshot;
  eventsRef.current = getEvents;

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!state) return () => {};
    const unsubs = eventsRef.current(state).map((event) => event.subscribe(onStoreChange));
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [state]);

  const snapshot = useCallback(() => {
    return state ? snapshotRef.current(state) : fallback;
  }, [state, fallback]);

  return useSyncExternalStore(subscribe, snapshot, () => fallback);
}

const HudOverlay = ({ state }: { state: GameState | null }) => {
  const hud = useGameSubscription(
    state,
    (currentState) => ({
      level: currentState.level,
      elapsed: Math.floor(currentState.spawner.elapsed),
      xp: currentState.xp,
      xpNeeded: xpForNextLevel(currentState.level),
    }),
    (currentState) => [currentState.onHudChanged],
    EMPTY_HUD
  );

  return (
    <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
      <span className="text-[11px] text-[#f9e2af] font-semibold">
        Lv {hud.level}
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
            width: `${Math.min(100, (hud.xp / hud.xpNeeded) * 100)}%`,
            background: "linear-gradient(90deg, #f9e2af, #fab387)",
            transition: "width 0.2s ease-out",
          }}
        />
      </div>
      <span className="text-[11px] text-[#585b70]">
        {hud.elapsed}s
      </span>
    </div>
  );
};

const PlacementOverlayLayer = ({
  state,
  onSlotClick,
  activeSlotIndex,
}: {
  state: GameState | null;
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
}) => {
  const slots = useGameSubscription(
    state,
    getSlots,
    (currentState) => [currentState.onSlotsChanged],
    EMPTY_SLOTS
  );

  return (
    <PlacementOverlay
      slots={slots}
      onSlotClick={onSlotClick}
      activeSlotIndex={activeSlotIndex}
    />
  );
};

const ShipChoiceOverlayLayer = ({
  state,
  shipPreviews,
  onSelect,
}: {
  state: GameState | null;
  shipPreviews: Map<EntityType, string>;
  onSelect: (entityType: EntityType) => void;
}) => {
  const choiceState = useGameSubscription(
    state,
    (currentState) => ({
      pendingChoice: currentState.pendingChoice,
      level: currentState.level,
      choices: getChoices(currentState),
      slots: getSlots(currentState),
    }),
    (currentState) => [currentState.onChoicesChanged, currentState.onSlotsChanged],
    { pendingChoice: true, level: 1, choices: EMPTY_CHOICES, slots: EMPTY_SLOTS }
  );

  if (!choiceState.pendingChoice) return null;

  return (
    <ShipChoiceOverlay
      onSelect={onSelect}
      shipPreviews={shipPreviews}
      slots={choiceState.slots}
      level={choiceState.level}
      choices={choiceState.choices}
    />
  );
};

const InspectionPanelLayer = ({
  state,
  shipPreviews,
  selectedSlotIndex,
  onClose,
}: {
  state: GameState | null;
  shipPreviews: Map<EntityType, string>;
  selectedSlotIndex: number | null;
  onClose: () => void;
}) => {
  const inspection = useGameSubscription(
    state,
    (currentState) => {
      if (selectedSlotIndex === null) {
        return { slot: null, entity: null };
      }
      return {
        slot: getSlot(currentState, selectedSlotIndex),
        entity: getEntityForSlot(currentState, selectedSlotIndex),
      };
    },
    (currentState) => [currentState.onSlotsChanged, currentState.onTargetingChanged],
    { slot: null, entity: null }
  );

  const handleTargetingChange = useCallback((mode: TargetingMode) => {
    if (!state || selectedSlotIndex === null) return;
    setTargetingMode(state, selectedSlotIndex, mode);
  }, [state, selectedSlotIndex]);

  if (!inspection.slot?.occupant) return null;

  return (
    <InspectionPanel
      onClose={onClose}
      shipPreviews={shipPreviews}
      slot={inspection.slot}
      entity={inspection.entity}
      onTargetingChange={handleTargetingChange}
    />
  );
};

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CosmicDefenseGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [shipPreviews, setShipPreviews] = useState<Map<EntityType, string>>(new Map());
  const [uiScale, setUiScale] = useState(1);

  const pendingChoice = useGameSubscription(
    gameState,
    (state) => state.pendingChoice,
    (state) => [state.onChoicesChanged],
    true
  );

  useEffect(() => {
    if (pendingChoice) {
      setSelectedSlotIndex(null);
    }
  }, [pendingChoice]);

  useEffect(() => {
    if (!gameState) return;
    setPaused(gameState, selectedSlotIndex !== null || pendingChoice);
  }, [gameState, selectedSlotIndex, pendingChoice]);

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

    createCosmicDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        setGameState(game.state);
        setShipPreviews(game.shipPreviews);
      })
      .catch((err) => {
        console.error("Failed to initialize Cosmic Defense:", err);
      });

    return () => {
      cancelled = true;
      gameRef.current?.destroy();
      gameRef.current = null;
      setGameState(null);
    };
  }, []);

  const handleSlotClick = useCallback((slot: PlacementSlot) => {
    if (pendingChoice) return;
    setSelectedSlotIndex(slot.index);
  }, [pendingChoice]);

  const handleShipChoice = useCallback((entityType: EntityType) => {
    if (!gameState) return;
    selectChoice(gameState, entityType);
  }, [gameState]);

  const handleCloseInspection = useCallback(() => {
    setSelectedSlotIndex(null);
  }, []);

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
        <HudOverlay state={gameState} />
        <PlacementOverlayLayer
          state={gameState}
          onSlotClick={handleSlotClick}
          activeSlotIndex={selectedSlotIndex}
        />
        {!pendingChoice && (
          <InspectionPanelLayer
            state={gameState}
            shipPreviews={shipPreviews}
            selectedSlotIndex={selectedSlotIndex}
            onClose={handleCloseInspection}
          />
        )}
        <ShipChoiceOverlayLayer
          state={gameState}
          shipPreviews={shipPreviews}
          onSelect={handleShipChoice}
        />
        <PhraseOverlay gameRef={gameRef} isPaused={selectedSlotIndex !== null || pendingChoice} />
      </div>
    </div>
  );
};
