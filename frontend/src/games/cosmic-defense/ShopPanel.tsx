import { SHIP_BLUEPRINTS, type ShipRole } from "./shipCatalog";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins, X, Crosshair, Repeat, Heart, Shield, Flame, Zap, Focus } from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";
import type { LucideIcon } from "lucide-react";

const ROLE_META: Record<ShipRole, { icon: LucideIcon; label: string; color: string }> = {
  shooter: { icon: Crosshair, label: "Shooter", color: "#94e2d5" },
  alternating: { icon: Repeat, label: "Alternating", color: "#89b4fa" },
  healer: { icon: Heart, label: "Healer", color: "#a6e3a1" },
  shield: { icon: Shield, label: "Shield", color: "#74c7ec" },
  damage: { icon: Flame, label: "Damage", color: "#fab387" },
  charge: { icon: Zap, label: "Charge", color: "#f9e2af" },
  laser: { icon: Focus, label: "Laser", color: "#cba6f7" },
};

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

const PANEL_OFFSET_LEFT = 5;
const PANEL_OFFSET_TOP = 22;
const PANEL_MIN_TOP = 3;
const PANEL_MAX_TOP = 55;
const PANEL_WIDTH = 280;

export const ShopPanel = ({ onSelectShip, onClose, shipPreviews, gold, slot }: ShopPanelProps) => {
  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;

  const panelLeft = slotLeftPct + PANEL_OFFSET_LEFT;
  const panelTop = Math.max(PANEL_MIN_TOP, Math.min(PANEL_MAX_TOP, slotTopPct - PANEL_OFFSET_TOP));

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30 rounded-lg p-2.5 border border-white/10 flex flex-col"
        style={{
          left: `${panelLeft}%`,
          top: `${panelTop}%`,
          width: PANEL_WIDTH,
          maxHeight: "60%",
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
            const meta = ROLE_META[bp.role];
            const RoleIcon = meta.icon;
            return (
              <button
                key={bp.entityType}
                className={`flex items-center gap-2 p-1.5 px-2 rounded-md border transition-colors w-full ${
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
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-medium ${canAfford ? "text-[#bac2de]" : "text-[#585b70]"}`}>
                      {bp.entityType}
                    </span>
                    <RoleIcon className="w-2.5 h-2.5 shrink-0" style={{ color: canAfford ? meta.color : "#585b70" }} />
                    <span className="text-[9px]" style={{ color: canAfford ? meta.color : "#585b70" }}>
                      {meta.label}
                    </span>
                  </div>
                  <span className={`text-[9px] leading-tight ${canAfford ? "text-[#6c7086]" : "text-[#45475a]"}`}>
                    {bp.description}
                  </span>
                </div>
                <span className={`text-[10px] font-medium flex items-center gap-0.5 shrink-0 ${canAfford ? "text-[#f9e2af]" : "text-[#585b70]"}`}>
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
