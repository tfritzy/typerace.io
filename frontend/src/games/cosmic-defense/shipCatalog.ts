import { type EntityType, ColorPreset } from "./types";
import { Crosshair, Gauge, Flame, Zap, Focus, Shield, Snowflake, Link, Bomb, Swords, Sparkles, Waves, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ShipRole =
  | "sniper"
  | "buffer"
  | "laser"
  | "dual_shot"
  | "charge"
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
  buffer: { icon: Sparkles, label: "Buffer", color: "#f9e2af" },
  laser: { icon: Focus, label: "Laser", color: "#cba6f7" },
  dual_shot: { icon: Gauge, label: "Dual Shot", color: "#89b4fa" },
  charge: { icon: Zap, label: "Charge", color: "#f9e2af" },
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
  { entityType: "Dreadnought", colorPreset: ColorPreset.Preset1, role: "sniper", description: "Slow attacker, high damage" },
  { entityType: "Flagship", colorPreset: ColorPreset.Preset1, role: "buffer", description: "All other ships next attack deals extra damage" },
  { entityType: "Prism", colorPreset: ColorPreset.Preset1, role: "laser", description: "Fires a low damage laser beam that deals single target damage" },
  { entityType: "Osprey", colorPreset: ColorPreset.Preset1, role: "dual_shot", description: "Fires projectile from each gun (2x) that does low damage" },
  { entityType: "Pulse", colorPreset: ColorPreset.Preset1, role: "charge", description: "Give all other ships a charge (and more as you level up)" },
  { entityType: "Lance", colorPreset: ColorPreset.Preset1, role: "pierce_laser", description: "Fire a piercing laser beam that hurts all enemies in the way" },
  { entityType: "Titan", colorPreset: ColorPreset.Preset1, role: "freeze", description: "Shoots an explosive projectile that freezes all enemies it hits" },
  { entityType: "Spark", colorPreset: ColorPreset.Preset1, role: "plasma", description: "Shoots explosive projectile that applies plasma to all enemies it hits" },
  { entityType: "Moth", colorPreset: ColorPreset.Preset1, role: "shooter", description: "Shoots a projectile" },
  { entityType: "Bolt", colorPreset: ColorPreset.Preset1, role: "ice_beam", description: "Shoots an ice beam" },
  { entityType: "Corona", colorPreset: ColorPreset.Preset1, role: "plasma_single", description: "Shoots a projectile that applies plasma stacks, and deals decent damage. Single target" },
  { entityType: "Clipper", colorPreset: ColorPreset.Preset1, role: "chain", description: "Shoots projectile that chains to enemies. Number chained increases with level ups" },
  { entityType: "Bastion", colorPreset: ColorPreset.Preset1, role: "mac_cannon", description: "Shoots a mac cannon that pierces all enemies like a laser, but has a larger radius" },
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
