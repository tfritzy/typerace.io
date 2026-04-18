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
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1, role: "shooter", description: "Fires projectiles at enemies" },
  { entityType: "Osprey", cost: 15, colorPreset: ColorPreset.Preset1, role: "rapid_fire", description: "Fires rapidly at enemies" },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1, role: "healer", description: "Repairs nearby allied ships" },
  { entityType: "Buckler", cost: 15, colorPreset: ColorPreset.Preset1, role: "shield", description: "Projects a shield onto nearby allies" },
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
