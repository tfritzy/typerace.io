import { type EntityType, ColorPreset } from "./types";
import { UPGRADE_PATHS } from "./upgradePaths";
import { Crosshair, Gauge, Heart, Shield, Flame, Zap, Focus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ShipRole = "shooter" | "rapid_fire" | "healer" | "shield" | "plasma" | "charge" | "laser";

export const ROLE_META: Record<ShipRole, { icon: LucideIcon; label: string; color: string }> = {
  shooter: { icon: Crosshair, label: "Shooter", color: "#94e2d5" },
  rapid_fire: { icon: Gauge, label: "Rapid Fire", color: "#89b4fa" },
  healer: { icon: Heart, label: "Healer", color: "#a6e3a1" },
  shield: { icon: Shield, label: "Shield", color: "#74c7ec" },
  plasma: { icon: Flame, label: "Plasma", color: "#fab387" },
  charge: { icon: Zap, label: "Charge", color: "#f9e2af" },
  laser: { icon: Focus, label: "Laser", color: "#cba6f7" },
};

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
  role: ShipRole;
  description: string;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1, role: "shooter", description: "Fires projectiles at enemies" },
  { entityType: "Osprey", cost: 15, colorPreset: ColorPreset.Preset1, role: "rapid_fire", description: "Fires rapidly at enemies" },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1, role: "healer", description: "Repairs nearby allied ships" },
  { entityType: "Spark", cost: 15, colorPreset: ColorPreset.Preset1, role: "plasma", description: "Burns enemies with plasma stacks" },
  { entityType: "Pulse", cost: 15, colorPreset: ColorPreset.Preset1, role: "charge", description: "Grants a charge to nearby allies" },
  { entityType: "Prism", cost: 15, colorPreset: ColorPreset.Preset1, role: "laser", description: "Fires a laser beam at enemies" },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}

const roleByEntityType = new Map<string, ShipRole>();
for (const bp of SHIP_BLUEPRINTS) {
  const path = UPGRADE_PATHS.find((p) => p[0] === bp.entityType);
  if (path) {
    for (const et of path) {
      roleByEntityType.set(et, bp.role);
    }
  }
}

export function getShipRole(entityType: EntityType): ShipRole | null {
  return roleByEntityType.get(entityType) ?? null;
}
