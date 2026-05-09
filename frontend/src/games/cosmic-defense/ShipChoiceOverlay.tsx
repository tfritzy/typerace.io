import { useMemo, useEffect, useCallback } from "react";
import {
  Zap,
  Heart,
  Flame,
  Snowflake,
  Link as LinkIcon,
  Bomb,
  Keyboard,
  type LucideIcon,
} from "lucide-react";
import { SHIP_BLUEPRINTS, ROLE_META } from "./shipCatalog";
import { FRIENDLY_CONFIG_MAP, getScaledConfig, type FriendlyConfig } from "./enemyConfig";
import { DamageType, FireMode, type EntityType } from "./types";
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

interface StatRow {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  [DamageType.Physical]: "physical",
  [DamageType.Laser]: "laser",
  [DamageType.Plasma]: "plasma",
  [DamageType.Ice]: "ice",
};

function formatDamage(config: FriendlyConfig): string {
  if (config.fireMode === FireMode.Laser) {
    if (config.laserDamage > 0) {
      const typeLabel = DAMAGE_TYPE_LABEL[config.damageType] ?? "";
      return `${config.laserDamage} ${typeLabel}/tick`.trim();
    }
    return "—";
  }
  const typeLabel = DAMAGE_TYPE_LABEL[config.damageType] ?? "";
  if (config.projectileDamage <= 0) return "—";
  if (config.fireCount > 1) {
    return `${config.projectileDamage} × ${config.fireCount} ${typeLabel}`.trim();
  }
  return `${config.projectileDamage} ${typeLabel}`.trim();
}

function getShipStats(config: FriendlyConfig): StatRow[] {
  const rows: StatRow[] = [];

  const damageStr = formatDamage(config);
  if (damageStr !== "—") {
    rows.push({
      icon: Zap,
      label: "Damage",
      value: damageStr,
      color: "#f9e2af",
    });
  }

  rows.push({
    icon: Keyboard,
    label: "Words to fire",
    value: `${config.chargesRequired}`,
    color: "#cdd6f4",
  });

  if (config.plasmaStacks > 0) {
    rows.push({
      icon: Flame,
      label: "Plasma",
      value: `${config.plasmaStacks} stacks`,
      color: "#cc88ff",
    });
  }

  if (config.freezeStacks > 0) {
    const seconds = config.freezeStacks;
    rows.push({
      icon: Snowflake,
      label: "Freeze",
      value: `${seconds} sec`,
      color: "#89dceb",
    });
  }

  if (config.chainCount > 0) {
    rows.push({
      icon: LinkIcon,
      label: "Chain",
      value: `${config.chainCount} jumps`,
      color: "#a6e3a1",
    });
  }

  if (config.explosionRadius > 0) {
    rows.push({
      icon: Bomb,
      label: "Splash",
      value: `${config.explosionRadius} radius`,
      color: "#fab387",
    });
  }

  rows.push({
    icon: Heart,
    label: "Health",
    value: `${config.health}`,
    color: "#f38ba8",
  });

  return rows;
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

const CARD_WIDTH = 230;
const CARD_HEIGHT = 360;

interface CornerRankProps {
  hotkey: number;
  flipped?: boolean;
}

const CornerRank = ({ hotkey, flipped }: CornerRankProps) => (
  <div
    className="absolute flex items-center justify-center select-none pointer-events-none rounded-md"
    style={{
      top: flipped ? "auto" : 8,
      bottom: flipped ? 8 : "auto",
      left: flipped ? "auto" : 8,
      right: flipped ? 8 : "auto",
      width: 24,
      height: 24,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 1px 0 rgba(0,0,0,0.4)",
      color: "#cdd6f4",
      fontFamily: "system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "-0.02em",
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
  const bp = SHIP_BLUEPRINTS.find((b) => b.entityType === entityType)!;
  const baseConfig = FRIENDLY_CONFIG_MAP.get(entityType)!;
  const displayConfig = isUpgrade
    ? getScaledConfig(baseConfig, currentLevel + 1)
    : baseConfig;

  const stats = getShipStats(displayConfig);
  const role = ROLE_META[bp.role];
  const RoleIcon = role.icon;

  return (
    <button
      onClick={() => onSelect(entityType)}
      className="relative flex flex-col rounded-xl cursor-pointer transition-all text-left overflow-hidden group"
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
        e.currentTarget.style.borderColor = role.color;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 24px 48px -16px rgba(0,0,0,0.9), 0 0 0 1px ${role.color}55, 0 0 24px -4px ${role.color}55, 0 2px 0 rgba(255,255,255,0.04) inset`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 18px 40px -18px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.04) inset";
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 22%, ${role.color}22 0%, transparent 55%)`,
        }}
      />

      <CornerRank hotkey={hotkey} />
      <CornerRank hotkey={hotkey} flipped />

      <div
        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
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
        className="relative flex items-center justify-center mt-9 mb-1"
        style={{ height: 92 }}
      >
        <div
          className="absolute"
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${role.color}33 0%, transparent 70%)`,
          }}
        />
        {preview && (
          <img
            src={preview}
            alt={entityType}
            style={{
              width: 72,
              height: 72,
              imageRendering: "pixelated",
              filter: `drop-shadow(0 4px 6px ${role.color}66)`,
            }}
          />
        )}
      </div>

      <div className="relative flex flex-col items-center px-3">
        <span
          className="text-[#cdd6f4] font-bold tracking-wide"
          style={{ fontSize: 18, fontFamily: "system-ui, sans-serif" }}
        >
          {entityType}
        </span>
        <span
          className="flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{
            background: `${role.color}1f`,
            color: role.color,
            border: `1px solid ${role.color}55`,
          }}
        >
          <RoleIcon size={11} strokeWidth={2.5} />
          {role.label}
        </span>
      </div>

      <div
        className="mx-4 my-3"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col gap-1.5 px-4">
        {stats.map((s) => {
          const StatIcon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center justify-between text-[12px]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <span className="flex items-center gap-1.5 text-[#a6adc8]">
                <StatIcon size={12} strokeWidth={2.25} color={s.color} />
                {s.label}
              </span>
              <span className="font-semibold" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="relative mt-auto px-9 pb-4 pt-3 text-[11px] italic text-center text-[#7f849c]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {bp.description}
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
