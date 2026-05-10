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

interface StatRow {
  label: string;
  value: string;
  color: string;
}

function damageTypeLabel(t: DamageType): string {
  if (t === DamageType.Physical) return "physical";
  if (t === DamageType.Plasma) return "plasma";
  if (t === DamageType.Ice) return "ice";
  return "";
}

function damageTypeColor(t: DamageType): string {
  if (t === DamageType.Physical) return "#f9e2af";
  if (t === DamageType.Plasma) return "#cc88ff";
  if (t === DamageType.Ice) return "#89dceb";
  return "#f9e2af";
}

function formatDamageValue(amount: number, fireCount: number, type: DamageType): string {
  const typeLabel = damageTypeLabel(type);
  const numberPart = fireCount > 1 ? `${amount} × ${fireCount}` : `${amount}`;
  return typeLabel ? `${numberPart} ${typeLabel}` : numberPart;
}

function getShipStats(config: FriendlyConfig): StatRow[] {
  const rows: StatRow[] = [];

  const damageAmount = config.projectileDamage > 0 ? config.projectileDamage : config.laserDamage;
  if (damageAmount > 0) {
    rows.push({
      label: "Damage",
      value: formatDamageValue(damageAmount, config.fireCount, config.damageType),
      color: damageTypeColor(config.damageType),
    });
  }

  if (config.plasmaStacks > 0) {
    rows.push({
      label: "Plasma",
      value: `${config.plasmaStacks} stacks`,
      color: "#cc88ff",
    });
  }

  if (config.freezeStacks > 0) {
    rows.push({
      label: "Freeze",
      value: `${config.freezeStacks} sec`,
      color: "#89dceb",
    });
  }

  if (config.chainCount > 0) {
    rows.push({
      label: "Chain",
      value: `${config.chainCount} jumps`,
      color: "#a6e3a1",
    });
  }

  if (config.explosionRadius > 0) {
    rows.push({
      label: "Splash",
      value: `${config.explosionRadius} radius`,
      color: "#fab387",
    });
  }

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

const CARD_WIDTH = 240;
const CARD_HEIGHT = 410;

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

interface ChargeDotsProps {
  charges: number;
  accent: string;
}

const ChargeDots = ({ charges, accent }: ChargeDotsProps) => {
  const dots = Array.from({ length: charges }, (_, i) => i);
  return (
    <div
      className="flex flex-wrap gap-1 justify-center px-3"
      style={{ maxWidth: "100%" }}
    >
      {dots.map((i) => (
        <span
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 4px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
            border: "1px solid rgba(0,0,0,0.4)",
          }}
        />
      ))}
    </div>
  );
};

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
  const accent = damageTypeColor(displayConfig.damageType);

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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 24%, ${accent}1f 0%, transparent 55%)`,
        }}
      />

      <CornerHotkey hotkey={hotkey} />

      <div
        className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
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
        className="relative flex items-center justify-center mt-12"
        style={{ height: 110 }}
      >
        <div
          className="absolute"
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          }}
        />
        {preview && (
          <img
            src={preview}
            alt={entityType}
            style={{
              maxWidth: 104,
              maxHeight: 104,
              width: "auto",
              height: "auto",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(0 4px 6px ${accent}66)`,
            }}
          />
        )}
      </div>

      <div className="relative flex flex-col items-center px-5 mt-3">
        <span
          className="text-[#cdd6f4] font-bold tracking-wide"
          style={{ fontSize: 20, fontFamily: "system-ui, sans-serif" }}
        >
          {entityType}
        </span>
        <span
          className="text-[12px] text-[#a6adc8] mt-1.5 text-center leading-snug"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {bp.description}
        </span>
      </div>

      <div
        className="mx-5 my-4"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col gap-2 px-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between text-[12.5px]"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <span className="text-[#a6adc8]">{s.label}</span>
            <span className="font-semibold" style={{ color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex flex-col items-center mt-auto pt-4 pb-5 px-4">
        <span
          className="text-[10px] uppercase tracking-[0.18em] text-[#7f849c] mb-2"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {`${displayConfig.chargesRequired} charges`}
        </span>
        <ChargeDots charges={displayConfig.chargesRequired} accent={accent} />
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
