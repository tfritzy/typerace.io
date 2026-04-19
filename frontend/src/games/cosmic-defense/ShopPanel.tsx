import { useState, useEffect } from "react";
import { SHIP_BLUEPRINTS, ROLE_META } from "./shipCatalog";
import { formatGold, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { EntityType } from "./types";
import type { PlacementSlot } from "./PlacementPoints";

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
  gold: number;
  slot: PlacementSlot;
}

const COL_SPACING = 130;
const ROW_SPACING = 110;
const HEX_HALF_W = COL_SPACING / 2;
const HEX_VERT = (ROW_SPACING * 2) / 3;
const HEX_HALF_VERT = HEX_VERT / 2;

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

const NEIGHBOR_OFFSETS = [
  { x: 0, y: 0 },
  { x: HEX_HALF_W, y: -ROW_SPACING },
  { x: COL_SPACING, y: 0 },
  { x: HEX_HALF_W, y: ROW_SPACING },
  { x: -HEX_HALF_W, y: ROW_SPACING },
  { x: -COL_SPACING, y: 0 },
  { x: -HEX_HALF_W, y: -ROW_SPACING },
];

const ANIM_DURATION = 200;
const ANIM_STAGGER = 30;
const ANIM_TOTAL = ANIM_DURATION + 6 * ANIM_STAGGER;
const SPRITE_SIZE = 34;

function easeOutBack(t: number): number {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

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
      if (ms < ANIM_TOTAL) animId = requestAnimationFrame(tick);
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
          const delay = isCenter ? 0 : (i - 1) * ANIM_STAGGER;
          const t = isCenter
            ? 1
            : Math.max(0, Math.min(1, (elapsed - delay) / ANIM_DURATION));
          const progress = isCenter ? 1 : easeOutBack(t);
          const opacity = isCenter ? 1 : Math.min(1, t * 3);
          const cx = slot.x + offset.x * progress;
          const cy = slot.y + offset.y * progress;
          const isHovered = hoveredIndex === i;
          const canAfford = gold >= bp.cost;
          const meta = ROLE_META[bp.role];
          const preview = shipPreviews.get(bp.entityType);

          return (
            <g key={bp.entityType} opacity={opacity}>
              <polygon
                points={hexPoints(cx, cy)}
                fill={
                  !canAfford
                    ? "rgba(12,14,30,0.8)"
                    : isHovered
                      ? "rgba(12,14,30,0.6)"
                      : "rgba(12,14,30,0.92)"
                }
                stroke={
                  !canAfford
                    ? "rgba(120,140,200,0.08)"
                    : isHovered
                      ? meta.color
                      : "rgba(120,140,200,0.3)"
                }
                strokeWidth={isHovered && canAfford ? 1.5 : 1}
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
                  y={cy - SPRITE_SIZE / 2 - 8}
                  width={SPRITE_SIZE}
                  height={SPRITE_SIZE}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ pointerEvents: "none", imageRendering: "pixelated" }}
                />
              )}
              <text
                x={cx}
                y={cy + 18}
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
                y={cy + 32}
                textAnchor="middle"
                fill={canAfford ? "#f9e2af" : "rgba(249,226,175,0.3)"}
                fontSize={10}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {formatGold(bp.cost)}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
};
