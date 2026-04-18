import { useCallback, useEffect, useRef, useState } from "react";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { startNextWave, TargetingMode } from "./state";
import type { EntityState } from "./state";
import { formatGold } from "./constants";
import { PlanetHealthBar } from "./PlanetHealthBar";
import { ShopPanel } from "./ShopPanel";
import { UpgradePanel } from "./UpgradePanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import { SHIP_BLUEPRINT_MAP } from "./shipCatalog";
import type { EntityType } from "./types";
import { getNextUpgrade, getUpgradeCost } from "./upgradePaths";
import { Coins } from "lucide-react";

const UI_REFERENCE_WIDTH = 900;

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CosmicDefenseGame | null>(null);
  const [healthRatio, setHealthRatio] = useState(1);
  const [waveNumber, setWaveNumber] = useState(0);
  const [waveActive, setWaveActive] = useState(false);
  const [gold, setGold] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<PlacementSlot | null>(null);
  const [shipPreviews, setShipPreviews] = useState<Map<EntityType, string>>(new Map());
  const [slots, setSlots] = useState<PlacementSlot[]>(() => generateSlots());
  const [uiScale, setUiScale] = useState(1);

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
    let unsubDamage: (() => void) | null = null;
    let unsubWaveComplete: (() => void) | null = null;
    let unsubWaveActive: (() => void) | null = null;
    let unsubGold: (() => void) | null = null;

    createCosmicDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        setShipPreviews(game.shipPreviews);
        setGold(game.state.gold);
        unsubDamage = game.state.onPlanetDamaged.subscribe(() => {
          setHealthRatio(game.state.planetHealth / game.state.maxPlanetHealth);
        });
        unsubWaveComplete = game.state.onWaveComplete.subscribe(() => {
          setWaveNumber(game.state.wave.wave);
          setWaveActive(false);
        });
        unsubWaveActive = game.state.onWaveActiveChanged.subscribe(() => {
          setWaveActive(game.state.waveActive);
        });
        unsubGold = game.state.onGoldChanged.subscribe(() => {
          setGold(game.state.gold);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Cosmic Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubDamage?.();
      unsubWaveComplete?.();
      unsubWaveActive?.();
      unsubGold?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleNextWave = useCallback(() => {
    const game = gameRef.current;
    if (game) {
      startNextWave(game.state);
      setWaveNumber(game.state.wave.wave);
      setWaveActive(true);
    }
  }, []);

  const handleSlotClick = useCallback((slot: PlacementSlot) => {
    setSelectedSlot(slot);
  }, []);

  const handleSelectShip = useCallback((entityType: EntityType) => {
    const game = gameRef.current;
    if (!game || !selectedSlot) return;

    const bp = SHIP_BLUEPRINT_MAP.get(entityType);
    if (!bp || game.state.gold < bp.cost) return;

    game.state.gold -= bp.cost;
    game.state.onGoldChanged.emit();

    const entityId = game.shipManager.addShip(game.state, entityType, selectedSlot.x, selectedSlot.y);

    setSlots((prev) =>
      prev.map((s) =>
        s.index === selectedSlot.index ? { ...s, occupant: entityType, entityId } : s
      )
    );
    setSelectedSlot(null);
  }, [selectedSlot]);

  const handleUpgrade = useCallback(() => {
    const game = gameRef.current;
    if (!game || !selectedSlot || !selectedSlot.occupant || selectedSlot.entityId === null) return;

    const nextType = getNextUpgrade(selectedSlot.occupant);
    if (!nextType) return;

    const cost = getUpgradeCost(selectedSlot.occupant);
    if (game.state.gold < cost) return;

    game.state.gold -= cost;
    game.state.onGoldChanged.emit();

    const newEntityId = game.shipManager.upgradeShip(
      game.state, selectedSlot.entityId, nextType, selectedSlot.x, selectedSlot.y
    );

    setSlots((prev) =>
      prev.map((s) =>
        s.index === selectedSlot.index ? { ...s, occupant: nextType, entityId: newEntityId } : s
      )
    );
    setSelectedSlot(null);
  }, [selectedSlot]);

  const handleCloseShop = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const getSelectedEntity = useCallback((): EntityState | null => {
    const game = gameRef.current;
    if (!game || !selectedSlot || !selectedSlot.entityId) return null;
    return game.state.entities.find((e) => e.id === selectedSlot.entityId) ?? null;
  }, [selectedSlot]);

  const handleTargetingChange = useCallback((mode: TargetingMode) => {
    const game = gameRef.current;
    if (!game || !selectedSlot || !selectedSlot.entityId) return;
    const entity = game.state.entities.find((e) => e.id === selectedSlot.entityId);
    if (entity) entity.targetingMode = mode;
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
        <PlanetHealthBar ratio={healthRatio} />
        <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
          <span className="text-[11px] text-[#f9e2af] flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            {formatGold(gold)}
          </span>
          <span className="text-[11px] text-[#a6adc8]">
            Wave {waveNumber + 1}
          </span>
          {!waveActive && (
            <button
              onClick={handleNextWave}
              className="text-[11px] bg-green-400/85 text-[#0a0a1a] px-2.5 py-1 rounded cursor-pointer hover:brightness-125"
            >
              {waveNumber === 0 ? "Start" : "Next wave"}
            </button>
          )}
        </div>
        {!waveActive && (
          <PlacementOverlay
            slots={slots}
            onSlotClick={handleSlotClick}
            activeSlotIndex={selectedSlot?.index ?? null}
          />
        )}
        {selectedSlot && !selectedSlot.occupant && (
          <ShopPanel
            onSelectShip={handleSelectShip}
            onClose={handleCloseShop}
            shipPreviews={shipPreviews}
            gold={gold}
            slot={selectedSlot}
          />
        )}
        {selectedSlot && selectedSlot.occupant && (
          <UpgradePanel
            onUpgrade={handleUpgrade}
            onClose={handleCloseShop}
            shipPreviews={shipPreviews}
            gold={gold}
            slot={selectedSlot}
            entity={getSelectedEntity()}
            onTargetingChange={handleTargetingChange}
          />
        )}
        <PhraseOverlay gameRef={gameRef} visible={waveActive} />
      </div>
    </div>
  );
};
