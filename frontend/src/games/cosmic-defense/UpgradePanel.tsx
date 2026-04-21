import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { X } from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";
import { TargetingMode } from "./state";
import type { EntityState } from "./state";

interface InspectionPanelProps {
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  slot: PlacementSlot;
  entity: EntityState | null;
  onTargetingChange: (mode: TargetingMode) => void;
}

const PANEL_OFFSET_LEFT = 5;
const PANEL_OFFSET_TOP = 10;
const PANEL_MIN_TOP = 3;
const PANEL_MAX_TOP = 55;
const PANEL_WIDTH = 170;

const TARGETING_OPTIONS: { mode: TargetingMode; label: string }[] = [
  { mode: TargetingMode.NearestToShip, label: "Nearest" },
  { mode: TargetingMode.NearestToPlanet, label: "Closest to planet" },
  { mode: TargetingMode.Strongest, label: "Strongest" },
  { mode: TargetingMode.Weakest, label: "Weakest" },
  { mode: TargetingMode.LowestHealth, label: "Most damaged" },
];

export const InspectionPanel = ({
  onClose,
  shipPreviews,
  slot,
  entity,
  onTargetingChange,
}: InspectionPanelProps) => {
  const currentType = slot.occupant;
  if (!currentType) return null;

  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;
  const panelLeft = slotLeftPct + PANEL_OFFSET_LEFT;
  const panelTop = Math.max(
    PANEL_MIN_TOP,
    Math.min(PANEL_MAX_TOP, slotTopPct - PANEL_OFFSET_TOP)
  );

  const currentPreview = shipPreviews.get(currentType);
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
            </div>
            <div className="text-[9px] text-[#585b70] mt-0.5">
              Lv {slot.level}
            </div>
          </div>
        </div>

        <div className="px-2.5 pb-2.5">
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
      </div>
    </>
  );
};
