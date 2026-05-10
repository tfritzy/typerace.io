import { useMemo, useEffect, useCallback } from "react";
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
  text: string;
  color?: string;
  bold?: boolean;
}

function num(n: number | string): TextSegment {
  return { text: `${n}`, color: KEYWORD_COLOR.number, bold: true };
}

function keyword(text: string, color: string): TextSegment {
  return { text, color, bold: true };
}

function plain(text: string): TextSegment {
  return { text };
}

function getCardText(entityType: EntityType, c: FriendlyConfig): TextSegment[] {
  const dmg = c.projectileDamage > 0 ? c.projectileDamage : c.laserDamage;
  switch (entityType) {
    case "Spur":
      return [plain("Fires a heavy round, dealing "), num(dmg), plain(" damage to a single target.")];
    case "Ember":
      return [plain("Fires a light projectile, dealing "), num(dmg), plain(" damage.")];
    case "Corona":
      return [plain("Fires a focused laser, dealing "), num(dmg), plain(" damage.")];
    case "Pip":
      return [plain("Fires twin projectiles, dealing "), num(dmg), plain(" damage each.")];
    case "Eagle":
      return [
        plain("Fires a laser, applying "),
        num(c.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain("."),
      ];
    case "Needle":
      return [
        plain("Fires a piercing laser, dealing "),
        num(dmg),
        plain(" damage to every enemy in line."),
      ];
    case "Flare":
      return [
        plain("Fires an explosive blast, dealing "),
        num(dmg),
        plain(" damage and applying "),
        num(c.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain(" in an area."),
      ];
    case "Dart":
      return [
        plain("Fires a plasma blast, applying "),
        num(c.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain(" to all enemies in an area."),
      ];
    case "Moth":
      return [plain("Fires a steady projectile, dealing "), num(dmg), plain(" damage.")];
    case "Prism":
      return [
        plain("Fires a piercing ice beam, dealing "),
        num(dmg),
        plain(" damage and applying "),
        num(c.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain("."),
      ];
    case "Hawk":
      return [plain("Fires a heavy round, dealing "), num(dmg), plain(" damage in an area.")];
    case "Nova":
      return [
        plain("Fires a bouncing shot that "),
        keyword("chains", KEYWORD_COLOR.chain),
        plain(" to "),
        num(c.chainCount),
        plain(" enemies, dealing "),
        num(dmg),
        plain(" damage each."),
      ];
    case "Lance":
      return [
        plain("Fires a massive piercing cannon, dealing "),
        num(dmg),
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

interface CornerHotkeyProps {
  hotkey: number;
}

const CornerHotkey = ({ hotkey }: CornerHotkeyProps) => (
  <div
    className="absolute flex items-center justify-center select-none pointer-events-none rounded-md z-10"
    style={{
      top: 8,
      left: 8,
      width: 22,
      height: 22,
      background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
      color: "#e2e8f0",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontSize: 11,
      fontWeight: 700,
    }}
  >
    {hotkey}
  </div>
);

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
  const displayConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel + 1)
    : baseConfig;

  const accent = ACCENT_COLOR;
  const cardText = getCardText(entityType, displayConfig);

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
      <CornerHotkey hotkey={hotkey} />

      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider z-10"
        style={
          isUpgrade
            ? {
                background: "linear-gradient(180deg, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0.10) 100%)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.45)",
                boxShadow: "0 0 10px rgba(251,191,36,0.25)",
              }
            : {
                background: "linear-gradient(180deg, rgba(134,239,172,0.22) 0%, rgba(134,239,172,0.10) 100%)",
                color: "#86efac",
                border: "1px solid rgba(134,239,172,0.45)",
                boxShadow: "0 0 10px rgba(134,239,172,0.25)",
              }
        }
      >
        {isUpgrade ? `LV ${currentLevel} → ${currentLevel + 1}` : "NEW"}
      </div>

      <div
        className="relative mx-2 mt-8 rounded-md overflow-hidden flex items-center justify-center"
        style={{
          height: 100,
          background: `radial-gradient(ellipse at 50% 50%, ${accent}33 0%, ${accent}10 35%, rgba(0,0,0,0.55) 80%)`,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            `inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px -8px ${accent}66`,
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
              filter: `drop-shadow(0 4px 10px ${accent}aa) drop-shadow(0 0 4px ${accent}66)`,
            }}
          />
        )}
      </div>

      <div
        className="relative flex items-center justify-between px-2 mt-2 py-1 mx-2 rounded"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.25) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
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
        <div className="flex gap-1 ml-2 shrink-0">
          {Array.from({ length: displayConfig.chargesRequired }, (_, i) => (
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
          ))}
        </div>
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
            {seg.text}
          </span>
        ))}
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
