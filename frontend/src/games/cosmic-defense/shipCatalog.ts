import { type EntityType, ColorPreset } from "./types";

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  { entityType: "Moth", cost: 25, colorPreset: ColorPreset.Preset1 },
  { entityType: "Dot", cost: 30, colorPreset: ColorPreset.Preset1 },
  { entityType: "Gnat", cost: 35, colorPreset: ColorPreset.Preset1 },
  { entityType: "Flicker", cost: 40, colorPreset: ColorPreset.Preset1 },
  { entityType: "Clipper", cost: 50, colorPreset: ColorPreset.Preset1 },
  { entityType: "Stinger", cost: 60, colorPreset: ColorPreset.Preset1 },
  { entityType: "Crest", cost: 75, colorPreset: ColorPreset.Preset1 },
  { entityType: "Osprey", cost: 100, colorPreset: ColorPreset.Preset1 },
  { entityType: "Kestrel", cost: 120, colorPreset: ColorPreset.Preset1 },
  { entityType: "Vulture", cost: 140, colorPreset: ColorPreset.Preset1 },
  { entityType: "Talon", cost: 175, colorPreset: ColorPreset.Preset1 },
  { entityType: "Warden", cost: 225, colorPreset: ColorPreset.Preset1 },
  { entityType: "Behemoth", cost: 350, colorPreset: ColorPreset.Preset1 },
  { entityType: "Juggernaut", cost: 500, colorPreset: ColorPreset.Preset1 },
  { entityType: "Colossus", cost: 650, colorPreset: ColorPreset.Preset1 },
];
