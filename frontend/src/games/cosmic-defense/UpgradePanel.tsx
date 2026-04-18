import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins, X, ArrowRight } from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";
import { getNextUpgrade, getUpgradeCost, getShipTier } from "./upgradePaths";

interface UpgradePanelProps {
  onUpgrade: () => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

const PANEL_OFFSET_LEFT = 5;
const PANEL_OFFSET_TOP = 10;
const PANEL_MIN_TOP = 3;
const PANEL_MAX_TOP = 55;
const PANEL_WIDTH = 240;

export const UpgradePanel = ({ onUpgrade, onClose, shipPreviews, gold, slot }: UpgradePanelProps) => {
  const currentType = slot.occupant;
  if (!currentType) return null;

  const nextType = getNextUpgrade(currentType);
  const upgradeCost = getUpgradeCost(currentType);
  const currentTier = getShipTier(currentType);
  const canAfford = nextType !== null && gold >= upgradeCost;

  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;

  const panelLeft = slotLeftPct + PANEL_OFFSET_LEFT;
  const panelTop = Math.max(PANEL_MIN_TOP, Math.min(PANEL_MAX_TOP, slotTopPct - PANEL_OFFSET_TOP));

  const currentPreview = shipPreviews.get(currentType);
  const nextPreview = nextType ? shipPreviews.get(nextType) : null;

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg p-3 border border-white/10 flex flex-col gap-3"
        style={{
          left: `${panelLeft}%`,
          top: `${panelTop}%`,
          width: PANEL_WIDTH,
          background: "linear-gradient(180deg, rgba(12,14,30,0.96) 0%, rgba(8,10,24,0.96) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(120,140,200,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[#cdd6f4] text-xs font-semibold tracking-wide">
            Upgrade Ship
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

        <div className="flex items-center gap-2 px-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center">
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt={currentType}
                  className="max-w-10 max-h-10"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="w-6 h-6 bg-white/15 rounded" />
              )}
            </div>
            <span className="text-[10px] text-[#bac2de] font-medium">{currentType}</span>
            <span className="text-[9px] text-[#585b70]">Tier {currentTier}</span>
          </div>

          {nextType && (
            <>
              <ArrowRight className="w-4 h-4 text-[#585b70] shrink-0" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 flex items-center justify-center">
                  {nextPreview ? (
                    <img
                      src={nextPreview}
                      alt={nextType}
                      className="max-w-10 max-h-10"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-white/15 rounded" />
                  )}
                </div>
                <span className="text-[10px] text-[#bac2de] font-medium">{nextType}</span>
                <span className="text-[9px] text-[#585b70]">Tier {currentTier + 1}</span>
              </div>
            </>
          )}
        </div>

        {nextType ? (
          <button
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-[11px] font-medium transition-colors w-full ${
              canAfford
                ? "border-green-400/30 bg-green-400/10 text-green-400 cursor-pointer hover:bg-green-400/20"
                : "border-transparent bg-white/[0.02] text-[#585b70] cursor-not-allowed"
            }`}
            onClick={() => canAfford && onUpgrade()}
            disabled={!canAfford}
          >
            <Coins className="w-3 h-3" />
            Upgrade · {formatGold(upgradeCost)}
          </button>
        ) : (
          <div className="text-center text-[10px] text-[#585b70] py-1">
            Fully upgraded
          </div>
        )}
      </div>
    </>
  );
};
