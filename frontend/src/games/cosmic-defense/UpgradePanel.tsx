import { useState } from "react";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins, X, Heart, Shield, Sword, Skull, ChevronDown } from "lucide-react";
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
const PANEL_WIDTH = 240;

const TARGETING_OPTIONS = [
  { mode: TargetingMode.NearestToShip, label: "Nearest to Ship" },
  { mode: TargetingMode.NearestToPlanet, label: "Nearest to Planet" },
  { mode: TargetingMode.Strongest, label: "Strongest" },
  { mode: TargetingMode.Weakest, label: "Weakest" },
];

function renderChargeDots(count: number, filled: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < filled ? "#4ade80" : "#333333", border: i >= filled ? "1px solid #555555" : "none" }}
        />
      ))}
    </div>
  );
}

function statDelta(current: number, next: number): string {
  const diff = next - current;
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

function renderUpgradeStatRows(currentConfig: FriendlyConfig, nextConfig: FriendlyConfig) {
  const rows: { label: string; current: number; next: number }[] = [];

  if (currentConfig.healAmount !== nextConfig.healAmount) {
    rows.push({ label: "Heal", current: currentConfig.healAmount, next: nextConfig.healAmount });
  }

  if (currentConfig.shieldAmount !== nextConfig.shieldAmount) {
    rows.push({ label: "Shield", current: currentConfig.shieldAmount, next: nextConfig.shieldAmount });
  }

  if (currentConfig.plasmaStacks !== nextConfig.plasmaStacks) {
    rows.push({ label: "Stacks", current: currentConfig.plasmaStacks, next: nextConfig.plasmaStacks });
  }

  if (currentConfig.projectileDamage !== nextConfig.projectileDamage) {
    rows.push({ label: "Damage", current: currentConfig.projectileDamage, next: nextConfig.projectileDamage });
  }

  if (currentConfig.laserDamage !== nextConfig.laserDamage) {
    rows.push({ label: "Damage", current: currentConfig.laserDamage, next: nextConfig.laserDamage });
  }

  if (currentConfig.health !== nextConfig.health) {
    rows.push({ label: "Health", current: currentConfig.health, next: nextConfig.health });
  }

  const chargeRow = currentConfig.chargesGranted > 0 && currentConfig.chargesRequired !== nextConfig.chargesRequired;

  return (
    <>
      {chargeRow && (
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-[#6c7086]">Charges</span>
          <div className="flex items-center gap-2">
            {renderChargeDots(currentConfig.chargesRequired, currentConfig.chargesRequired)}
            <span className="text-[9px] text-[#6c7086]">→</span>
            {renderChargeDots(nextConfig.chargesRequired, nextConfig.chargesRequired)}
          </div>
        </div>
      )}
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-[9px]">
          <span className="text-[#6c7086]">{row.label}</span>
          <span className={row.next >= row.current ? "text-[#a6e3a1]" : "text-[#f38ba8]"}>
            {row.next} ({statDelta(row.current, row.next)})
          </span>
        </div>
      ))}
    </>
  );
}

export const UpgradePanel = ({ onUpgrade, onClose, shipPreviews, gold, slot, entity, onTargetingChange }: UpgradePanelProps) => {
  const currentType = slot.occupant;
  const [targetingOpen, setTargetingOpen] = useState(false);
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
  const nextPreview = nextType ? shipPreviews.get(nextType) : null;
  const currentConfig = FRIENDLY_CONFIG_MAP.get(currentType);
  const nextConfig = nextType ? FRIENDLY_CONFIG_MAP.get(nextType) : null;
  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.icon;
  const currentTargeting = entity?.targetingMode ?? TargetingMode.NearestToShip;
  const currentTargetLabel = TARGETING_OPTIONS.find((o) => o.mode === currentTargeting)?.label ?? "Nearest to Ship";

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg p-3 border border-white/10 flex flex-col gap-2"
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
          <div className="flex items-center gap-1.5">
            <span className="text-[#cdd6f4] text-xs font-semibold tracking-wide">
              {currentType}
            </span>
            {roleMeta && RoleIcon && (
              <div className="flex items-center gap-1">
                <RoleIcon className="w-2.5 h-2.5" style={{ color: roleMeta.color }} />
                <span className="text-[9px]" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
              </div>
            )}
          </div>
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

        <div className="flex items-center gap-2.5 px-1">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
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
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[9px] text-[#585b70]">Tier {currentTier}</span>
            {entity && (
              <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                {(() => {
                  const healthPct = Math.max(0, Math.min(100, (entity.health / entity.maxHealth) * 100));
                  const barColor = healthPct > 50 ? "#a6e3a1" : healthPct > 25 ? "#f9e2af" : "#f38ba8";
                  return (
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${healthPct}%`, backgroundColor: barColor }}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {entity && currentConfig && (
          <div className="flex flex-col gap-1 px-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-[#6c7086]">Health</span>
              <span className="text-[#cdd6f4]">{Math.round(entity.health)} / {entity.maxHealth}</span>
            </div>
            {entity.shield > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Shield</span>
                <span className="text-[#74c7ec]">{Math.round(entity.shield)}</span>
              </div>
            )}
            {currentConfig.projectileDamage > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Damage</span>
                <span className="text-[#cdd6f4]">{currentConfig.projectileDamage}</span>
              </div>
            )}
            {currentConfig.laserDamage > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Laser Dmg</span>
                <span className="text-[#cdd6f4]">{currentConfig.laserDamage}</span>
              </div>
            )}
            {currentConfig.healAmount > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Heal</span>
                <span className="text-[#cdd6f4]">{currentConfig.healAmount}</span>
              </div>
            )}
            {currentConfig.shieldAmount > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Shield Grant</span>
                <span className="text-[#cdd6f4]">{currentConfig.shieldAmount}</span>
              </div>
            )}
            {currentConfig.plasmaStacks > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086]">Plasma Stacks</span>
                <span className="text-[#cdd6f4]">{currentConfig.plasmaStacks}</span>
              </div>
            )}
            {entity.chargesRequired > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-[#6c7086]">Charges</span>
                {renderChargeDots(entity.chargesRequired, entity.charge)}
              </div>
            )}
          </div>
        )}

        {entity && (
          <div className="border-t border-white/5 pt-1.5 flex flex-col gap-1 px-1">
            {entity.damageDealt > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086] flex items-center gap-1">
                  <Sword className="w-2.5 h-2.5" />Damage Done
                </span>
                <span className="text-[#cdd6f4]">{formatGold(Math.round(entity.damageDealt))}</span>
              </div>
            )}
            {entity.kills > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086] flex items-center gap-1">
                  <Skull className="w-2.5 h-2.5" />Kills
                </span>
                <span className="text-[#cdd6f4]">{entity.kills}</span>
              </div>
            )}
            {entity.totalHealed > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086] flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" />Total Healed
                </span>
                <span className="text-[#cdd6f4]">{formatGold(Math.round(entity.totalHealed))}</span>
              </div>
            )}
            {entity.totalShielded > 0 && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#6c7086] flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />Total Shielded
                </span>
                <span className="text-[#cdd6f4]">{formatGold(Math.round(entity.totalShielded))}</span>
              </div>
            )}
            {entity.damageDealt === 0 && entity.kills === 0 && entity.totalHealed === 0 && entity.totalShielded === 0 && (
              <div className="text-[9px] text-[#585b70] text-center py-0.5">No combat stats yet</div>
            )}
          </div>
        )}

        <div className="border-t border-white/5 pt-1.5 px-1">
          <span className="text-[9px] text-[#6c7086] mb-1 block">Target Priority</span>
          <div className="relative">
            <button
              className="w-full flex items-center justify-between gap-1 px-2 py-1 rounded border border-white/10 bg-white/[0.03] text-[10px] text-[#bac2de] cursor-pointer hover:bg-white/[0.06] transition-colors"
              onClick={() => setTargetingOpen(!targetingOpen)}
            >
              <span>{currentTargetLabel}</span>
              <ChevronDown className={`w-3 h-3 text-[#585b70] transition-transform ${targetingOpen ? "rotate-180" : ""}`} />
            </button>
            {targetingOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-0.5 rounded border border-white/10 overflow-hidden z-40"
                style={{
                  background: "rgba(12,14,30,0.98)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                {TARGETING_OPTIONS.map((opt) => (
                  <button
                    key={opt.mode}
                    className={`w-full text-left px-2 py-1 text-[10px] cursor-pointer transition-colors ${
                      opt.mode === currentTargeting
                        ? "text-[#a6e3a1] bg-white/[0.06]"
                        : "text-[#bac2de] hover:bg-white/[0.04]"
                    }`}
                    onClick={() => {
                      onTargetingChange(opt.mode);
                      setTargetingOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {nextType ? (
          <div className="border-t border-white/5 pt-1.5 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {nextPreview ? (
                  <img
                    src={nextPreview}
                    alt={nextType}
                    className="max-w-8 max-h-8"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-5 h-5 bg-white/15 rounded" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[#bac2de] font-medium">{nextType}</span>
                <span className="text-[9px] text-[#585b70]">Tier {currentTier + 1}</span>
              </div>
            </div>

            {currentConfig && nextConfig && (
              <div className="flex flex-col gap-1 px-1">
                {renderUpgradeStatRows(currentConfig, nextConfig)}
              </div>
            )}

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
          </div>
        ) : (
          <div className="text-center text-[10px] text-[#585b70] py-1 border-t border-white/5 pt-1.5">
            Tier {currentTier} · Fully upgraded
          </div>
        )}
      </div>
    </>
  );
};
