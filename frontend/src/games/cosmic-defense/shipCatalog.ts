import { type EntityType, ColorPreset } from "./types";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Dot", cost: 40, colorPreset: ColorPreset.Preset1 },
  { entityType: "Gnat", cost: 100, colorPreset: ColorPreset.Preset1 },
  { entityType: "Ward", cost: 250, colorPreset: ColorPreset.Preset1 },
  { entityType: "Clipper", cost: 600, colorPreset: ColorPreset.Preset1 },
  { entityType: "Stinger", cost: 1500, colorPreset: ColorPreset.Preset1 },
  { entityType: "Crest", cost: 3500, colorPreset: ColorPreset.Preset1 },
  { entityType: "Osprey", cost: 8000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Kestrel", cost: 20000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Vulture", cost: 50000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Talon", cost: 120000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Broadside", cost: 300000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Bastion", cost: 750000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Haven", cost: 2000000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Colossus", cost: 5000000, colorPreset: ColorPreset.Preset1 },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}
