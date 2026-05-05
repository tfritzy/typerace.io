import { type EntityType, ColorPreset } from "./types";
import { Crosshair, Gauge, Flame, Focus, Shield, Snowflake, Link, Bomb, Swords, Waves, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ShipRole =
  | "sniper"
  | "laser"
  | "dual_shot"
  | "plasma_beam"
  | "pierce_laser"
  | "freeze"
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
  freeze: { icon: Snowflake, label: "Freeze", color: "#89dceb" },
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
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Spur", colorPreset: ColorPreset.Preset1, role: "sniper", description: "Devastating long-range strikes" },
  { entityType: "Ember", colorPreset: ColorPreset.Preset1, role: "shooter", description: "Rapid light fire" },
  { entityType: "Corona", colorPreset: ColorPreset.Preset1, role: "laser", description: "Focused energy beam" },
  { entityType: "Pip", colorPreset: ColorPreset.Preset1, role: "dual_shot", description: "Twin-barrel barrage" },
  { entityType: "Eagle", colorPreset: ColorPreset.Preset1, role: "plasma_beam", description: "Burning laser beam" },
  { entityType: "Needle", colorPreset: ColorPreset.Preset1, role: "pierce_laser", description: "Beam that cuts through all" },
  { entityType: "Flare", colorPreset: ColorPreset.Preset1, role: "freeze", description: "Freezing explosive blast" },
  { entityType: "Dart", colorPreset: ColorPreset.Preset1, role: "plasma", description: "Plasma explosive blast" },
  { entityType: "Moth", colorPreset: ColorPreset.Preset1, role: "shooter", description: "Reliable standard fire" },
  { entityType: "Prism", colorPreset: ColorPreset.Preset1, role: "ice_beam", description: "Freezing piercing beam" },
  { entityType: "Hawk", colorPreset: ColorPreset.Preset1, role: "plasma_single", description: "Heavy plasma rounds" },
  { entityType: "Nova", colorPreset: ColorPreset.Preset1, role: "chain", description: "Bouncing chain shots" },
  { entityType: "Lance", colorPreset: ColorPreset.Preset1, role: "mac_cannon", description: "Wide piercing cannon" },
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
