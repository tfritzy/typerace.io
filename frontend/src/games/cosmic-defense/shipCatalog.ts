import { type EntityType, ColorPreset } from "./types";
import { UPGRADE_PATHS } from "./upgradePaths";

export type ShipRole = "shooter" | "rapid_fire" | "healer" | "shield" | "plasma" | "charge" | "laser";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
  role: ShipRole;
  description: string;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1, role: "shooter", description: "Fires a projectile every 4 keystrokes" },
  { entityType: "Osprey", cost: 15, colorPreset: ColorPreset.Preset1, role: "rapid_fire", description: "Fires a quick shot every 2 keystrokes" },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1, role: "healer", description: "Heals nearby allies every 4 keystrokes" },
  { entityType: "Buckler", cost: 15, colorPreset: ColorPreset.Preset1, role: "shield", description: "Shields nearby allies every 4 keystrokes" },
  { entityType: "Spark", cost: 15, colorPreset: ColorPreset.Preset1, role: "plasma", description: "Applies plasma stacks to enemies every 4 keystrokes" },
  { entityType: "Pulse", cost: 15, colorPreset: ColorPreset.Preset1, role: "charge", description: "Grants 1 charge to nearby allies every 8 keystrokes" },
  { entityType: "Prism", cost: 15, colorPreset: ColorPreset.Preset1, role: "laser", description: "Fires a piercing beam every 5 keystrokes" },
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
