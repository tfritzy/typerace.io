import { useState } from "react";
import { SHIP_BLUEPRINTS, ROLE_META } from "./shipCatalog";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { Coins } from "lucide-react";
import type { PlacementSlot } from "./PlacementPoints";

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

const RADIUS = 90;
const HEX_R = 38;
const CONTAINER_SIZE = (RADIUS + HEX_R) * 2 + 20;
const CENTER = CONTAINER_SIZE / 2;

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((i * 60 - 90) * Math.PI) / 180;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

const POSITIONS = [
  { x: 0, y: 0 },
  ...Array.from({ length: 6 }, (_, i) => {
    const angle = ((i * 60 - 90) * Math.PI) / 180;
    return {
      x: Math.round(RADIUS * Math.cos(angle)),
      y: Math.round(RADIUS * Math.sin(angle)),
    };
  }),
];

export const ShopPanel = ({
  onSelectShip,
  onClose,
  shipPreviews,
  gold,
  slot,
}: ShopPanelProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const slotLeftPct = (slot.x / CANVAS_WIDTH) * 100;
  const slotTopPct = (slot.y / CANVAS_HEIGHT) * 100;

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <div
        className="absolute z-30"
        style={{
          left: `${slotLeftPct}%`,
          top: `${slotTopPct}%`,
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <svg
          className="absolute inset-0"
          width={CONTAINER_SIZE}
          height={CONTAINER_SIZE}
          viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        >
          <polygon
            points={hexPoints(CENTER, CENTER, RADIUS)}
            fill="rgba(8,10,24,0.4)"
            stroke="rgba(120,140,200,0.18)"
            strokeWidth={1}
          />
          {POSITIONS.slice(1).map((pos, i) => (
            <line
              key={`spoke-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={CENTER + pos.x}
              y2={CENTER + pos.y}
              stroke="rgba(120,140,200,0.12)"
              strokeWidth={1}
            />
          ))}
          {SHIP_BLUEPRINTS.map((bp, i) => {
            const pos = POSITIONS[i];
            const isHovered = hoveredIndex === i;
            const canAfford = gold >= bp.cost;
            const meta = ROLE_META[bp.role];
            const roleColor = meta.color;
            return (
              <polygon
                key={`hex-${bp.entityType}`}
                points={hexPoints(CENTER + pos.x, CENTER + pos.y, HEX_R)}
                fill={
                  !canAfford
                    ? "rgba(12,14,30,0.8)"
                    : isHovered
                      ? `rgba(12,14,30,0.6)`
                      : "rgba(12,14,30,0.92)"
                }
                stroke={
                  !canAfford
                    ? "rgba(120,140,200,0.08)"
                    : isHovered
                      ? roleColor
                      : "rgba(120,140,200,0.3)"
                }
                strokeWidth={isHovered && canAfford ? 1.5 : 1}
                style={{
                  pointerEvents: "auto",
                  cursor: canAfford ? "pointer" : "not-allowed",
                  filter: isHovered && canAfford
                    ? `drop-shadow(0 0 6px ${roleColor}40)`
                    : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAfford) onSelectShip(bp.entityType);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
        {SHIP_BLUEPRINTS.map((bp, i) => {
          const pos = POSITIONS[i];
          const canAfford = gold >= bp.cost;
          const preview = shipPreviews.get(bp.entityType);
          return (
            <div
              key={`label-${bp.entityType}`}
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: CENTER + pos.x,
                top: CENTER + pos.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                opacity: canAfford ? 1 : 0.3,
              }}
            >
              <div className="flex items-center justify-center" style={{ height: 30 }}>
                {preview ? (
                  <img
                    src={preview}
                    alt={bp.entityType}
                    className="max-w-7 max-h-7"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-5 h-5 bg-white/15 rounded" />
                )}
              </div>
              <span className="text-[9px] text-[#bac2de] font-medium leading-none whitespace-nowrap">
                {bp.entityType}
              </span>
              <span className="text-[8px] text-[#f9e2af] flex items-center gap-0.5 leading-none mt-0.5">
                <Coins className="w-2.5 h-2.5" />
                {formatGold(bp.cost)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};
