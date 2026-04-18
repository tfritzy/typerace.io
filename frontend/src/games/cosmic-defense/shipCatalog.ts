import { type EntityType, ColorPreset } from "./types";

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
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1, role: "shooter", description: "Fires steady projectiles at enemies" },
  { entityType: "Osprey", cost: 15, colorPreset: ColorPreset.Preset1, role: "rapid_fire", description: "Rapid fire, quickly switches between targets" },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1, role: "healer", description: "Repairs nearby allied ships over time" },
  { entityType: "Buckler", cost: 15, colorPreset: ColorPreset.Preset1, role: "shield", description: "Projects a shield onto nearby allies" },
  { entityType: "Spark", cost: 15, colorPreset: ColorPreset.Preset1, role: "plasma", description: "Applies stacks of plasma to enemies" },
  { entityType: "Pulse", cost: 15, colorPreset: ColorPreset.Preset1, role: "charge", description: "Grants charge to nearby allies" },
  { entityType: "Prism", cost: 15, colorPreset: ColorPreset.Preset1, role: "laser", description: "Fires a piercing beam through enemies" },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}
