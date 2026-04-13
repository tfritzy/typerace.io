import { type EntityType, ColorPreset } from "./types";

export const GRID_CELL = 36;

export interface ShipBlueprint {
  entityType: EntityType;
  cost: number;
  colorPreset: ColorPreset;
  occupancy: boolean[][];
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  {
    entityType: "Mite",
    cost: 25,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
    ],
  },
  {
    entityType: "Speck",
    cost: 30,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Gnat",
    cost: 35,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Flicker",
    cost: 40,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Clipper",
    cost: 50,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Stinger",
    cost: 60,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Crest",
    cost: 75,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Osprey",
    cost: 100,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true],
      [true, true],
      [true, true],
    ],
  },
  {
    entityType: "Kestrel",
    cost: 120,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Vulture",
    cost: 140,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Talon",
    cost: 175,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Warden",
    cost: 225,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Behemoth",
    cost: 350,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Juggernaut",
    cost: 500,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
  {
    entityType: "Colossus",
    cost: 650,
    colorPreset: ColorPreset.Preset1,
    occupancy: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
];
