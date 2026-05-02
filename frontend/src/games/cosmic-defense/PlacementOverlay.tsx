import { useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { SLOT_HIT_RADIUS } from "./PlacementPoints";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
}

export const PlacementOverlay = ({
  slots,
  onSlotClick,
  activeSlotIndex,
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
          </g>
        );
      })}
    </svg>
  );
};
