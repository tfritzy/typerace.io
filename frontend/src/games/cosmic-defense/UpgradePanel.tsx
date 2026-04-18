import { useState } from "react";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import {
  X,
  Crosshair,
  Globe,
  ArrowUpCircle,
  ArrowDownCircle,
  HeartCrack,
  ChevronUp,
  Skull,
  Coins,
} from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";
import { getNextUpgrade, getUpgradeCost, getShipTier } from "./upgradePaths";
import { FRIENDLY_CONFIG_MAP, type FriendlyConfig } from "./enemyConfig";
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

const TARGETING_BUTTONS: {
  mode: TargetingMode;
  icon: typeof Crosshair;
  tip: string;
}[] = [
  { mode: TargetingMode.NearestToShip, icon: Crosshair, tip: "Targets the nearest enemy to this ship" },
  { mode: TargetingMode.NearestToPlanet, icon: Globe, tip: "Targets the enemy closest to the planet" },
  { mode: TargetingMode.Strongest, icon: ArrowUpCircle, tip: "Targets the enemy with the most max health" },
  { mode: TargetingMode.Weakest, icon: ArrowDownCircle, tip: "Targets the enemy with the least max health" },
  { mode: TargetingMode.LowestHealth, icon: HeartCrack, tip: "Targets the enemy with the lowest current health" },
];

function getPrimaryStat(
  config: FriendlyConfig
): { label: string; value: number } | null {
  if (config.projectileDamage > 0) return { label: "dmg", value: config.projectileDamage };
  if (config.laserDamage > 0) return { label: "dmg", value: config.laserDamage };
  if (config.healAmount > 0) return { label: "heal", value: config.healAmount };
  if (config.shieldAmount > 0) return { label: "shield", value: config.shieldAmount };
  if (config.plasmaStacks > 0) return { label: "stacks", value: config.plasmaStacks };
  if (config.chargesGranted > 0) return { label: "charges", value: config.chargesGranted };
  return null;
}

export const UpgradePanel = ({
  onUpgrade,
  onClose,
  shipPreviews,
  gold,
  slot,
  entity,
  onTargetingChange,
}: UpgradePanelProps) => {
  const [hovering, setHovering] = useState(false);

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
  const currentConfig = FRIENDLY_CONFIG_MAP.get(currentType);
  const nextConfig = nextType ? FRIENDLY_CONFIG_MAP.get(nextType) : undefined;
  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.icon;
  const currentTargeting = entity?.targetingMode ?? TargetingMode.NearestToShip;

  const primaryStat = currentConfig ? getPrimaryStat(currentConfig) : null;
  const nextPrimaryStat = nextConfig ? getPrimaryStat(nextConfig) : null;
  const showDeltas = hovering && nextConfig !== undefined;

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
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        i < currentTier
                          ? (roleMeta?.color ?? "#a6adc8")
                          : "rgba(88,91,112,0.4)",
                    }}
                  />
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

        {entity && (
          <div className="px-2.5 pb-1.5">
            <div className="w-full bg-[#1e1e2e] rounded-full h-1 overflow-hidden">
              {(() => {
                const pct = Math.max(
                  0,
                  Math.min(100, (entity.health / entity.maxHealth) * 100)
                );
                const color =
                  pct > 50 ? "#a6e3a1" : pct > 25 ? "#f9e2af" : "#f38ba8";
                return (
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                );
              })()}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[8px] text-[#6c7086]">
                {Math.round(entity.health)}/{entity.maxHealth}
              </span>
              {primaryStat && (
                <span className="text-[8px] text-[#6c7086]">
                  {primaryStat.label} {primaryStat.value}
                  {showDeltas &&
                    nextPrimaryStat &&
                    nextPrimaryStat.value !== primaryStat.value && (
                      <span className="text-[#a6e3a1]">
                        →{nextPrimaryStat.value}
                      </span>
                    )}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-2.5 pb-1.5 flex items-center justify-start gap-0.5">
          {TARGETING_BUTTONS.map((btn) => {
            const active = btn.mode === currentTargeting;
            const BtnIcon = btn.icon;
            return (
              <button
                key={btn.mode}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  active
                    ? "bg-white/10 text-[#a6e3a1]"
                    : "text-[#585b70] hover:bg-white/[0.06] hover:text-[#a6adc8]"
                }`}
                onClick={() => onTargetingChange(btn.mode)}
                title={btn.tip}
              >
                <BtnIcon className="w-3.5 h-3.5" />
              </button>
            );
          })}
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
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onFocus={() => setHovering(true)}
              onBlur={() => setHovering(false)}
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
