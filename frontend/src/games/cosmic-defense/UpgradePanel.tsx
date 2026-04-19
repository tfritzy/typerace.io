import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import {
  X,
  ChevronUp,
  Skull,
  Coins,
} from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";
import { getNextUpgrade, getUpgradeCost, getShipTier } from "./upgradePaths";
import { TargetingMode } from "./state";
import type { EntityState } from "./state";
import { getShipRole, ROLE_META } from "./shipCatalog";

interface UpgradePanelProps {
  onUpgrade: () => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
  entity: EntityState | null;
  onTargetingChange: (mode: TargetingMode) => void;
}

const PANEL_OFFSET_LEFT = 5;
const PANEL_OFFSET_TOP = 10;
const PANEL_MIN_TOP = 3;
const PANEL_MAX_TOP = 55;
const PANEL_WIDTH = 180;
const MAX_TIER = 4;

const TARGETING_OPTIONS: { mode: TargetingMode; label: string }[] = [
  { mode: TargetingMode.NearestToShip, label: "Nearest" },
  { mode: TargetingMode.NearestToPlanet, label: "Closest to planet" },
  { mode: TargetingMode.Strongest, label: "Strongest" },
  { mode: TargetingMode.Weakest, label: "Weakest" },
  { mode: TargetingMode.LowestHealth, label: "Most damaged" },
];

export const UpgradePanel = ({
  onUpgrade,
  onClose,
  shipPreviews,
  gold,
  slot,
  entity,
  onTargetingChange,
}: UpgradePanelProps) => {
  const currentType = slot.occupant;
  if (!currentType) return null;

  const nextType = getNextUpgrade(currentType);
  const upgradeCost = getUpgradeCost(currentType);
  const currentTier = getShipTier(currentType);
  const canAfford = nextType !== null && gold >= upgradeCost;
  const role = getShipRole(currentType);

  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;
  const panelLeft = slotLeftPct + PANEL_OFFSET_LEFT;
  const panelTop = Math.max(
    PANEL_MIN_TOP,
    Math.min(PANEL_MAX_TOP, slotTopPct - PANEL_OFFSET_TOP)
  );

  const currentPreview = shipPreviews.get(currentType);
  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.icon;
  const currentTargeting = entity?.targetingMode ?? TargetingMode.NearestToShip;

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg border border-white/10"
        style={{
          left: `${panelLeft}%`,
          top: `${panelTop}%`,
          width: PANEL_WIDTH,
          background:
            "linear-gradient(180deg, rgba(12,14,30,0.96) 0%, rgba(8,10,24,0.96) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(120,140,200,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 text-[#585b70] hover:text-[#a6adc8] transition-colors cursor-pointer p-0.5 z-10"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2 p-2.5 pb-1.5">
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt={currentType}
                className="max-w-9 max-h-9"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="w-7 h-7 bg-white/15 rounded" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[#cdd6f4] text-[11px] font-semibold leading-tight">
                {currentType}
              </span>
              {RoleIcon && (
                <RoleIcon
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ color: roleMeta?.color }}
                />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: MAX_TIER }, (_, i) => (
                  <svg
                    key={i}
                    className="w-2.5 h-2.5"
                    viewBox="0 0 24 24"
                    fill={
                      i < currentTier
                        ? (roleMeta?.color ?? "#a6adc8")
                        : "rgba(88,91,112,0.4)"
                    }
                    stroke="none"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              {entity && entity.kills > 0 && (
                <span
                  className="flex items-center gap-0.5 text-[#45475a] ml-auto"
                  title="Kills"
                >
                  <Skull className="w-2 h-2" />
                  <span className="text-[7px]">{entity.kills}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-2.5 pb-1.5">
          <select
            value={currentTargeting}
            onChange={(e) => onTargetingChange(Number(e.target.value) as TargetingMode)}
            className="w-full text-[9px] bg-[#1e1e2e] text-[#a6adc8] border border-white/10 rounded px-1.5 py-1 outline-none cursor-pointer hover:border-white/20 transition-colors"
          >
            {TARGETING_OPTIONS.map((opt) => (
              <option key={opt.mode} value={opt.mode}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {nextType ? (
          <div className="px-2.5 pb-2.5">
            <button
              className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all w-full ${
                canAfford
                  ? "bg-[#a6e3a1]/10 text-[#a6e3a1] cursor-pointer hover:bg-[#a6e3a1]/20"
                  : "bg-white/[0.02] text-[#585b70] cursor-not-allowed"
              }`}
              onClick={canAfford ? onUpgrade : undefined}
              disabled={!canAfford}
            >
              <ChevronUp className="w-3 h-3" />
              {nextType}
              <span className="flex items-center gap-0.5 opacity-70">
                <Coins className="w-2.5 h-2.5" />
                {formatGold(upgradeCost)}
              </span>
            </button>
          </div>
        ) : (
          <div className="px-2.5 pb-2.5 text-center text-[8px] text-[#45475a]">
            Max tier
          </div>
        )}
      </div>
    </>
  );
};
