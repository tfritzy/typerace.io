import { useCallback, useEffect, useRef, useState } from "react";
import { createCosmicDefenseGame } from "./game";
import type { CosmicDefenseGame } from "./game";
import { startNextWave } from "./state";
import { PlanetHealthBar } from "./PlanetHealthBar";
import { ShopPanel } from "./ShopPanel";
import type { ShipBlueprint } from "./shipCatalog";
import type { EntityType } from "./types";

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CosmicDefenseGame | null>(null);
  const [healthRatio, setHealthRatio] = useState(1);
  const [waveNumber, setWaveNumber] = useState(0);
  const [waveActive, setWaveActive] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [shipPreviews, setShipPreviews] = useState<Map<EntityType, string>>(new Map());

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;
    let unsubDamage: (() => void) | null = null;
    let unsubWaveComplete: (() => void) | null = null;
    let unsubWaveActive: (() => void) | null = null;

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

        game.placementGrid.onShipPlaced((placed) => {
          game.buildingManager.addShip(placed);
          setPlacing(false);
          setShopOpen(true);
        });

        game.placementGrid.onPlacementCancelled(() => {
          setPlacing(false);
          setShopOpen(true);
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

  const handleOpenShop = useCallback(() => {
    setShopOpen(true);
  }, []);

  const handleSelectShip = useCallback((blueprint: ShipBlueprint) => {
    const game = gameRef.current;
    if (!game) return;
    setShopOpen(false);
    setPlacing(true);
    game.startPlacement(blueprint);
  }, []);

  const handleCloseShop = useCallback(() => {
    setShopOpen(false);
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
        <span style={{ fontSize: 11, color: "#a6adc8" }}>
          Wave {waveNumber}
        </span>
        {!waveActive && !placing && (
          <>
            <button
              onClick={handleOpenShop}
              style={{
                fontSize: 11,
                background: "rgba(249, 226, 175, 0.85)",
                color: "#0a0a1a",
                padding: "4px 10px",
                borderRadius: 4,
              }}
              className="cursor-pointer hover:brightness-125"
            >
              Shop
            </button>
            <button
              onClick={handleNextWave}
              style={{
                fontSize: 11,
                background: "rgba(74, 222, 128, 0.85)",
                color: "#0a0a1a",
                padding: "4px 10px",
                borderRadius: 4,
              }}
              className="cursor-pointer hover:brightness-125"
            >
              {waveNumber === 0 ? "Start" : "Next wave"}
            </button>
          </>
        )}
      </div>
      {shopOpen && (
        <ShopPanel
          onSelectShip={handleSelectShip}
          onClose={handleCloseShop}
          shipPreviews={shipPreviews}
        />
      )}
    </div>
  );
};
