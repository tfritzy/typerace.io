import { type EntityType, ColorPreset } from "./types";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Osprey", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Buckler", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Spark", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Pulse", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Prism", cost: 15, colorPreset: ColorPreset.Preset1 },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}
