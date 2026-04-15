import { type EntityType, ColorPreset } from "./types";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
}

export const SHIP_BLUEPRINT_MAP = new Map<string, ShipBlueprint>();

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 15, colorPreset: ColorPreset.Preset1 },
  { entityType: "Dot", cost: 25, colorPreset: ColorPreset.Preset1 },
  { entityType: "Gnat", cost: 40, colorPreset: ColorPreset.Preset1 },
  { entityType: "Flicker", cost: 65, colorPreset: ColorPreset.Preset1 },
  { entityType: "Clipper", cost: 100, colorPreset: ColorPreset.Preset1 },
  { entityType: "Stinger", cost: 160, colorPreset: ColorPreset.Preset1 },
  { entityType: "Crest", cost: 250, colorPreset: ColorPreset.Preset1 },
  { entityType: "Osprey", cost: 400, colorPreset: ColorPreset.Preset1 },
  { entityType: "Kestrel", cost: 625, colorPreset: ColorPreset.Preset1 },
  { entityType: "Vulture", cost: 1000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Talon", cost: 1600, colorPreset: ColorPreset.Preset1 },
  { entityType: "Warden", cost: 2500, colorPreset: ColorPreset.Preset1 },
  { entityType: "Behemoth", cost: 4000, colorPreset: ColorPreset.Preset1 },
  { entityType: "Juggernaut", cost: 6500, colorPreset: ColorPreset.Preset1 },
  { entityType: "Colossus", cost: 10000, colorPreset: ColorPreset.Preset1 },
];

for (const bp of SHIP_BLUEPRINTS) {
  SHIP_BLUEPRINT_MAP.set(bp.entityType, bp);
}
