import { useState } from "react";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { X, Crosshair, Globe, ArrowUpCircle, ArrowDownCircle, ChevronUp, Skull, Swords, Heart, ShieldPlus } from "lucide-react";
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

function getStatRows(config: FriendlyConfig, nextConfig: FriendlyConfig | undefined, showDeltas: boolean): { label: string; value: number; next: number | null }[] {
  const rows: { label: string; value: number; next: number | null }[] = [];
  const delta = (cur: number, nxt: number | undefined) => showDeltas && nxt !== undefined && nxt !== cur ? nxt : null;
  if (config.projectileDamage > 0) rows.push({ label: "Damage", value: config.projectileDamage, next: delta(config.projectileDamage, nextConfig?.projectileDamage) });
  if (config.laserDamage > 0) rows.push({ label: "Damage", value: config.laserDamage, next: delta(config.laserDamage, nextConfig?.laserDamage) });
  if (config.healAmount > 0) rows.push({ label: "Heal", value: config.healAmount, next: delta(config.healAmount, nextConfig?.healAmount) });
  if (config.shieldAmount > 0) rows.push({ label: "Shield", value: config.shieldAmount, next: delta(config.shieldAmount, nextConfig?.shieldAmount) });
  if (config.plasmaStacks > 0) rows.push({ label: "Stacks", value: config.plasmaStacks, next: delta(config.plasmaStacks, nextConfig?.plasmaStacks) });
  if (config.chargesGranted > 0) rows.push({ label: "Charges", value: config.chargesGranted, next: delta(config.chargesGranted, nextConfig?.chargesGranted) });
  rows.push({ label: "Health", value: config.health, next: delta(config.health, nextConfig?.health) });
  return rows;
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export const UpgradePanel = ({ onUpgrade, onClose, shipPreviews, gold, slot, entity, onTargetingChange }: UpgradePanelProps) => {
  const [confirming, setConfirming] = useState(false);

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
  const nextConfig = nextType ? FRIENDLY_CONFIG_MAP.get(nextType) : undefined;
  const roleMeta = role ? ROLE_META[role] : null;
  const RoleIcon = roleMeta?.icon;
  const currentTargeting = entity?.targetingMode ?? TargetingMode.NearestToShip;
  const statRows = currentConfig ? getStatRows(currentConfig, nextConfig, confirming) : [];

  const handleUpgradeClick = () => {
    if (!canAfford) return;
    if (confirming) {
      onUpgrade();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

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

        <div className="flex items-center gap-2.5 pt-3 pb-2 px-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt={currentType}
                className="max-w-10 max-h-10"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div className="w-8 h-8 bg-white/15 rounded" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[#cdd6f4] text-xs font-semibold block leading-tight">{currentType}</span>
            {roleMeta && RoleIcon && (
              <div className="flex items-center gap-1 mt-0.5">
                <RoleIcon className="w-2.5 h-2.5" style={{ color: roleMeta.color }} />
                <span className="text-[9px]" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
                <span className="text-[9px] text-[#585b70]">· Tier {currentTier}</span>
              </div>
            )}
          </div>
        </div>

        {entity && (
          <div className="px-3 pb-1">
            <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 mb-0.5">
              {(() => {
                const pct = Math.max(0, Math.min(100, (entity.health / entity.maxHealth) * 100));
                const color = pct > 50 ? "#a6e3a1" : pct > 25 ? "#f9e2af" : "#f38ba8";
                return <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />;
              })()}
            </div>
            <span className="text-[9px] text-[#6c7086]">{Math.round(entity.health)} / {entity.maxHealth}</span>
          </div>
        )}

        <div className="px-3 pb-2">
          {statRows.map((row) => (
            <div key={row.label} className="flex justify-between text-[9px] mt-0.5">
              <span className="text-[#6c7086]">{row.label}</span>
              <span className="text-[#a6adc8]">
                {row.value}
                {row.next !== null && <span className="text-[#a6e3a1]"> → {row.next}</span>}
              </span>
            </div>
          ))}
        </div>

        {entity && (entity.kills > 0 || entity.damageDealt > 0 || entity.totalHealed > 0 || entity.totalShielded > 0) && (
          <div className="px-3 pb-2 flex items-center gap-2.5">
            {entity.kills > 0 && (
              <span className="flex items-center gap-0.5 text-[#585b70]" title="Kills">
                <Skull className="w-2.5 h-2.5" />
                <span className="text-[8px]">{formatStat(entity.kills)}</span>
              </span>
            )}
            {entity.damageDealt > 0 && (
              <span className="flex items-center gap-0.5 text-[#585b70]" title="Damage dealt">
                <Swords className="w-2.5 h-2.5" />
                <span className="text-[8px]">{formatStat(entity.damageDealt)}</span>
              </span>
            )}
            {entity.totalHealed > 0 && (
              <span className="flex items-center gap-0.5 text-[#585b70]" title="Total healed">
                <Heart className="w-2.5 h-2.5" />
                <span className="text-[8px]">{formatStat(entity.totalHealed)}</span>
              </span>
            )}
            {entity.totalShielded > 0 && (
              <span className="flex items-center gap-0.5 text-[#585b70]" title="Total shielded">
                <ShieldPlus className="w-2.5 h-2.5" />
                <span className="text-[8px]">{formatStat(entity.totalShielded)}</span>
              </span>
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

        {nextType ? (
          <div className="px-3 pb-3">
            <button
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-colors w-full ${
                confirming && canAfford
                  ? "bg-[#f9e2af]/15 text-[#f9e2af] cursor-pointer hover:bg-[#f9e2af]/25"
                  : canAfford
                    ? "bg-[#a6e3a1]/10 text-[#a6e3a1] cursor-pointer hover:bg-[#a6e3a1]/20"
                    : "bg-white/[0.02] text-[#585b70] cursor-not-allowed"
              }`}
              onClick={handleUpgradeClick}
              disabled={!canAfford}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {confirming ? `Confirm · ${formatGold(upgradeCost)}` : `${nextType} · ${formatGold(upgradeCost)}`}
            </button>
          </div>
        ) : (
          <div className="px-3 pb-3 text-center text-[9px] text-[#585b70]">
            Max tier
          </div>
        )}
      </div>
    </>
  );
};
