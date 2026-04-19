import { useState, useEffect } from "react";
import { SHIP_BLUEPRINTS, ROLE_META } from "./shipCatalog";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import { COL_SPACING, ROW_SPACING, HEX_HALF_W } from "./PlacementPoints";
import type { PlacementSlot } from "./PlacementPoints";

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

const NEIGHBOR_OFFSETS = [
  { x: 0, y: 0 },
  { x: HEX_HALF_W, y: -ROW_SPACING },
  { x: COL_SPACING, y: 0 },
  { x: HEX_HALF_W, y: ROW_SPACING },
  { x: -HEX_HALF_W, y: ROW_SPACING },
  { x: -COL_SPACING, y: 0 },
  { x: -HEX_HALF_W, y: -ROW_SPACING },
];

const ANIM_DURATION = 150;
const SPRITE_SIZE = 34;
const HIT_RADIUS = 40;
const TOOLTIP_W = 160;
const TOOLTIP_H = 52;

export const ShopPanel = ({
  onSelectShip,
  onClose,
  shipPreviews,
  gold,
  slot,
}: ShopPanelProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let animId: number;
    const tick = (now: number) => {
      const ms = now - start;
      setElapsed(ms);
      if (ms < ANIM_DURATION) animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-20" onClick={onClose} />
      <svg
        className="absolute inset-0 z-30 w-full h-full"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: "none" }}
      >
        {SHIP_BLUEPRINTS.map((bp, i) => {
          const offset = NEIGHBOR_OFFSETS[i];
          const isCenter = i === 0;
          const t = isCenter
            ? 1
            : Math.max(0, Math.min(1, elapsed / ANIM_DURATION));
          const cx = slot.x + offset.x * t;
          const cy = slot.y + offset.y * t;
          const isHovered = hoveredIndex === i;
          const canAfford = gold >= bp.cost;
          const meta = ROLE_META[bp.role];
          const preview = shipPreviews.get(bp.entityType);
          const RoleIcon = meta.icon;

          return (
            <g key={bp.entityType} opacity={t}>
              <circle
                cx={cx}
                cy={cy}
                r={HIT_RADIUS}
                fill="transparent"
                style={{
                  pointerEvents: "auto",
                  cursor: canAfford ? "pointer" : "not-allowed",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAfford) onSelectShip(bp.entityType);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {preview && (
                <image
                  href={preview}
                  x={cx - SPRITE_SIZE / 2}
                  y={cy - SPRITE_SIZE / 2 - 10}
                  width={SPRITE_SIZE}
                  height={SPRITE_SIZE}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ pointerEvents: "none", imageRendering: "pixelated" }}
                />
              )}
              <foreignObject
                x={cx + SPRITE_SIZE / 2 - 2}
                y={cy - SPRITE_SIZE / 2 - 10}
                width={16}
                height={16}
                style={{ pointerEvents: "none", overflow: "visible" }}
              >
                <RoleIcon size={12} color={meta.color} strokeWidth={2.5} />
              </foreignObject>
              <text
                x={cx}
                y={cy + SPRITE_SIZE / 2}
                textAnchor="middle"
                fill={canAfford ? "#bac2de" : "rgba(186,194,222,0.3)"}
                fontSize={11}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {bp.entityType}
              </text>
              <text
                x={cx}
                y={cy + SPRITE_SIZE / 2 + 14}
                textAnchor="middle"
                fill={canAfford ? "#f9e2af" : "rgba(249,226,175,0.3)"}
                fontSize={10}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {formatGold(bp.cost)}
              </text>
              {isHovered && (
                <foreignObject
                  x={cx - TOOLTIP_W / 2}
                  y={cy - SPRITE_SIZE / 2 - 10 - TOOLTIP_H - 6}
                  width={TOOLTIP_W}
                  height={TOOLTIP_H}
                  style={{ pointerEvents: "none", overflow: "visible" }}
                >
                  <div
                    style={{
                      background: "rgba(12,14,30,0.95)",
                      border: `1px solid ${meta.color}40`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: meta.color,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "system-ui, sans-serif",
                        marginBottom: 2,
                      }}
                    >
                      {meta.label}
                    </div>
                    <div
                      style={{
                        color: "#a6adc8",
                        fontSize: 10,
                        fontFamily: "system-ui, sans-serif",
                        lineHeight: 1.3,
                      }}
                    >
                      {bp.description}
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
    </>
  );
};
