import { useCallback, useEffect, useRef, useState } from "react";
import { useMatch } from "react-router-dom";
import { getLanguageFromSlug } from "../../utils/modes";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { TargetingMode, levelUpEntity, xpForNextLevel } from "./state";
import type { EntityState } from "./state";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { InspectionPanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { ScoreHud } from "./ScoreHud";
import { ShipChoiceOverlay } from "./ShipChoiceOverlay";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import type { EntityType } from "./types";

const UI_REFERENCE_WIDTH = 700;

export const GameCanvas = () => {
  const languageGameMatch = useMatch("/:lang/games/:gameId");
  const gameMatch = useMatch("/games/:gameId");
  const gameId = languageGameMatch?.params.gameId ?? gameMatch?.params.gameId ?? "";
  const language = getLanguageFromSlug(languageGameMatch?.params.lang).slug || "en";
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CosmicDefenseGame | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PlacementSlot | null>(null);
  const [shipPreviews, setShipPreviews] = useState<Map<EntityType, string>>(new Map());
  const [slots, setSlots] = useState<PlacementSlot[]>(() => generateSlots());
  const [uiScale, setUiScale] = useState(1);
  const [, setInspectTick] = useState(0);
  const [pendingChoice, setPendingChoice] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpNeeded, setXpNeeded] = useState(() => xpForNextLevel(1));
  const [totalKills, setTotalKills] = useState(0);

  useEffect(() => {
    if (!selectedSlot?.entityId) return;
    const interval = setInterval(() => setInspectTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, [selectedSlot?.entityId]);

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
    if (!div || !gameId || !language) return;

    let cancelled = false;
    let unsubLevelUp: (() => void) | null = null;
    let unsubXPChanged: (() => void) | null = null;
    let unsubEnemyEntityDeath: (() => void) | null = null;

    createCosmicDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        setShipPreviews(game.shipPreviews);
        setPendingChoice(game.state.pendingChoice);
        setLevel(game.state.level);
        setXp(game.state.xp);
        setTotalKills(game.state.totalKills);
        setXpNeeded(xpForNextLevel(game.state.level));
        unsubLevelUp = game.state.onLevelUp.subscribe(() => {
          setPendingChoice(true);
          setLevel(game.state.level);
        });
        unsubXPChanged = game.state.onXPChanged.subscribe((data) => {
          setXp(data.xp);
          setLevel(data.level);
          setXpNeeded(data.xpNeeded);
        });
        unsubEnemyEntityDeath = game.state.onEnemyEntityDeath.subscribe(() => {
          setTotalKills(game.state.totalKills);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Cosmic Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubLevelUp?.();
      unsubXPChanged?.();
      unsubEnemyEntityDeath?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [gameId, language]);

  const handleSlotClick = useCallback((slot: PlacementSlot) => {
    if (pendingChoice) return;
    setSelectedSlot(slot);
  }, [pendingChoice]);

  const handleShipChoice = useCallback((entityType: EntityType) => {
    const game = gameRef.current;
    if (!game) return;

    const existingSlot = slots.find((s) => s.occupant === entityType);

    if (existingSlot && existingSlot.entityId !== null) {
      const newLevel = existingSlot.level + 1;
      const config = FRIENDLY_CONFIG_MAP.get(entityType);
      if (config) {
        levelUpEntity(game.state, existingSlot.entityId, config, newLevel);
      }
      setSlots((prev) =>
        prev.map((s) =>
          s.index === existingSlot.index ? { ...s, level: newLevel } : s
        )
      );
    } else {
      const emptySlot = slots.find((s) => !s.occupant);
      if (!emptySlot) return;
      const entityId = game.shipManager.addShip(game.state, entityType, emptySlot.x, emptySlot.y, 1);
      setSlots((prev) =>
        prev.map((s) =>
          s.index === emptySlot.index
            ? { ...s, occupant: entityType, entityId, level: 1 }
            : s
        )
      );
    }

    game.state.pendingChoice = false;
    game.state.spawner.paused = false;
    setPendingChoice(false);
  }, [slots]);

  const handleCloseInspection = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const getSelectedEntity = useCallback((): EntityState | null => {
    const game = gameRef.current;
    if (!game || !selectedSlot || !selectedSlot.entityId) return null;
    return game.state.entityById.get(selectedSlot.entityId) ?? null;
  }, [selectedSlot]);

  const handleTargetingChange = useCallback((mode: TargetingMode) => {
    const game = gameRef.current;
    if (!game || !selectedSlot || !selectedSlot.entityId) return;
    const entity = game.state.entityById.get(selectedSlot.entityId);
    if (entity) entity.targetingMode = mode;
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
        <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#f9e2af] font-semibold whitespace-nowrap">
              Lv {level}
            </span>
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                height: 12,
                borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(249,226,175,0.3)",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${Math.min(100, (xp / xpNeeded) * 100)}%`,
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #f9e2af, #fab387)",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
          </div>
          <ScoreHud game={gameRef.current} gameId={gameId} language={language} />
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-8 rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]" />
            <div className="w-8 h-8 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]" />
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <span className="text-[12px]">💀</span>
              <span className="text-[11px] text-[#a6adc8] font-semibold">{totalKills}</span>
            </div>
          </div>
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
          />
        )}
        <PhraseOverlay gameRef={gameRef} isPaused={selectedSlot !== null || pendingChoice} />
      </div>
    </div>
  );
};
