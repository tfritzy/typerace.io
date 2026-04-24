import { useEffect, useCallback } from "react";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { SHIP_BLUEPRINT_MAP } from "./shipBlueprints";
import type { EntityType } from "./types";
import type { PlacementSlot } from "./PlacementPoints";

interface ShipChoiceOverlayProps {
  onSelect: (entityType: EntityType) => void;
  shipPreviews: Map<EntityType, string>;
  slots: PlacementSlot[];
  level: number;
  choices: EntityType[];
}

export const ShipChoiceOverlay = ({
  onSelect,
  shipPreviews,
  slots,
  level,
  choices,
}: ShipChoiceOverlayProps) => {
  const existing = new Map<string, PlacementSlot>();
  for (const s of slots) {
    if (s.occupant) existing.set(s.occupant, s);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const idx = parseInt(e.key) - 1;
    if (idx >= 0 && idx < choices.length) {
      onSelect(choices[idx]);
    }
  }, [choices, onSelect]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
          {choices.map((entityType, i) => {
            const bp = SHIP_BLUEPRINT_MAP.get(entityType);
            const config = FRIENDLY_CONFIG_MAP.get(entityType);
            const preview = shipPreviews.get(entityType);
            const existingSlot = existing.get(entityType);
            const isUpgrade = !!existingSlot;
            const currentLevel = existingSlot?.level ?? 0;
            const hotkey = i + 1;
            const charges = config?.chargesRequired ?? 0;
            if (!bp) return null;

            return (
              <button
                key={entityType}
                className="flex flex-col items-center rounded-lg cursor-pointer transition-all relative"
                style={{
                  width: 160,
                  padding: "20px 12px 24px",
                  background: "rgba(12,14,30,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(20,22,44,0.95)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(12,14,30,0.95)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
                onClick={() => onSelect(entityType)}
              >
                <div className="w-12 h-12 mb-3">
                  {preview && (
                    <img
                      src={preview}
                      alt={entityType}
                      className="w-12 h-12"
                      style={{ imageRendering: "pixelated" }}
                    />
                  )}
                </div>
                <span className="text-[#cdd6f4] text-[14px] font-semibold">
                  {entityType}
                </span>
                {isUpgrade ? (
                  <span className="flex items-center gap-1 mt-1 text-[12px] font-semibold">
                    <span style={{ color: "#a6adc8" }}>{`Lv ${currentLevel}`}</span>
                    <span style={{ color: "#585b70" }}>→</span>
                    <span style={{ color: "#f9e2af" }}>{`Lv ${currentLevel + 1}`}</span>
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-semibold rounded-full px-2 py-0.5 mt-1"
                    style={{
                      background: "rgba(166,227,161,0.15)",
                      color: "#a6e3a1",
                      border: "1px solid rgba(166,227,161,0.3)",
                    }}
                  >
                    NEW
                  </span>
                )}
                <span className="text-[11px] text-[#a6adc8] mt-2 text-center leading-snug px-1">
                  {bp.description}
                </span>
                {charges > 0 && (
                  <div className="flex gap-1 mt-2.5">
                    {Array.from({ length: charges }, (_, d) => (
                      <span
                        key={d}
                        className="inline-block rounded-full"
                        style={{
                          width: 5,
                          height: 5,
                          background: "rgba(255,255,255,0.25)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                )}
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-[14px] font-bold rounded-md flex items-center justify-center"
                  style={{
                    bottom: -14,
                    background: "rgba(12,14,30,0.95)",
                    color: "#cdd6f4",
                    border: "1px solid rgba(255,255,255,0.15)",
                    width: 30,
                    height: 28,
                  }}
                >
                  {hotkey}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
