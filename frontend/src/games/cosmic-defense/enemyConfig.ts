import type { EntityType } from "./types";

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Dot", health: 50, power: 50 },
  { entityType: "Pip", health: 70, power: 70 },
  { entityType: "Flea", health: 100, power: 100 },
  { entityType: "Needle", health: 130, power: 130 },
  { entityType: "Bolt", health: 190, power: 190 },
  { entityType: "Cricket", health: 250, power: 250 },
  { entityType: "Robin", health: 325, power: 325 },
  { entityType: "Sparrow", health: 450, power: 450 },
  { entityType: "Hornet", health: 575, power: 575 },
  { entityType: "Dart", health: 750, power: 750 },
  { entityType: "Scout", health: 1000, power: 1000 },
  { entityType: "Hawk", health: 1500, power: 1500 },
  { entityType: "Falcon", health: 1700, power: 1700 },
  { entityType: "Harrier", health: 2250, power: 2250 },
  { entityType: "Raptor", health: 2950, power: 2950 },
  { entityType: "Eagle", health: 4450, power: 4450 },
  { entityType: "Corsair", health: 30000, power: 30000 },
  { entityType: "Vanguard", health: 39000, power: 39000 },
  { entityType: "Titan", health: 88500, power: 88500 },
  { entityType: "Dreadnought", health: 101000, power: 101000 },
  { entityType: "Leviathan", health: 152000, power: 152000 },
  { entityType: "Flagship", health: 200000, power: 200000 },
];

export const FRIENDLY_CATALOG: EnemyConfig[] = [
  { entityType: "Clipper", health: 5800, power: 0 },
  { entityType: "Sentinel", health: 34000, power: 0 },
  { entityType: "Phoenix", health: 59000, power: 0 },
  { entityType: "Aegis", health: 77000, power: 0 },
];
