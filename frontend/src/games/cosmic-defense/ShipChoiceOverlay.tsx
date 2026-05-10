import { useMemo, useEffect, useCallback, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { SHIP_BLUEPRINTS } from "./shipCatalog";
import { FRIENDLY_CONFIG_MAP, getScaledConfig, type FriendlyConfig } from "./enemyConfig";
import { type EntityType } from "./types";
import type { PlacementSlot } from "./PlacementPoints";

const CONSISTENT_DAMAGE_ROLES = new Set([
  "sniper", "laser", "dual_shot", "pierce_laser", "shooter", "chain", "mac_cannon",
]);

interface ShipChoiceOverlayProps {
  onSelect: (entityType: EntityType) => void;
  shipPreviews: Map<EntityType, string>;
  slots: PlacementSlot[];
  level: number;
}

const KEYWORD_COLOR = {
  plasma: "#d65c9f",
  freeze: "#7dd3fc",
  chain: "#86efac",
  number: "#fbbf24",
} as const;

const ACCENT_COLOR = "#fbbf24";

interface TextSegment {
  text?: string;
  color?: string;
  bold?: boolean;
  node?: ReactNode;
}

function num(current: number, next?: number): TextSegment[] {
  if (next === undefined || next === current) {
    return [{ text: `${current}`, color: KEYWORD_COLOR.number, bold: true }];
  }
  return [
    {
      node: (
        <span style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
          <span
            style={{
              color: KEYWORD_COLOR.number,
              fontWeight: 700,
              textShadow: `0 0 10px ${KEYWORD_COLOR.number}66`,
            }}
          >
            {current}
          </span>
          <ChevronRight
            size={10}
            strokeWidth={2.5}
            style={{ color: "#94a3b8", margin: "0 1px", flexShrink: 0 }}
          />
          <span
            style={{
              color: KEYWORD_COLOR.number,
              fontWeight: 700,
              textShadow: `0 0 10px ${KEYWORD_COLOR.number}66`,
            }}
          >
            {next}
          </span>
        </span>
      ),
    },
  ];
}

function keyword(text: string, color: string): TextSegment {
  return { text, color, bold: true };
}

function plain(text: string): TextSegment {
  return { text };
}

function getDmg(c: FriendlyConfig): number {
  return c.projectileDamage > 0 ? c.projectileDamage : c.laserDamage;
}

function getCardText(
  entityType: EntityType,
  c: FriendlyConfig,
  next?: FriendlyConfig
): TextSegment[] {
  const dmg = getDmg(c);
  const nDmg = next ? getDmg(next) : undefined;
  switch (entityType) {
    case "Spur":
      return [plain("Fires a heavy round, dealing "), ...num(dmg, nDmg), plain(" damage to a single target.")];
    case "Ember":
      return [plain("Fires a light projectile, dealing "), ...num(dmg, nDmg), plain(" damage.")];
    case "Corona":
      return [plain("Fires a focused laser, dealing "), ...num(dmg, nDmg), plain(" damage.")];
    case "Pip":
      return [plain("Fires twin projectiles, dealing "), ...num(dmg, nDmg), plain(" damage each.")];
    case "Eagle":
      return [
        plain("Fires a laser, applying "),
        ...num(c.plasmaStacks, next?.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain("."),
      ];
    case "Needle":
      return [
        plain("Fires a piercing laser, dealing "),
        ...num(dmg, nDmg),
        plain(" damage to every enemy in line."),
      ];
    case "Flare":
      return [
        plain("Fires an explosive blast, dealing "),
        ...num(dmg, nDmg),
        plain(" damage and applying "),
        ...num(c.freezeStacks, next?.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain(" in an area."),
      ];
    case "Dart":
      return [
        plain("Fires a plasma blast, applying "),
        ...num(c.plasmaStacks, next?.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain(" to all enemies in an area."),
      ];
    case "Moth":
      return [plain("Fires a steady projectile, dealing "), ...num(dmg, nDmg), plain(" damage.")];
    case "Prism":
      return [
        plain("Fires a piercing ice beam, dealing "),
        ...num(dmg, nDmg),
        plain(" damage and applying "),
        ...num(c.freezeStacks, next?.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain("."),
      ];
    case "Hawk":
      return [plain("Fires a heavy round, dealing "), ...num(dmg, nDmg), plain(" damage in an area.")];
    case "Nova":
      return [
        plain("Fires a bouncing shot that "),
        keyword("chains", KEYWORD_COLOR.chain),
        plain(" to "),
        ...num(c.chainCount, next?.chainCount),
        plain(" enemies, dealing "),
        ...num(dmg, nDmg),
        plain(" damage each."),
      ];
    case "Lance":
      return [
        plain("Fires a massive piercing cannon, dealing "),
        ...num(dmg, nDmg),
        plain(" damage to every enemy in line."),
      ];
    default:
      return [plain("")];
  }
}

function generateChoices(slots: PlacementSlot[]): EntityType[] {
  const existing = new Set(
    slots.filter((s) => s.occupant).map((s) => s.occupant!)
  );
  const hasEmptySlot = slots.some((s) => !s.occupant);

  let pool: EntityType[];
  if (hasEmptySlot) {
    const hasAnyShip = existing.size > 0;
    if (hasAnyShip) {
      pool = SHIP_BLUEPRINTS.map((bp) => bp.entityType);
    } else {
      pool = SHIP_BLUEPRINTS
        .filter((bp) => CONSISTENT_DAMAGE_ROLES.has(bp.role))
        .map((bp) => bp.entityType);
    }
  } else {
    pool = [...existing];
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(3, pool.length));
}

const CARD_WIDTH = 180;
const CARD_HEIGHT = 270;

interface ShipCardProps {
  entityType: EntityType;
  hotkey: number;
  preview: string | undefined;
  isUpgrade: boolean;
  currentLevel: number;
  onSelect: (entityType: EntityType) => void;
}

const ShipCard = ({
  entityType,
  hotkey,
  preview,
  isUpgrade,
  currentLevel,
  onSelect,
}: ShipCardProps) => {
  const baseConfig = FRIENDLY_CONFIG_MAP.get(entityType)!;
  const currentConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel)
    : baseConfig;
  const displayConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel + 1)
    : baseConfig;

  const accent = ACCENT_COLOR;
  const cardText = isUpgrade
    ? getCardText(entityType, currentConfig, displayConfig)
    : getCardText(entityType, displayConfig);
  const charges = displayConfig.chargesRequired;
  const truncated = charges > 10;
  return (
    <button
      onClick={() => onSelect(entityType)}
      className="relative flex flex-col rounded-xl cursor-pointer transition-all text-left overflow-hidden"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background:
          "linear-gradient(160deg, #20223f 0%, #161731 50%, #0a0c1c 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 20px 44px -18px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 28px 52px -16px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 20px 44px -18px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
    >
      <div className="relative flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <span
          className="font-bold tracking-wide truncate"
          style={{
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            color: "#f1f5f9",
            textShadow: `0 0 10px ${accent}55`,
          }}
        >
          {entityType}
        </span>
        <div className="flex gap-1 ml-2 shrink-0 items-center">
          {truncated ? (
            <>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accent}cc 60%, ${accent}55 100%)`,
                  boxShadow: `0 0 5px ${accent}cc, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: accent,
                  textShadow: `0 0 8px ${accent}66`,
                  lineHeight: 1,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                }}
              >
                ×{charges}
              </span>
            </>
          ) : (
            Array.from({ length: charges }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accent}cc 60%, ${accent}55 100%)`,
                  boxShadow: `0 0 5px ${accent}cc, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  border: "1px solid rgba(0,0,0,0.5)",
                }}
              />
            ))
          )}
        </div>
      </div>

      <div
        className="relative mx-2 mt-1 rounded-md overflow-hidden flex items-center justify-center"
        style={{
          height: 100,
          background: `radial-gradient(ellipse at 50% 50%, ${accent}1a 0%, ${accent}08 40%, rgba(0,0,0,0.55) 85%)`,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            `inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 12px -10px ${accent}33`,
        }}
      >
        {preview && (
          <img
            src={preview}
            alt={entityType}
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.55)) drop-shadow(0 0 3px ${accent}55)`,
            }}
          />
        )}
      </div>

      <div
        className="flex items-center justify-between mx-2 mt-2 px-2"
        style={{
          height: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(0,0,0,0.55)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: isUpgrade ? "#fbbf24" : "#86efac",
            textShadow: `0 0 6px ${isUpgrade ? "#fbbf24" : "#86efac"}55`,
          }}
        >
          {isUpgrade ? "Upgrade" : "New Ship"}
        </span>
        <span
          style={{
            color: "#cbd5e1",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            letterSpacing: 0,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {isUpgrade ? (
            <>
              Lv {currentLevel}
              <ChevronRight
                size={9}
                strokeWidth={2.5}
                style={{ color: "#94a3b8", margin: "0 1px" }}
              />
              {currentLevel + 1}
            </>
          ) : (
            "Lv 1"
          )}
        </span>
      </div>

      <div
        className="relative px-3 pt-2 pb-2 leading-snug flex-1"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 11,
          color: "#cbd5e1",
        }}
      >
        {cardText.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color ?? "#cbd5e1",
              fontWeight: seg.bold ? 700 : 400,
              textShadow: seg.color && seg.bold ? `0 0 10px ${seg.color}66` : undefined,
            }}
          >
            {seg.node ?? seg.text}
          </span>
        ))}
      </div>
      <div
        className="flex items-center justify-center pb-2 pt-1 select-none"
        style={{
          color: "#94a3b8",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {hotkey}
      </div>
    </button>
  );
};

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < choices.length) {
        onSelect(choices[idx]);
      }
    },
    [choices, onSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div
        className="absolute inset-0 z-40 animate-fadeIn"
        style={{ background: "rgba(0,0,0,0.65)" }}
      />
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fadeIn"
        style={{ pointerEvents: "auto" }}
      >
        <div
          className="text-[#cdd6f4] text-[24px] font-bold tracking-wide"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {`Level ${level}`}
        </div>
        <div
          className="text-[#a6adc8] text-[14px] mt-1 mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Choose a ship
        </div>
        <div className="flex gap-3">
          {choices.map((entityType, i) => {
            const existingSlot = existing.get(entityType);
            return (
              <ShipCard
                key={entityType}
                entityType={entityType}
                hotkey={i + 1}
                preview={shipPreviews.get(entityType)}
                isUpgrade={!!existingSlot}
                currentLevel={existingSlot?.level ?? 0}
                onSelect={onSelect}
              />
            );
          })}
        </div>
        <div
          className="flex items-center gap-2 mt-6 text-[12px] text-[#7f849c]"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <span>Press</span>
          {choices.map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center font-bold text-[#cdd6f4]"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
              }}
            >
              {i + 1}
            </span>
          ))}
          <span>or click a card to choose</span>
        </div>
      </div>
    </>
  );
};
