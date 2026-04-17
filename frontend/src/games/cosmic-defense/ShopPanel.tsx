import { SHIP_BLUEPRINTS } from "./shipCatalog";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins, X } from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

export const ShopPanel = ({ onSelectShip, onClose, shipPreviews, gold, slot }: ShopPanelProps) => {
  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;

  const panelLeft = slotLeftPct + 5;
  const panelTop = Math.max(3, Math.min(55, slotTopPct - 22));

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg p-2.5 border border-white/10 flex flex-col"
        style={{
          left: `${panelLeft}%`,
          top: `${panelTop}%`,
          width: 260,
          maxHeight: "46%",
          background: "linear-gradient(180deg, rgba(12,14,30,0.96) 0%, rgba(8,10,24,0.96) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(120,140,200,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[#cdd6f4] text-xs font-semibold tracking-wide">
            Deploy Ship
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-[#f9e2af] text-[10px] font-medium flex items-center gap-0.5">
              <Coins className="w-3 h-3" />
              {formatGold(gold)}
            </span>
            <button
              onClick={onClose}
              className="text-[#585b70] hover:text-[#a6adc8] transition-colors cursor-pointer p-0.5 -mr-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto min-h-0 flex flex-col gap-0.5">
          {SHIP_BLUEPRINTS.map((bp) => {
            const canAfford = gold >= bp.cost;
            const preview = shipPreviews.get(bp.entityType);
            return (
              <button
                key={bp.entityType}
                className={`flex items-center gap-2.5 p-1.5 px-2 rounded-md border transition-colors w-full ${
                  canAfford
                    ? "border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/8 hover:border-white/15"
                    : "border-transparent bg-transparent cursor-not-allowed opacity-30"
                }`}
                onClick={() => canAfford && onSelectShip(bp.entityType)}
                disabled={!canAfford}
              >
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${!canAfford ? "grayscale" : ""}`}>
                  {preview ? (
                    <img
                      src={preview}
                      alt={bp.entityType}
                      className="max-w-8 max-h-8"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-white/15 rounded" />
                  )}
                </div>
                <span className={`text-[11px] font-medium ${canAfford ? "text-[#bac2de]" : "text-[#585b70]"}`}>
                  {bp.entityType}
                </span>
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ml-auto ${canAfford ? "text-[#f9e2af]" : "text-[#585b70]"}`}>
                  <Coins className="w-2.5 h-2.5" />
                  {formatGold(bp.cost)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
