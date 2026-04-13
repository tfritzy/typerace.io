import { type EntityType, ProjectileType } from "./types";

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
  firingRange: number;
  fireRate: number;
  projectileSpeed: number;
  projectileType: ProjectileType;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Dot", health: 50, power: 50, firingRange: 600, fireRate: 2.0, projectileSpeed: 180, projectileType: ProjectileType.Projectile1 },
  { entityType: "Pip", health: 70, power: 70, firingRange: 600, fireRate: 1.8, projectileSpeed: 190, projectileType: ProjectileType.Projectile1 },
  { entityType: "Flea", health: 100, power: 100, firingRange: 630, fireRate: 1.6, projectileSpeed: 200, projectileType: ProjectileType.Projectile1 },
  { entityType: "Needle", health: 130, power: 130, firingRange: 660, fireRate: 1.5, projectileSpeed: 220, projectileType: ProjectileType.Projectile2 },
  { entityType: "Bolt", health: 190, power: 190, firingRange: 690, fireRate: 1.4, projectileSpeed: 230, projectileType: ProjectileType.Projectile2 },
  { entityType: "Cricket", health: 250, power: 250, firingRange: 720, fireRate: 1.3, projectileSpeed: 240, projectileType: ProjectileType.Projectile2 },
  { entityType: "Robin", health: 325, power: 325, firingRange: 750, fireRate: 1.3, projectileSpeed: 240, projectileType: ProjectileType.Projectile2 },
  { entityType: "Sparrow", health: 450, power: 450, firingRange: 790, fireRate: 1.2, projectileSpeed: 250, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hornet", health: 575, power: 575, firingRange: 830, fireRate: 1.1, projectileSpeed: 260, projectileType: ProjectileType.Projectile3 },
  { entityType: "Dart", health: 750, power: 750, firingRange: 870, fireRate: 1.0, projectileSpeed: 280, projectileType: ProjectileType.Projectile3 },
  { entityType: "Scout", health: 1000, power: 1000, firingRange: 900, fireRate: 1.0, projectileSpeed: 280, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hawk", health: 1500, power: 1500, firingRange: 940, fireRate: 0.9, projectileSpeed: 300, projectileType: ProjectileType.Projectile4 },
  { entityType: "Falcon", health: 1700, power: 1700, firingRange: 970, fireRate: 0.9, projectileSpeed: 300, projectileType: ProjectileType.Projectile4 },
  { entityType: "Harrier", health: 2250, power: 2250, firingRange: 1000, fireRate: 0.8, projectileSpeed: 320, projectileType: ProjectileType.Projectile4 },
  { entityType: "Raptor", health: 2950, power: 2950, firingRange: 1030, fireRate: 0.8, projectileSpeed: 320, projectileType: ProjectileType.Projectile4 },
  { entityType: "Eagle", health: 4450, power: 4450, firingRange: 1060, fireRate: 0.7, projectileSpeed: 340, projectileType: ProjectileType.Projectile5 },
  { entityType: "Corsair", health: 30000, power: 30000, firingRange: 1090, fireRate: 2.5, projectileSpeed: 350, projectileType: ProjectileType.Projectile5 },
  { entityType: "Vanguard", health: 39000, power: 39000, firingRange: 1120, fireRate: 2.2, projectileSpeed: 360, projectileType: ProjectileType.Projectile5 },
  { entityType: "Titan", health: 88500, power: 88500, firingRange: 1150, fireRate: 3.0, projectileSpeed: 370, projectileType: ProjectileType.Projectile6 },
  { entityType: "Dreadnought", health: 101000, power: 101000, firingRange: 1170, fireRate: 3.0, projectileSpeed: 380, projectileType: ProjectileType.Projectile6 },
  { entityType: "Leviathan", health: 152000, power: 152000, firingRange: 1190, fireRate: 3.5, projectileSpeed: 390, projectileType: ProjectileType.Projectile6 },
  { entityType: "Flagship", health: 200000, power: 200000, firingRange: 1200, fireRate: 4.0, projectileSpeed: 400, projectileType: ProjectileType.Projectile6 },
];

export const FRIENDLY_CATALOG: EnemyConfig[] = [
  { entityType: "Clipper", health: 5800, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: ProjectileType.Projectile1 },
  { entityType: "Sentinel", health: 34000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: ProjectileType.Projectile1 },
  { entityType: "Phoenix", health: 59000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: ProjectileType.Projectile1 },
  { entityType: "Aegis", health: 77000, power: 0, firingRange: 0, fireRate: 0, projectileSpeed: 0, projectileType: ProjectileType.Projectile1 },
];
