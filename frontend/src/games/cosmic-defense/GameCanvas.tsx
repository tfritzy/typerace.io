import { useCallback, useEffect, useRef, useState } from "react";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { startNextWave } from "./state";
import { PlanetHealthBar } from "./PlanetHealthBar";
import { ShopPanel } from "./ShopPanel";
import { PlacementOverlay } from "./PlacementOverlay";
import { PhraseOverlay } from "./PhraseOverlay";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import { SHIP_BLUEPRINTS } from "./shipCatalog";
import type { EntityType } from "./types";

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

    const bp = SHIP_BLUEPRINTS.find((b) => b.entityType === entityType);
    if (!bp || game.state.gold < bp.cost) return;

    game.state.gold -= bp.cost;
    game.state.onGoldChanged.emit();

    game.shipManager.addShip(game.state, entityType, selectedSlot.x, selectedSlot.y);

    setSlots((prev) =>
      prev.map((s) =>
        s.index === selectedSlot.index ? { ...s, occupant: entityType } : s
      )
    );
    setSelectedSlot(null);
  }, [selectedSlot]);

  const handleCloseShop = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none"
      style={{ touchAction: "none" }}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <PlanetHealthBar ratio={healthRatio} />
      <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
        <span className="text-[11px] text-[#f9e2af]">
          {gold} gold
        </span>
        <span className="text-[11px] text-[#a6adc8]">
          Wave {waveNumber}
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
        <PlacementOverlay slots={slots} onSlotClick={handleSlotClick} />
      )}
      {selectedSlot && (
        <ShopPanel
          onSelectShip={handleSelectShip}
          onClose={handleCloseShop}
          shipPreviews={shipPreviews}
          gold={gold}
        />
      )}
      <PhraseOverlay gameRef={gameRef} visible={waveActive} />
    </div>
  );
};
