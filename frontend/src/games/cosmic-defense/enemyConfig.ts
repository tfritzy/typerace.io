import { type EntityType, ProjectileType } from "./types";

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
  fireRate: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  range: number;
  hitRadius: number;
}

export function goldForEnemy(config: EnemyConfig): number {
  return Math.round(Math.pow(config.health, 0.6));
}

export interface FriendlyConfig {
  entityType: EntityType;
  health: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  chargesRequired: number;
  hitRadius: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Mite", health: 40, power: 40, fireRate: 2.2, projectileSpeed: 170, projectileDamage: 4, projectileType: ProjectileType.Tiny, range: 250, hitRadius: 15 },
  { entityType: "Speck", health: 55, power: 55, fireRate: 2.1, projectileSpeed: 180, projectileDamage: 5, projectileType: ProjectileType.Tiny, range: 255, hitRadius: 21 },
  { entityType: "Pip", health: 70, power: 70, fireRate: 2.0, projectileSpeed: 190, projectileDamage: 7, projectileType: ProjectileType.Tiny, range: 260, hitRadius: 21 },
  { entityType: "Flea", health: 95, power: 95, fireRate: 1.9, projectileSpeed: 200, projectileDamage: 9, projectileType: ProjectileType.Tiny, range: 265, hitRadius: 23 },
  { entityType: "Needle", health: 125, power: 125, fireRate: 1.8, projectileSpeed: 210, projectileDamage: 11, projectileType: ProjectileType.Projectile2, range: 270, hitRadius: 24 },
  { entityType: "Bolt", health: 170, power: 170, fireRate: 1.7, projectileSpeed: 220, projectileDamage: 14, projectileType: ProjectileType.Projectile2, range: 275, hitRadius: 33 },
  { entityType: "Cricket", health: 225, power: 225, fireRate: 1.6, projectileSpeed: 230, projectileDamage: 18, projectileType: ProjectileType.Projectile2, range: 280, hitRadius: 27 },
  { entityType: "Robin", health: 300, power: 300, fireRate: 1.5, projectileSpeed: 235, projectileDamage: 22, projectileType: ProjectileType.Projectile2, range: 285, hitRadius: 26 },
  { entityType: "Sparrow", health: 400, power: 400, fireRate: 1.4, projectileSpeed: 240, projectileDamage: 28, projectileType: ProjectileType.Projectile3, range: 290, hitRadius: 30 },
  { entityType: "Hornet", health: 530, power: 530, fireRate: 1.3, projectileSpeed: 250, projectileDamage: 35, projectileType: ProjectileType.Projectile3, range: 295, hitRadius: 27 },
  { entityType: "Dart", health: 700, power: 700, fireRate: 1.2, projectileSpeed: 260, projectileDamage: 42, projectileType: ProjectileType.Projectile3, range: 300, hitRadius: 30 },
  { entityType: "Scout", health: 940, power: 940, fireRate: 1.1, projectileSpeed: 270, projectileDamage: 52, projectileType: ProjectileType.Projectile3, range: 305, hitRadius: 30 },
  { entityType: "Hawk", health: 1250, power: 1250, fireRate: 1.0, projectileSpeed: 280, projectileDamage: 62, projectileType: ProjectileType.Projectile4, range: 310, hitRadius: 33 },
  { entityType: "Falcon", health: 1675, power: 1675, fireRate: 0.95, projectileSpeed: 290, projectileDamage: 80, projectileType: ProjectileType.Projectile4, range: 315, hitRadius: 36 },
  { entityType: "Harrier", health: 2225, power: 2225, fireRate: 0.9, projectileSpeed: 300, projectileDamage: 100, projectileType: ProjectileType.Projectile4, range: 320, hitRadius: 33 },
  { entityType: "Raptor", health: 2950, power: 2950, fireRate: 0.85, projectileSpeed: 310, projectileDamage: 125, projectileType: ProjectileType.Projectile4, range: 325, hitRadius: 36 },
  { entityType: "Eagle", health: 3925, power: 3925, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 155, projectileType: ProjectileType.Projectile5, range: 330, hitRadius: 36 },
  { entityType: "Corsair", health: 5225, power: 5225, fireRate: 0.8, projectileSpeed: 330, projectileDamage: 190, projectileType: ProjectileType.Projectile5, range: 335, hitRadius: 36 },
  { entityType: "Vanguard", health: 6950, power: 6950, fireRate: 0.75, projectileSpeed: 340, projectileDamage: 235, projectileType: ProjectileType.Projectile5, range: 340, hitRadius: 44 },
  { entityType: "Titan", health: 9250, power: 9250, fireRate: 0.7, projectileSpeed: 350, projectileDamage: 290, projectileType: ProjectileType.Projectile6, range: 345, hitRadius: 41 },
  { entityType: "Dreadnought", health: 12300, power: 12300, fireRate: 0.7, projectileSpeed: 360, projectileDamage: 355, projectileType: ProjectileType.Projectile6, range: 350, hitRadius: 44 },
  { entityType: "Leviathan", health: 16350, power: 16350, fireRate: 0.65, projectileSpeed: 370, projectileDamage: 430, projectileType: ProjectileType.Projectile6, range: 355, hitRadius: 41 },
  { entityType: "Flagship", health: 21750, power: 21750, fireRate: 0.6, projectileSpeed: 380, projectileDamage: 530, projectileType: ProjectileType.Projectile6, range: 360, hitRadius: 38 },
];

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Moth", health: 200, projectileSpeed: 200, projectileDamage: 8, projectileType: ProjectileType.Tiny, chargesRequired: 3, hitRadius: 24 },
  { entityType: "Dot", health: 400, projectileSpeed: 220, projectileDamage: 15, projectileType: ProjectileType.Tiny, chargesRequired: 3, hitRadius: 29 },
  { entityType: "Gnat", health: 700, projectileSpeed: 240, projectileDamage: 30, projectileType: ProjectileType.Tiny, chargesRequired: 3, hitRadius: 26 },
  { entityType: "Flicker", health: 1200, projectileSpeed: 260, projectileDamage: 55, projectileType: ProjectileType.Projectile2, chargesRequired: 4, hitRadius: 27 },
  { entityType: "Clipper", health: 2000, projectileSpeed: 280, projectileDamage: 100, projectileType: ProjectileType.Projectile2, chargesRequired: 4, hitRadius: 27 },
  { entityType: "Stinger", health: 3500, projectileSpeed: 300, projectileDamage: 200, projectileType: ProjectileType.Projectile2, chargesRequired: 5, hitRadius: 29 },
  { entityType: "Crest", health: 6000, projectileSpeed: 320, projectileDamage: 375, projectileType: ProjectileType.Projectile3, chargesRequired: 5, hitRadius: 33 },
  { entityType: "Osprey", health: 10000, projectileSpeed: 340, projectileDamage: 700, projectileType: ProjectileType.Projectile3, chargesRequired: 6, hitRadius: 33 },
  { entityType: "Kestrel", health: 17000, projectileSpeed: 360, projectileDamage: 1300, projectileType: ProjectileType.Projectile3, chargesRequired: 6, hitRadius: 32 },
  { entityType: "Vulture", health: 28000, projectileSpeed: 380, projectileDamage: 2400, projectileType: ProjectileType.Projectile4, chargesRequired: 7, hitRadius: 32 },
  { entityType: "Talon", health: 45000, projectileSpeed: 400, projectileDamage: 4500, projectileType: ProjectileType.Projectile4, chargesRequired: 7, hitRadius: 38 },
  { entityType: "Warden", health: 75000, projectileSpeed: 420, projectileDamage: 8000, projectileType: ProjectileType.Projectile5, chargesRequired: 8, hitRadius: 39 },
  { entityType: "Behemoth", health: 120000, projectileSpeed: 440, projectileDamage: 15000, projectileType: ProjectileType.Projectile5, chargesRequired: 9, hitRadius: 47 },
  { entityType: "Juggernaut", health: 200000, projectileSpeed: 460, projectileDamage: 30000, projectileType: ProjectileType.Projectile6, chargesRequired: 10, hitRadius: 45 },
  { entityType: "Colossus", health: 325000, projectileSpeed: 480, projectileDamage: 55000, projectileType: ProjectileType.Projectile6, chargesRequired: 11, hitRadius: 47 },
];

export const FRIENDLY_CONFIG_MAP = new Map<string, FriendlyConfig>(
  FRIENDLY_CATALOG.map((c) => [c.entityType, c])
);
