import { useState, useMemo } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
}

const COL_SPACING = 130;
const ROW_SPACING = 110;
const HEX_HALF_W = COL_SPACING / 2;
const HEX_VERT = (ROW_SPACING * 2) / 3;
const HEX_HALF_VERT = HEX_VERT / 2;
const CROSS_SIZE = 8;

function hexPoints(cx: number, cy: number): string {
  return [
    `${cx},${cy - HEX_VERT}`,
    `${cx + HEX_HALF_W},${cy - HEX_HALF_VERT}`,
    `${cx + HEX_HALF_W},${cy + HEX_HALF_VERT}`,
    `${cx},${cy + HEX_VERT}`,
    `${cx - HEX_HALF_W},${cy + HEX_HALF_VERT}`,
    `${cx - HEX_HALF_W},${cy - HEX_HALF_VERT}`,
  ].join(" ");
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
        stroke="rgba(120,140,200,0.25)"
        strokeWidth={1}
      />

      {slots.map((slot) => {
        if (slot.occupant) return null;
        const isActive = activeSlotIndex === slot.index;
        const isHovered = hoveredIndex === slot.index;
        const fillColor = isActive
          ? "rgba(120,140,200,0.15)"
          : isHovered
            ? "rgba(120,140,200,0.08)"
            : "transparent";
        const crossColor = isActive
          ? "rgba(120,140,200,0.5)"
          : "rgba(120,140,200,0.3)";
        return (
          <g key={slot.index}>
            <polygon
              points={hexPoints(slot.x, slot.y)}
              fill={fillColor}
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              onClick={() => onSlotClick(slot)}
              onMouseEnter={() => setHoveredIndex(slot.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            <line
              x1={slot.x - CROSS_SIZE}
              y1={slot.y}
              x2={slot.x + CROSS_SIZE}
              y2={slot.y}
              stroke={crossColor}
              strokeWidth={1}
              style={{ pointerEvents: "none" }}
            />
            <line
              x1={slot.x}
              y1={slot.y - CROSS_SIZE}
              x2={slot.x}
              y2={slot.y + CROSS_SIZE}
              stroke={crossColor}
              strokeWidth={1}
              style={{ pointerEvents: "none" }}
            />
          </g>
        );
      })}
    </svg>
  );
};
