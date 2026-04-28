export type RelicId = "stellar_core" | "void_crystal" | "charge_matrix";

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  sprite: string;
}

export const RELIC_CATALOG: RelicDefinition[] = [
  {
    id: "stellar_core",
    name: "Stellar Core",
    description: "All allied weapons deal 25% more damage.",
    sprite: "/futuristic_pixel_icons/Blue Core.png",
  },
  {
    id: "void_crystal",
    name: "Void Crystal",
    description: "All enemies move 30% slower.",
    sprite: "/futuristic_pixel_icons/Blue Star Crystal.png",
  },
  {
    id: "charge_matrix",
    name: "Charge Matrix",
    description: "Each correct keystroke grants +1 extra charge to all ships.",
    sprite: "/futuristic_pixel_icons/Blue Cosmic Ring.png",
  },
];
