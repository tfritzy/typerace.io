import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
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
  const pool = allPlaced ? [...existing] : all;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(3, shuffled.length));
}

const CARD_W = 160;
const CARD_GAP = 20;

export const ShipChoiceOverlay = ({
  onSelect,
  shipPreviews,
  slots,
  level,
}: ShipChoiceOverlayProps) => {
  const choices = generateChoices(slots);
  const existing = new Map<string, PlacementSlot>();
  for (const s of slots) {
    if (s.occupant) existing.set(s.occupant, s);
  }
  const totalW = choices.length * CARD_W + (choices.length - 1) * CARD_GAP;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const centerY = CANVAS_HEIGHT / 2;

  return (
    <>
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)" }}
      />
      <svg
        className="absolute inset-0 z-50 w-full h-full"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <text
          x={CANVAS_WIDTH / 2}
          y={centerY - 140}
          textAnchor="middle"
          fill="#cdd6f4"
          fontSize={22}
          fontWeight={600}
          fontFamily="system-ui, sans-serif"
        >
          {`Level ${level}`}
        </text>
        <text
          x={CANVAS_WIDTH / 2}
          y={centerY - 110}
          textAnchor="middle"
          fill="#a6adc8"
          fontSize={14}
          fontFamily="system-ui, sans-serif"
        >
          Choose a ship
        </text>

        {choices.map((entityType, i) => {
          const bp = SHIP_BLUEPRINTS.find((b) => b.entityType === entityType)!;
          const meta = ROLE_META[bp.role];
          const preview = shipPreviews.get(entityType);
          const existingSlot = existing.get(entityType);
          const isUpgrade = !!existingSlot;
          const currentLevel = existingSlot?.level ?? 0;
          const cardX = startX + i * (CARD_W + CARD_GAP);
          const cardY = centerY - 70;
          const cardH = 180;
          const midX = cardX + CARD_W / 2;

          return (
            <g key={entityType} style={{ cursor: "pointer" }}>
              <rect
                x={cardX}
                y={cardY}
                width={CARD_W}
                height={cardH}
                rx={8}
                fill="rgba(12,14,30,0.95)"
                stroke={`${meta.color}40`}
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(entityType)}
              />
              <rect
                x={cardX}
                y={cardY}
                width={CARD_W}
                height={cardH}
                rx={8}
                fill="transparent"
                stroke="transparent"
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(entityType)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.previousElementSibling;
                  if (rect) {
                    rect.setAttribute("stroke", `${meta.color}80`);
                    rect.setAttribute("fill", "rgba(20,22,44,0.95)");
                  }
                }}
                onMouseLeave={(e) => {
                  const rect = e.currentTarget.previousElementSibling;
                  if (rect) {
                    rect.setAttribute("stroke", `${meta.color}40`);
                    rect.setAttribute("fill", "rgba(12,14,30,0.95)");
                  }
                }}
              />
              {preview && (
                <image
                  href={preview}
                  x={midX - 24}
                  y={cardY + 20}
                  width={48}
                  height={48}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ pointerEvents: "none", imageRendering: "pixelated" }}
                />
              )}
              <text
                x={midX}
                y={cardY + 85}
                textAnchor="middle"
                fill="#cdd6f4"
                fontSize={14}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {entityType}
              </text>
              <text
                x={midX}
                y={cardY + 105}
                textAnchor="middle"
                fill={meta.color}
                fontSize={11}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {meta.label}
              </text>
              <text
                x={midX}
                y={cardY + 130}
                textAnchor="middle"
                fill={isUpgrade ? "#f9e2af" : "#a6e3a1"}
                fontSize={12}
                fontWeight={500}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {isUpgrade
                  ? `Lv ${currentLevel} → ${currentLevel + 1}`
                  : "NEW"}
              </text>
              <text
                x={midX}
                y={cardY + 155}
                textAnchor="middle"
                fill="#585b70"
                fontSize={10}
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {bp.description}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
};
