import { type EntityType, ColorPreset } from "./types";

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

export interface ShipBlueprint {
  entityType: EntityType;
  colorPreset: ColorPreset;
  role: ShipRole;
  description: string;
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Spur", colorPreset: ColorPreset.Preset1, role: "sniper", description: "Devastating long-range strikes" },
  { entityType: "Ember", colorPreset: ColorPreset.Preset1, role: "buffer", description: "Empowers allied ships" },
  { entityType: "Corona", colorPreset: ColorPreset.Preset1, role: "laser", description: "Focused energy beam" },
  { entityType: "Pip", colorPreset: ColorPreset.Preset1, role: "dual_shot", description: "Twin-barrel barrage" },
  { entityType: "Eagle", colorPreset: ColorPreset.Preset1, role: "charge", description: "Charges all allies" },
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
