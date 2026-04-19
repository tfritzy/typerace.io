import { useMemo } from "react";
import { SHIP_BLUEPRINTS, ROLE_META } from "./shipCatalog";
import type { EntityType } from "./types";
import type { PlacementSlot } from "./PlacementPoints";

interface ShipChoiceOverlayProps {
  onSelect: (entityType: EntityType) => void;
  shipPreviews: Map<EntityType, string>;
  slots: PlacementSlot[];
  level: number;
}

function generateChoices(slots: PlacementSlot[]): EntityType[] {
  const all = SHIP_BLUEPRINTS.map((bp) => bp.entityType);
  const existing = new Set(
    slots.filter((s) => s.occupant).map((s) => s.occupant!)
  );
  const allPlaced = all.every((t) => existing.has(t));
  const pool = allPlaced ? [...existing] : [...all];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(3, pool.length));
}

export const ShipChoiceOverlay = ({
  onSelect,
  shipPreviews,
  slots,
  level,
}: ShipChoiceOverlayProps) => {
  const choices = useMemo(() => generateChoices(slots), [slots]);
  const existing = new Map<string, PlacementSlot>();
  for (const s of slots) {
    if (s.occupant) existing.set(s.occupant, s);
  }

  return (
    <>
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)" }}
      />
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
        style={{ pointerEvents: "auto" }}
      >
        <div className="text-[#cdd6f4] text-[22px] font-semibold mb-1"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {`Level ${level}`}
        </div>
        <div className="text-[#a6adc8] text-[14px] mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Choose a ship
        </div>
        <div className="flex gap-5">
          {choices.map((entityType) => {
            const bp = SHIP_BLUEPRINTS.find((b) => b.entityType === entityType)!;
            const meta = ROLE_META[bp.role];
            const preview = shipPreviews.get(entityType);
            const existingSlot = existing.get(entityType);
            const isUpgrade = !!existingSlot;
            const currentLevel = existingSlot?.level ?? 0;

            return (
              <button
                key={entityType}
                className="flex flex-col items-center rounded-lg border cursor-pointer transition-all hover:border-opacity-60"
                style={{
                  width: 160,
                  padding: "20px 12px",
                  background: "rgba(12,14,30,0.95)",
                  borderColor: `${meta.color}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(20,22,44,0.95)";
                  e.currentTarget.style.borderColor = `${meta.color}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(12,14,30,0.95)";
                  e.currentTarget.style.borderColor = `${meta.color}40`;
                }}
                onClick={() => onSelect(entityType)}
              >
                {preview && (
                  <img
                    src={preview}
                    alt={entityType}
                    className="w-12 h-12 mb-3"
                    style={{ imageRendering: "pixelated" }}
                  />
                )}
                <span className="text-[#cdd6f4] text-[14px] font-semibold">
                  {entityType}
                </span>
                <span className="text-[11px] mt-1" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span
                  className="text-[12px] font-medium mt-2"
                  style={{ color: isUpgrade ? "#f9e2af" : "#a6e3a1" }}
                >
                  {isUpgrade
                    ? `Lv ${currentLevel} → ${currentLevel + 1}`
                    : "NEW"}
                </span>
                <span className="text-[10px] text-[#585b70] mt-2 text-center leading-tight">
                  {bp.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
