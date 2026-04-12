import type { EntityType } from "./types";

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
  firingRange: number;
  fireRate: number;
  projectileSpeed: number;
  projectileType: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Dot", health: 50, power: 50, firingRange: 250, fireRate: 2.0, projectileSpeed: 180, projectileType: 1 },
  { entityType: "Pip", health: 70, power: 70, firingRange: 250, fireRate: 1.8, projectileSpeed: 190, projectileType: 1 },
  { entityType: "Flea", health: 100, power: 100, firingRange: 280, fireRate: 1.6, projectileSpeed: 200, projectileType: 1 },
  { entityType: "Needle", health: 130, power: 130, firingRange: 320, fireRate: 1.5, projectileSpeed: 220, projectileType: 2 },
  { entityType: "Bolt", health: 190, power: 190, firingRange: 340, fireRate: 1.4, projectileSpeed: 230, projectileType: 2 },
  { entityType: "Cricket", health: 250, power: 250, firingRange: 350, fireRate: 1.3, projectileSpeed: 240, projectileType: 2 },
  { entityType: "Robin", health: 325, power: 325, firingRange: 360, fireRate: 1.3, projectileSpeed: 240, projectileType: 2 },
  { entityType: "Sparrow", health: 450, power: 450, firingRange: 400, fireRate: 1.2, projectileSpeed: 250, projectileType: 3 },
  { entityType: "Hornet", health: 575, power: 575, firingRange: 420, fireRate: 1.1, projectileSpeed: 260, projectileType: 3 },
  { entityType: "Dart", health: 750, power: 750, firingRange: 450, fireRate: 1.0, projectileSpeed: 280, projectileType: 3 },
  { entityType: "Scout", health: 1000, power: 1000, firingRange: 480, fireRate: 1.0, projectileSpeed: 280, projectileType: 3 },
  { entityType: "Hawk", health: 1500, power: 1500, firingRange: 520, fireRate: 0.9, projectileSpeed: 300, projectileType: 4 },
  { entityType: "Falcon", health: 1700, power: 1700, firingRange: 550, fireRate: 0.9, projectileSpeed: 300, projectileType: 4 },
  { entityType: "Harrier", health: 2250, power: 2250, firingRange: 580, fireRate: 0.8, projectileSpeed: 320, projectileType: 4 },
  { entityType: "Raptor", health: 2950, power: 2950, firingRange: 600, fireRate: 0.8, projectileSpeed: 320, projectileType: 4 },
  { entityType: "Eagle", health: 4450, power: 4450, firingRange: 650, fireRate: 0.7, projectileSpeed: 340, projectileType: 5 },
  { entityType: "Corsair", health: 30000, power: 30000, firingRange: 750, fireRate: 2.5, projectileSpeed: 350, projectileType: 5 },
  { entityType: "Vanguard", health: 39000, power: 39000, firingRange: 800, fireRate: 2.2, projectileSpeed: 360, projectileType: 5 },
  { entityType: "Titan", health: 88500, power: 88500, firingRange: 850, fireRate: 3.0, projectileSpeed: 370, projectileType: 6 },
  { entityType: "Dreadnought", health: 101000, power: 101000, firingRange: 900, fireRate: 3.0, projectileSpeed: 380, projectileType: 6 },
  { entityType: "Leviathan", health: 152000, power: 152000, firingRange: 950, fireRate: 3.5, projectileSpeed: 390, projectileType: 6 },
  { entityType: "Flagship", health: 200000, power: 200000, firingRange: 1000, fireRate: 4.0, projectileSpeed: 400, projectileType: 6 },
];

export const FRIENDLY_CATALOG: EnemyConfig[] = [
  { entityType: "Clipper", health: 5800, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: 1 },
  { entityType: "Sentinel", health: 34000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: 1 },
  { entityType: "Phoenix", health: 59000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: 1 },
  { entityType: "Aegis", health: 77000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: 1 },
];
