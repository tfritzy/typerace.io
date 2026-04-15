import { type EntityType, ProjectileType } from "./types";

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
  firingRange: number;
  fireRate: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileType: ProjectileType;
}

export function goldForEnemy(config: EnemyConfig): number {
  return Math.round(Math.pow(config.health, 0.55));
}

export interface FriendlyConfig {
  entityType: EntityType;
  health: number;
  firingRange: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  chargesRequired: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Mite", health: 40, power: 40, firingRange: 400, fireRate: 2.2, projectileSpeed: 170, projectileDamage: 4, projectileType: ProjectileType.Tiny },
  { entityType: "Speck", health: 50, power: 50, firingRange: 400, fireRate: 2.0, projectileSpeed: 180, projectileDamage: 5, projectileType: ProjectileType.Tiny },
  { entityType: "Pip", health: 70, power: 70, firingRange: 400, fireRate: 1.8, projectileSpeed: 190, projectileDamage: 7, projectileType: ProjectileType.Tiny },
  { entityType: "Flea", health: 100, power: 100, firingRange: 420, fireRate: 1.6, projectileSpeed: 200, projectileDamage: 10, projectileType: ProjectileType.Tiny },
  { entityType: "Needle", health: 130, power: 130, firingRange: 440, fireRate: 1.5, projectileSpeed: 220, projectileDamage: 12, projectileType: ProjectileType.Projectile2 },
  { entityType: "Bolt", health: 190, power: 190, firingRange: 460, fireRate: 1.4, projectileSpeed: 230, projectileDamage: 15, projectileType: ProjectileType.Projectile2 },
  { entityType: "Cricket", health: 250, power: 250, firingRange: 480, fireRate: 1.3, projectileSpeed: 240, projectileDamage: 18, projectileType: ProjectileType.Projectile2 },
  { entityType: "Robin", health: 325, power: 325, firingRange: 500, fireRate: 1.3, projectileSpeed: 240, projectileDamage: 22, projectileType: ProjectileType.Projectile2 },
  { entityType: "Sparrow", health: 450, power: 450, firingRange: 530, fireRate: 1.2, projectileSpeed: 250, projectileDamage: 28, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hornet", health: 575, power: 575, firingRange: 550, fireRate: 1.1, projectileSpeed: 260, projectileDamage: 35, projectileType: ProjectileType.Projectile3 },
  { entityType: "Dart", health: 750, power: 750, firingRange: 580, fireRate: 1.0, projectileSpeed: 280, projectileDamage: 45, projectileType: ProjectileType.Projectile3 },
  { entityType: "Scout", health: 1000, power: 1000, firingRange: 600, fireRate: 1.0, projectileSpeed: 280, projectileDamage: 55, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hawk", health: 1500, power: 1500, firingRange: 630, fireRate: 0.9, projectileSpeed: 300, projectileDamage: 70, projectileType: ProjectileType.Projectile4 },
  { entityType: "Falcon", health: 1700, power: 1700, firingRange: 650, fireRate: 0.9, projectileSpeed: 300, projectileDamage: 85, projectileType: ProjectileType.Projectile4 },
  { entityType: "Harrier", health: 2250, power: 2250, firingRange: 670, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 100, projectileType: ProjectileType.Projectile4 },
  { entityType: "Raptor", health: 2950, power: 2950, firingRange: 690, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 120, projectileType: ProjectileType.Projectile4 },
  { entityType: "Eagle", health: 4450, power: 4450, firingRange: 710, fireRate: 0.7, projectileSpeed: 340, projectileDamage: 150, projectileType: ProjectileType.Projectile5 },
  { entityType: "Corsair", health: 30000, power: 30000, firingRange: 730, fireRate: 2.5, projectileSpeed: 350, projectileDamage: 500, projectileType: ProjectileType.Projectile5 },
  { entityType: "Vanguard", health: 39000, power: 39000, firingRange: 750, fireRate: 2.2, projectileSpeed: 360, projectileDamage: 650, projectileType: ProjectileType.Projectile5 },
  { entityType: "Titan", health: 88500, power: 88500, firingRange: 770, fireRate: 3.0, projectileSpeed: 370, projectileDamage: 1200, projectileType: ProjectileType.Projectile6 },
  { entityType: "Dreadnought", health: 101000, power: 101000, firingRange: 780, fireRate: 3.0, projectileSpeed: 380, projectileDamage: 1500, projectileType: ProjectileType.Projectile6 },
  { entityType: "Leviathan", health: 152000, power: 152000, firingRange: 790, fireRate: 3.5, projectileSpeed: 390, projectileDamage: 2000, projectileType: ProjectileType.Projectile6 },
  { entityType: "Flagship", health: 200000, power: 200000, firingRange: 800, fireRate: 4.0, projectileSpeed: 400, projectileDamage: 3000, projectileType: ProjectileType.Projectile6 },
];

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Moth", health: 200, firingRange: 525, projectileSpeed: 200, projectileDamage: 8, projectileType: ProjectileType.Tiny, chargesRequired: 3 },
  { entityType: "Dot", health: 300, firingRange: 555, projectileSpeed: 220, projectileDamage: 12, projectileType: ProjectileType.Tiny, chargesRequired: 3 },
  { entityType: "Gnat", health: 400, firingRange: 570, projectileSpeed: 190, projectileDamage: 15, projectileType: ProjectileType.Tiny, chargesRequired: 4 },
  { entityType: "Flicker", health: 500, firingRange: 600, projectileSpeed: 250, projectileDamage: 18, projectileType: ProjectileType.Tiny, chargesRequired: 4 },
  { entityType: "Clipper", health: 650, firingRange: 630, projectileSpeed: 210, projectileDamage: 25, projectileType: ProjectileType.Projectile2, chargesRequired: 5 },
  { entityType: "Stinger", health: 900, firingRange: 675, projectileSpeed: 280, projectileDamage: 32, projectileType: ProjectileType.Projectile2, chargesRequired: 5 },
  { entityType: "Crest", health: 1200, firingRange: 720, projectileSpeed: 230, projectileDamage: 40, projectileType: ProjectileType.Projectile2, chargesRequired: 6 },
  { entityType: "Osprey", health: 1800, firingRange: 780, projectileSpeed: 260, projectileDamage: 55, projectileType: ProjectileType.Projectile3, chargesRequired: 6 },
  { entityType: "Kestrel", health: 2500, firingRange: 825, projectileSpeed: 240, projectileDamage: 70, projectileType: ProjectileType.Projectile3, chargesRequired: 7 },
  { entityType: "Vulture", health: 3200, firingRange: 870, projectileSpeed: 300, projectileDamage: 90, projectileType: ProjectileType.Projectile3, chargesRequired: 8 },
  { entityType: "Talon", health: 4500, firingRange: 930, projectileSpeed: 270, projectileDamage: 120, projectileType: ProjectileType.Projectile4, chargesRequired: 8 },
  { entityType: "Warden", health: 6500, firingRange: 990, projectileSpeed: 320, projectileDamage: 160, projectileType: ProjectileType.Projectile4, chargesRequired: 9 },
  { entityType: "Behemoth", health: 10000, firingRange: 1050, projectileSpeed: 250, projectileDamage: 250, projectileType: ProjectileType.Projectile5, chargesRequired: 10 },
  { entityType: "Juggernaut", health: 15000, firingRange: 1110, projectileSpeed: 350, projectileDamage: 400, projectileType: ProjectileType.Projectile5, chargesRequired: 11 },
  { entityType: "Colossus", health: 22000, firingRange: 1170, projectileSpeed: 290, projectileDamage: 600, projectileType: ProjectileType.Projectile6, chargesRequired: 12 },
];

export const FRIENDLY_CONFIG_MAP = new Map<string, FriendlyConfig>(
  FRIENDLY_CATALOG.map((c) => [c.entityType, c])
);
