import { type EntityType, ColorPreset } from "./types";
import { Crosshair, Gauge, Flame, Focus, Shield, Snowflake, Link, Bomb, Swords, Waves, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FriendlyConfig } from "./enemyConfig";
import { KEYWORD_COLOR, keyword, num, plain, type TextSegment } from "./ShipChoiceOverlay/textSegments";

export type ShipDescriptionFn = (c: FriendlyConfig, next?: FriendlyConfig) => TextSegment[];

function getDmg(c: FriendlyConfig): number {
  return c.projectileDamage > 0 ? c.projectileDamage : c.laserDamage;
}

export type ShipRole =
  | "sniper"
  | "laser"
  | "dual_shot"
  | "plasma_beam"
  | "pierce_laser"
  | "chill"
  | "plasma"
  | "shooter"
  | "ice_beam"
  | "plasma_single"
  | "chain"
  | "mac_cannon";

export const ROLE_META: Record<ShipRole, { icon: LucideIcon; label: string; color: string }> = {
  sniper: { icon: Target, label: "Sniper", color: "#f38ba8" },
  laser: { icon: Focus, label: "Laser", color: "#cba6f7" },
  dual_shot: { icon: Gauge, label: "Dual Shot", color: "#89b4fa" },
  plasma_beam: { icon: Flame, label: "Plasma Beam", color: "#f38ba8" },
  pierce_laser: { icon: Swords, label: "Pierce Laser", color: "#b4befe" },
  chill: { icon: Snowflake, label: "Chill", color: "#89dceb" },
  plasma: { icon: Flame, label: "Plasma", color: "#fab387" },
  shooter: { icon: Crosshair, label: "Shooter", color: "#94e2d5" },
  ice_beam: { icon: Waves, label: "Ice Beam", color: "#74c7ec" },
  plasma_single: { icon: Bomb, label: "Plasma", color: "#eba0ac" },
  chain: { icon: Link, label: "Chain", color: "#a6e3a1" },
  mac_cannon: { icon: Shield, label: "MAC Cannon", color: "#cdd6f4" },
};

export interface ShipBlueprint {
  entityType: EntityType;
  colorPreset: ColorPreset;
  role: ShipRole;
  description: string;
  descriptionFn: ShipDescriptionFn;
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  {
    entityType: "Spur",
    colorPreset: ColorPreset.Preset1,
    role: "sniper",
    description: "Devastating long-range strikes",
    descriptionFn: (c, next) => [
      plain("Fires a heavy round, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage to a single target."),
    ],
  },
  {
    entityType: "Ember",
    colorPreset: ColorPreset.Preset1,
    role: "shooter",
    description: "Rapid light fire",
    descriptionFn: (c, next) => [
      plain("Fires a light projectile, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage."),
    ],
  },
  {
    entityType: "Corona",
    colorPreset: ColorPreset.Preset1,
    role: "laser",
    description: "Focused energy beam",
    descriptionFn: (c, next) => [
      plain("Fires a focused laser, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage."),
    ],
  },
  {
    entityType: "Pip",
    colorPreset: ColorPreset.Preset1,
    role: "dual_shot",
    description: "Twin-barrel barrage",
    descriptionFn: (c, next) => [
      plain("Fires twin projectiles, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage each."),
    ],
  },
  {
    entityType: "Eagle",
    colorPreset: ColorPreset.Preset1,
    role: "plasma_beam",
    description: "Burning laser beam",
    descriptionFn: (c, next) => [
      plain("Fires a laser, applying "),
      ...num(c.plasmaStacks, next?.plasmaStacks),
      plain(" stacks of "),
      keyword("plasma", KEYWORD_COLOR.plasma),
      plain("."),
    ],
  },
  {
    entityType: "Needle",
    colorPreset: ColorPreset.Preset1,
    role: "pierce_laser",
    description: "Beam that cuts through all",
    descriptionFn: (c, next) => [
      plain("Fires a piercing laser, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage to every enemy in line."),
    ],
  },
  {
    entityType: "Flare",
    colorPreset: ColorPreset.Preset1,
    role: "chill",
    description: "Chilling explosive blast",
    descriptionFn: (c, next) => [
      plain("Fires an explosive blast, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage and applying "),
      ...num(c.chillDurationSeconds, next?.chillDurationSeconds),
      plain(" seconds of "),
      keyword("chill", KEYWORD_COLOR.chill),
      plain(" in an area."),
    ],
  },
  {
    entityType: "Dart",
    colorPreset: ColorPreset.Preset1,
    role: "plasma",
    description: "Plasma explosive blast",
    descriptionFn: (c, next) => [
      plain("Fires a plasma blast, applying "),
      ...num(c.plasmaStacks, next?.plasmaStacks),
      plain(" stacks of "),
      keyword("plasma", KEYWORD_COLOR.plasma),
      plain(" to all enemies in an area."),
    ],
  },
  {
    entityType: "Moth",
    colorPreset: ColorPreset.Preset1,
    role: "shooter",
    description: "Reliable standard fire",
    descriptionFn: (c, next) => [
      plain("Fires a steady projectile, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage."),
    ],
  },
  {
    entityType: "Prism",
    colorPreset: ColorPreset.Preset1,
    role: "ice_beam",
    description: "Chilling piercing beam",
    descriptionFn: (c, next) => [
      plain("Fires a piercing ice beam, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage and applying "),
      ...num(c.chillDurationSeconds, next?.chillDurationSeconds),
      plain(" seconds of "),
      keyword("chill", KEYWORD_COLOR.chill),
      plain("."),
    ],
  },
  {
    entityType: "Hawk",
    colorPreset: ColorPreset.Preset1,
    role: "plasma_single",
    description: "Heavy plasma rounds",
    descriptionFn: (c, next) => [
      plain("Fires a heavy round, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage in an area."),
    ],
  },
  {
    entityType: "Nova",
    colorPreset: ColorPreset.Preset1,
    role: "chain",
    description: "Bouncing chain shots",
    descriptionFn: (c, next) => [
      plain("Fires a bouncing shot that "),
      keyword("chains", KEYWORD_COLOR.chain),
      plain(" to "),
      ...num(c.chainCount, next?.chainCount),
      plain(" enemies, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage each."),
    ],
  },
  {
    entityType: "Lance",
    colorPreset: ColorPreset.Preset1,
    role: "mac_cannon",
    description: "Wide piercing cannon",
    descriptionFn: (c, next) => [
      plain("Fires a massive piercing cannon, dealing "),
      ...num(getDmg(c), next ? getDmg(next) : undefined),
      plain(" damage to every enemy in line."),
    ],
  },
];

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();
for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}

const roleByEntityType = new Map<string, ShipRole>();
for (const bp of SHIP_BLUEPRINTS) {
  roleByEntityType.set(bp.entityType, bp.role);
}

export function getShipRole(entityType: EntityType): ShipRole | null {
  return roleByEntityType.get(entityType) ?? null;
}
