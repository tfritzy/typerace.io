import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMatch } from "react-router-dom";
import { useDatabase } from "../../contexts/SpacetimeContext";
import { getLanguageFromSlug } from "../../utils/modes";
import { createScoreProof } from "../../utils/scoreProof";
import { throttle } from "../../utils/throttle";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { TargetingMode, levelUpEntity, xpForNextLevel } from "./state";
import type { EntityState } from "./state";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { InspectionPanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { ShipChoiceOverlay } from "./ShipChoiceOverlay";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import type { EntityType } from "./types";

const UI_REFERENCE_WIDTH = 700;
const SCORE_PUBLISH_INTERVAL_MS = 10_000;

export const GameCanvas = () => {
  const conn = useDatabase();
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
  const [score, setScore] = useState(0);
  const publishScore = useMemo(
    () =>
      throttle((nextScore: number) => {
        if (!conn) return;
        conn.reducers.publishScore({
          gameId,
          language,
          score: nextScore,
          scoreProof: createScoreProof(gameId, language, nextScore),
        });
      }, SCORE_PUBLISH_INTERVAL_MS),
    [conn, gameId, language]
  );

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
    if (!div) return;

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
        setXpNeeded(xpForNextLevel(game.state.level));
        setScore(game.state.score);
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
          setScore(game.state.score);
          publishScore(game.state.score);
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
      publishScore.cancel();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [publishScore]);

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
        </div>
        <div className="absolute top-2 right-3 z-10">
          <span className="text-[11px] text-[#cdd6f4] font-semibold">
            Score {score.toLocaleString()}
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
          />
        )}
        <PhraseOverlay gameRef={gameRef} isPaused={selectedSlot !== null || pendingChoice} />
      </div>
    </div>
  );
};
