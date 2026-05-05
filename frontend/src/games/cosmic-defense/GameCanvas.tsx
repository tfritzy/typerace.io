import { useCallback, useEffect, useRef, useState } from "react";
import { useMatch } from "react-router-dom";
import { getLanguageFromSlug } from "../../utils/modes";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { BOSS_WARNING_LEAD_TIME_SECONDS, TargetingMode, levelUpEntity, xpForNextLevel } from "./state";
import type { EntityState, BossSpawnedData } from "./state";
import { BossHealthBar } from "./BossHealthBar";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { InspectionPanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { Skull } from "lucide-react";
import { Score } from "./Score";
import { ShipChoiceOverlay } from "./ShipChoiceOverlay";
import { RelicContainer } from "./RelicContainer";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import type { EntityType } from "./types";

const UI_REFERENCE_WIDTH = 700;
const BOSS_ANNOUNCEMENT_DURATION_MS = BOSS_WARNING_LEAD_TIME_SECONDS * 1000;

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
  const [bossApproaching, setBossApproaching] = useState(false);
  const [bossEntityId, setBossEntityId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedSlot?.entityId) return;
    const interval = setInterval(() => setInspectTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, [selectedSlot?.entityId]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (selectedSlot !== null) {
      game.pause("inspection");
      return () => game.unpause("inspection");
    }
  }, [selectedSlot]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (pendingChoice) {
      game.pause("pendingChoice");
      return () => game.unpause("pendingChoice");
    }
  }, [pendingChoice]);

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
    let unsubBossApproaching: (() => void) | null = null;
    let unsubBossSpawned: (() => void) | null = null;
    let unsubBossDefeated: (() => void) | null = null;

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
        unsubBossApproaching = game.state.onBossApproaching.subscribe(() => {
          setBossApproaching(true);
          window.setTimeout(() => {
            if (!cancelled) setBossApproaching(false);
          }, BOSS_ANNOUNCEMENT_DURATION_MS);
        });
        unsubBossSpawned = game.state.onBossSpawned.subscribe((data: BossSpawnedData) => {
          if (cancelled) return;
          setBossEntityId(data.id);
        });
        unsubBossDefeated = game.state.onBossDefeated.subscribe(() => {
          if (cancelled) return;
          setBossEntityId(null);
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
      unsubBossApproaching?.();
      unsubBossSpawned?.();
      unsubBossDefeated?.();
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
    game.unpause("pendingChoice");
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
                height: 7,
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
                  background: "#f9e2af",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <RelicContainer game={gameRef.current} />
            <div className="flex items-center gap-1">
              <Score game={gameRef.current} gameId={gameId} language={language} />
            </div>
            <div className="flex items-center gap-1">
              <Skull className="w-3 h-3 text-[#a6adc8]" />
              <span className="text-[11px] text-[#a6adc8] font-semibold">{totalKills}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[rgba(249,226,175,0.6)] font-semibold tabular-nums whitespace-nowrap">
                {xp} / {xpNeeded}
              </span>
            </div>
          </div>
        </div>
        {bossApproaching && (
          <div className="absolute top-20 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-[#f9e2af] bg-[rgba(17,17,27,0.78)] px-5 py-3 text-center shadow-[0_0_28px_rgba(249,226,175,0.28)]">
            <div className="text-[10px] uppercase tracking-[0.36em] text-[#fab387]">Warning</div>
            <div className="mt-1 text-[16px] font-bold uppercase tracking-[0.08em] text-[#f9e2af]">
              large disturbance in warp space detected
            </div>
          </div>
        )}
        {bossEntityId !== null && gameRef.current && (
          <BossHealthBar state={gameRef.current.state} entityId={bossEntityId} />
        )}
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
