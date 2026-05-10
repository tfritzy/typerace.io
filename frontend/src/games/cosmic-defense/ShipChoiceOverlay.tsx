import { useMemo, useEffect, useCallback } from "react";
import { SHIP_BLUEPRINTS } from "./shipCatalog";
import { FRIENDLY_CONFIG_MAP, getScaledConfig, type FriendlyConfig } from "./enemyConfig";
import { DamageType, type EntityType } from "./types";
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
  plasma: "#c4528a",
  freeze: "#89dceb",
  chain: "#a6e3a1",
  number: "#f9e2af",
} as const;

const ACCENT_COLOR = "#f9e2af";

function damageTypeAccent(t: DamageType): string {
  if (t === DamageType.Plasma) return KEYWORD_COLOR.plasma;
  if (t === DamageType.Ice) return KEYWORD_COLOR.freeze;
  return ACCENT_COLOR;
}

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
      return [plain("Charges a heavy round, dealing "), num(dmg), plain(" damage to a single target.")];
    case "Ember":
      return [plain("Fires light projectiles dealing "), num(dmg), plain(" damage.")];
    case "Corona":
      return [plain("Sustained laser beam dealing "), num(dmg), plain(" damage per second.")];
    case "Pip":
      return [plain("Fires twin projectiles dealing "), num(dmg), plain(" damage each.")];
    case "Eagle":
      return [
        plain("Continuous laser that applies "),
        num(c.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain("."),
      ];
    case "Needle":
      return [
        plain("Piercing laser that hits every enemy in line, dealing "),
        num(dmg),
        plain(" damage per second."),
      ];
    case "Flare":
      return [
        plain("Explosive blast dealing "),
        num(dmg),
        plain(" damage and applying "),
        num(c.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain(" in an area."),
      ];
    case "Dart":
      return [
        plain("Plasma blast applying "),
        num(c.plasmaStacks),
        plain(" stacks of "),
        keyword("plasma", KEYWORD_COLOR.plasma),
        plain(" to all enemies in an area."),
      ];
    case "Moth":
      return [plain("Steady projectile dealing "), num(dmg), plain(" damage.")];
    case "Prism":
      return [
        plain("Piercing ice beam dealing "),
        num(dmg),
        plain(" damage and applying "),
        num(c.freezeStacks),
        plain(" stacks of "),
        keyword("freeze", KEYWORD_COLOR.freeze),
        plain("."),
      ];
    case "Hawk":
      return [plain("Heavy round dealing "), num(dmg), plain(" damage in an area.")];
    case "Nova":
      return [
        plain("Bouncing shot that "),
        keyword("chains", KEYWORD_COLOR.chain),
        plain(" to "),
        num(c.chainCount),
        plain(" enemies, dealing "),
        num(dmg),
        plain(" damage each."),
      ];
    case "Lance":
      return [
        plain("Massive piercing cannon dealing "),
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

const CARD_WIDTH = 240;
const CARD_HEIGHT = 360;

interface CornerHotkeyProps {
  hotkey: number;
}

const CornerHotkey = ({ hotkey }: CornerHotkeyProps) => (
  <div
    className="absolute flex items-center justify-center select-none pointer-events-none rounded-md"
    style={{
      top: 10,
      left: 10,
      width: 28,
      height: 28,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 1px 0 rgba(0,0,0,0.4), 0 0 0 2px rgba(0,0,0,0.25)",
      color: "#cdd6f4",
      fontFamily: "system-ui, sans-serif",
      fontSize: 14,
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

  const accent = damageTypeAccent(displayConfig.damageType);
  const cardText = getCardText(entityType, displayConfig);

  return (
    <button
      onClick={() => onSelect(entityType)}
      className="relative flex flex-col rounded-xl cursor-pointer transition-all text-left overflow-hidden"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background:
          "linear-gradient(165deg, #1e1f3a 0%, #14152a 55%, #0c0e1c 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 18px 40px -18px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.04) inset",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 24px 48px -16px rgba(0,0,0,0.9), 0 0 0 1px ${accent}55, 0 0 24px -4px ${accent}55, 0 2px 0 rgba(255,255,255,0.04) inset`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 18px 40px -18px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.04) inset";
      }}
    >
      <CornerHotkey hotkey={hotkey} />

      <div
        className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider z-10"
        style={
          isUpgrade
            ? {
                background: "rgba(249,226,175,0.15)",
                color: "#f9e2af",
                border: "1px solid rgba(249,226,175,0.35)",
              }
            : {
                background: "rgba(166,227,161,0.15)",
                color: "#a6e3a1",
                border: "1px solid rgba(166,227,161,0.35)",
              }
        }
      >
        {isUpgrade ? `LV ${currentLevel} → ${currentLevel + 1}` : "NEW"}
      </div>

      <div
        className="relative mx-3 mt-10 rounded-md overflow-hidden flex items-center justify-center"
        style={{
          height: 140,
          background: `radial-gradient(ellipse at 50% 45%, ${accent}22 0%, rgba(0,0,0,0.4) 70%)`,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      >
        {preview && (
          <img
            src={preview}
            alt={entityType}
            style={{
              maxWidth: 110,
              maxHeight: 110,
              width: "auto",
              height: "auto",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(0 4px 8px ${accent}88)`,
            }}
          />
        )}
      </div>

      <div className="relative flex items-center justify-between px-3 mt-2">
        <span
          className="text-[#cdd6f4] font-bold tracking-wide truncate"
          style={{ fontSize: 17, fontFamily: "system-ui, sans-serif" }}
        >
          {entityType}
        </span>
        <div className="flex gap-1 ml-2 shrink-0">
          {Array.from({ length: displayConfig.chargesRequired }, (_, i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 4px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
                border: "1px solid rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="mx-3 mt-2"
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${accent}55 50%, transparent 100%)`,
        }}
      />

      <div
        className="relative px-3 pt-2.5 pb-3 text-[#cdd6f4] leading-snug"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        {cardText.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color ?? "#cdd6f4",
              fontWeight: seg.bold ? 700 : 400,
              textShadow: seg.color && seg.bold ? `0 0 8px ${seg.color}55` : undefined,
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
          className="text-[#a6adc8] text-[14px] mt-1 mb-2"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Choose a ship
        </div>
        <div
          className="flex items-center gap-2 mb-6 text-[12px] text-[#7f849c]"
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
        <div className="flex gap-5">
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
      </div>
    </>
  );
};
