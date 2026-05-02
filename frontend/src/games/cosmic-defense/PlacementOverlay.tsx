import { useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { SLOT_HIT_RADIUS } from "./PlacementPoints";
import type { PlacementSlot } from "./PlacementPoints";
import type { EntityState } from "./state";
import type { RelicEffects } from "./relics";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
  entityById?: Map<number, EntityState>;
  relicEffects?: RelicEffects;
}

const BADGE_RADIUS = 3;
const BADGE_SPACING = 8;
const BADGE_Y_OFFSET = SLOT_HIT_RADIUS + 6;

function computeBadges(entity: EntityState, fx: RelicEffects): { color: string; key: string }[] {
  const badges: { color: string; key: string }[] = [];
  if (fx.laserDamageMultiplier > 1 && entity.laserDamage > 0)
    badges.push({ color: "#cba6f7", key: "laser" });
  if (fx.projectileDamageMultiplier > 1 && entity.projectileDamage > 0)
    badges.push({ color: "#fab387", key: "proj" });
  if (fx.plasmaStacksBonus > 0 && entity.plasmaStacksApplied > 0)
    badges.push({ color: "#f38ba8", key: "plasma" });
  if (fx.freezeStacksBonus > 0 && entity.freezeStacks > 0)
    badges.push({ color: "#89dceb", key: "freeze" });
  if (fx.bonusChargesGranted > 0 && entity.chargesGranted > 0)
    badges.push({ color: "#a6e3a1", key: "charge" });
  if ((fx.explosionRadiusMultiplier > 1 || fx.explosionPlasmaStacks > 0) && entity.explosionRadius > 0)
    badges.push({ color: "#f9e2af", key: "aoe" });
  return badges;
}

export const PlacementOverlay = ({
  slots,
  onSlotClick,
  activeSlotIndex,
  entityById,
  relicEffects,
}: PlacementOverlayProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <svg
      className="absolute inset-0 z-10 w-full h-full"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: "none" }}
    >
      {slots.map((slot) => {
        const isActive = activeSlotIndex === slot.index;
        const isHovered = hoveredIndex === slot.index;
        const isEmpty = !slot.occupant;
        const entity = entityById && slot.entityId != null ? entityById.get(slot.entityId) : undefined;
        const badges = entity && relicEffects ? computeBadges(entity, relicEffects) : [];
        return (
          <g key={slot.index}>
            {slot.occupant && (
              <circle
                cx={slot.x}
                cy={slot.y}
                r={SLOT_HIT_RADIUS}
                fill="transparent"
                style={{ pointerEvents: "auto", cursor: "pointer" }}
                onClick={() => onSlotClick(slot)}
                onMouseEnter={() => setHoveredIndex(slot.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )}
            {isEmpty && (
              <circle
                cx={slot.x}
                cy={slot.y}
                r={4}
                fill="rgba(120,140,200,0.2)"
                style={{ pointerEvents: "none" }}
              />
            )}
            {!isEmpty && (isHovered || isActive) && (
              <circle
                cx={slot.x}
                cy={slot.y}
                r={SLOT_HIT_RADIUS}
                fill="none"
                stroke={isActive ? "rgba(120,140,200,0.7)" : "rgba(120,140,200,0.4)"}
                strokeWidth={1.5}
                style={{ pointerEvents: "none" }}
              />
            )}
            {badges.map((badge, i) => (
              <circle
                key={badge.key}
                cx={slot.x - ((badges.length - 1) * BADGE_SPACING) / 2 + i * BADGE_SPACING}
                cy={slot.y + BADGE_Y_OFFSET}
                r={BADGE_RADIUS}
                fill={badge.color}
                style={{ pointerEvents: "none" }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
