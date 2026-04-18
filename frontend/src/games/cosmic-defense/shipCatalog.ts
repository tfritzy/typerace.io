import { type EntityType, ColorPreset } from "./types";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Pip", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Mender", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Spark", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Speck", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Mite", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Specter", cost: 15, colorPreset: ColorPreset.Preset1 },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}
