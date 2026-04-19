import { useState, useMemo } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { hexPoints, HEX_HALF_W, HEX_VERT, HEX_HALF_VERT } from "./PlacementPoints";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
}

function buildGridPath(slots: PlacementSlot[]): string {
  const seen = new Set<string>();
  const segments: string[] = [];

  for (const slot of slots) {
    const verts: [number, number][] = [
      [slot.x, slot.y - HEX_VERT],
      [slot.x + HEX_HALF_W, slot.y - HEX_HALF_VERT],
      [slot.x + HEX_HALF_W, slot.y + HEX_HALF_VERT],
      [slot.x, slot.y + HEX_VERT],
      [slot.x - HEX_HALF_W, slot.y + HEX_HALF_VERT],
      [slot.x - HEX_HALF_W, slot.y - HEX_HALF_VERT],
    ];

    for (let i = 0; i < 6; i++) {
      const [x1, y1] = verts[i];
      const [x2, y2] = verts[(i + 1) % 6];
      const ax = Math.round(x1 * 10);
      const ay = Math.round(y1 * 10);
      const bx = Math.round(x2 * 10);
      const by = Math.round(y2 * 10);
      const key =
        `${ax},${ay}` < `${bx},${by}`
          ? `${ax},${ay}-${bx},${by}`
          : `${bx},${by}-${ax},${ay}`;
      if (!seen.has(key)) {
        seen.add(key);
        segments.push(`M${x1},${y1}L${x2},${y2}`);
      }
    }
  }

  return segments.join("");
}

export const PlacementOverlay = ({
  slots,
  onSlotClick,
  activeSlotIndex,
}: PlacementOverlayProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gridPath = useMemo(() => buildGridPath(slots), [slots]);

  return (
    <svg
      className="absolute inset-0 z-10 w-full h-full"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: "none" }}
    >
      <path
        d={gridPath}
        fill="none"
        stroke="rgba(120,140,200,0.35)"
        strokeWidth={1}
      />

      {slots.map((slot) => {
        const isActive = activeSlotIndex === slot.index;
        const isHovered = hoveredIndex === slot.index;
        const isEmpty = !slot.occupant;
        return (
          <g key={slot.index}>
            <polygon
              points={hexPoints(slot.x, slot.y)}
              fill="transparent"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              onClick={() => onSlotClick(slot)}
              onMouseEnter={() => setHoveredIndex(slot.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {(isHovered || isActive) && (
              <polygon
                points={hexPoints(slot.x, slot.y)}
                fill="none"
                stroke={isActive ? "rgba(120,140,200,0.7)" : "rgba(120,140,200,0.55)"}
                strokeWidth={1}
                style={{ pointerEvents: "none" }}
              />
            )}
            {isEmpty && (
              <circle
                cx={slot.x}
                cy={slot.y}
                r={3}
                fill={
                  isActive
                    ? "rgba(120,140,200,0.7)"
                    : isHovered
                      ? "rgba(120,140,200,0.55)"
                      : "rgba(120,140,200,0.3)"
                }
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
