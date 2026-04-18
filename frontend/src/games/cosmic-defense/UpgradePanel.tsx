import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins, X, Crosshair, Globe, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
const PANEL_WIDTH = 200;

const TARGETING_BUTTONS: { mode: TargetingMode; label: string; icon: typeof Crosshair }[] = [
  { mode: TargetingMode.NearestToShip, label: "Near", icon: Crosshair },
  { mode: TargetingMode.NearestToPlanet, label: "Planet", icon: Globe },
  { mode: TargetingMode.Strongest, label: "Strong", icon: ArrowUpCircle },
  { mode: TargetingMode.Weakest, label: "Weak", icon: ArrowDownCircle },
];

function getPrimaryStat(config: FriendlyConfig): { label: string; value: number } | null {
  if (config.projectileDamage > 0) return { label: "Damage", value: config.projectileDamage };
  if (config.laserDamage > 0) return { label: "Damage", value: config.laserDamage };
  if (config.healAmount > 0) return { label: "Heal", value: config.healAmount };
  if (config.shieldAmount > 0) return { label: "Shield", value: config.shieldAmount };
  if (config.plasmaStacks > 0) return { label: "Stacks", value: config.plasmaStacks };
  if (config.chargesGranted > 0) return { label: "Charges", value: config.chargesGranted };
  return null;
}

function getUpgradeDeltas(current: FriendlyConfig, next: FriendlyConfig): { label: string; from: number; to: number }[] {
  const deltas: { label: string; from: number; to: number }[] = [];
  if (current.projectileDamage !== next.projectileDamage) deltas.push({ label: "Damage", from: current.projectileDamage, to: next.projectileDamage });
  if (current.laserDamage !== next.laserDamage) deltas.push({ label: "Damage", from: current.laserDamage, to: next.laserDamage });
  if (current.healAmount !== next.healAmount) deltas.push({ label: "Heal", from: current.healAmount, to: next.healAmount });
  if (current.shieldAmount !== next.shieldAmount) deltas.push({ label: "Shield", from: current.shieldAmount, to: next.shieldAmount });
  if (current.plasmaStacks !== next.plasmaStacks) deltas.push({ label: "Stacks", from: current.plasmaStacks, to: next.plasmaStacks });
  if (current.health !== next.health) deltas.push({ label: "Health", from: current.health, to: next.health });
  return deltas;
}

export const UpgradePanel = ({ onUpgrade, onClose, shipPreviews, gold, slot, entity, onTargetingChange }: UpgradePanelProps) => {
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
  const panelTop = Math.max(PANEL_MIN_TOP, Math.min(PANEL_MAX_TOP, slotTopPct - PANEL_OFFSET_TOP));

  const currentPreview = shipPreviews.get(currentType);
  const currentConfig = FRIENDLY_CONFIG_MAP.get(currentType);
  const nextConfig = nextType ? FRIENDLY_CONFIG_MAP.get(nextType) : null;
  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.icon;
  const primaryStat = currentConfig ? getPrimaryStat(currentConfig) : null;
  const currentTargeting = entity?.targetingMode ?? TargetingMode.NearestToShip;

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg border border-white/10 flex flex-col"
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
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 text-[#585b70] hover:text-[#a6adc8] transition-colors cursor-pointer p-0.5 z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center pt-3 pb-2 px-3">
          <div className="w-12 h-12 flex items-center justify-center mb-1.5">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt={currentType}
                className="max-w-12 max-h-12"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="w-8 h-8 bg-white/15 rounded" />
            )}
          </div>
          <span className="text-[#cdd6f4] text-xs font-semibold">{currentType}</span>
          {roleMeta && RoleIcon && (
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon className="w-2.5 h-2.5" style={{ color: roleMeta.color }} />
              <span className="text-[9px]" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
              <span className="text-[9px] text-[#585b70]">· Tier {currentTier}</span>
            </div>
          )}
        </div>

        {entity && (
          <div className="px-3 pb-2">
            <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-1">
              {(() => {
                const pct = Math.max(0, Math.min(100, (entity.health / entity.maxHealth) * 100));
                const color = pct > 50 ? "#a6e3a1" : pct > 25 ? "#f9e2af" : "#f38ba8";
                return <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />;
              })()}
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-[#6c7086]">HP</span>
              <span className="text-[#a6adc8]">{Math.round(entity.health)} / {entity.maxHealth}</span>
            </div>
            {primaryStat && (
              <div className="flex justify-between text-[9px] mt-0.5">
                <span className="text-[#6c7086]">{primaryStat.label}</span>
                <span className="text-[#a6adc8]">{primaryStat.value}</span>
              </div>
            )}
          </div>
        )}

        <div className="px-3 pb-2">
          <span className="text-[9px] text-[#585b70] mb-1 block">Target</span>
          <div className="grid grid-cols-4 gap-0.5">
            {TARGETING_BUTTONS.map((btn) => {
              const active = btn.mode === currentTargeting;
              const BtnIcon = btn.icon;
              return (
                <button
                  key={btn.mode}
                  className={`flex flex-col items-center gap-0.5 py-1 rounded text-[8px] transition-colors cursor-pointer ${
                    active
                      ? "bg-white/10 text-[#a6e3a1]"
                      : "bg-white/[0.02] text-[#585b70] hover:bg-white/[0.06] hover:text-[#a6adc8]"
                  }`}
                  onClick={() => onTargetingChange(btn.mode)}
                >
                  <BtnIcon className="w-3 h-3" />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {nextType && currentConfig && nextConfig ? (
          <div className="border-t border-white/5 px-3 py-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {(() => {
                const nextPreview = shipPreviews.get(nextType);
                return nextPreview ? (
                  <img
                    src={nextPreview}
                    alt={nextType}
                    className="w-7 h-7"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-5 h-5 bg-white/15 rounded" />
                );
              })()}
              <div>
                <span className="text-[10px] text-[#bac2de] font-medium block leading-tight">{nextType}</span>
                <span className="text-[8px] text-[#585b70]">Tier {currentTier + 1}</span>
              </div>
            </div>
            {getUpgradeDeltas(currentConfig, nextConfig).map((d) => (
              <div key={d.label} className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">{d.label}</span>
                <span className="text-[#a6adc8]">
                  {d.from} <span className="text-[#a6e3a1]">→ {d.to}</span>
                </span>
              </div>
            ))}
            <button
              className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-colors w-full ${
                canAfford
                  ? "bg-green-400/10 text-green-400 cursor-pointer hover:bg-green-400/20"
                  : "bg-white/[0.02] text-[#585b70] cursor-not-allowed"
              }`}
              onClick={() => canAfford && onUpgrade()}
              disabled={!canAfford}
            >
              <Coins className="w-3 h-3" />
              Upgrade · {formatGold(upgradeCost)}
            </button>
          </div>
        ) : (
          <div className="border-t border-white/5 px-3 py-2 text-center text-[9px] text-[#585b70]">
            Max tier
          </div>
        )}
      </div>
    </>
  );
};
