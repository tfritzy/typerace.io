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
  return Math.round(Math.pow(config.health, 0.6));
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
  { entityType: "Speck", health: 55, power: 55, firingRange: 400, fireRate: 2.1, projectileSpeed: 180, projectileDamage: 5, projectileType: ProjectileType.Tiny },
  { entityType: "Pip", health: 70, power: 70, firingRange: 400, fireRate: 2.0, projectileSpeed: 190, projectileDamage: 7, projectileType: ProjectileType.Tiny },
  { entityType: "Flea", health: 95, power: 95, firingRange: 420, fireRate: 1.9, projectileSpeed: 200, projectileDamage: 9, projectileType: ProjectileType.Tiny },
  { entityType: "Needle", health: 125, power: 125, firingRange: 440, fireRate: 1.8, projectileSpeed: 210, projectileDamage: 11, projectileType: ProjectileType.Projectile2 },
  { entityType: "Bolt", health: 170, power: 170, firingRange: 450, fireRate: 1.7, projectileSpeed: 220, projectileDamage: 14, projectileType: ProjectileType.Projectile2 },
  { entityType: "Cricket", health: 225, power: 225, firingRange: 460, fireRate: 1.6, projectileSpeed: 230, projectileDamage: 18, projectileType: ProjectileType.Projectile2 },
  { entityType: "Robin", health: 300, power: 300, firingRange: 480, fireRate: 1.5, projectileSpeed: 235, projectileDamage: 22, projectileType: ProjectileType.Projectile2 },
  { entityType: "Sparrow", health: 400, power: 400, firingRange: 500, fireRate: 1.4, projectileSpeed: 240, projectileDamage: 28, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hornet", health: 530, power: 530, firingRange: 520, fireRate: 1.3, projectileSpeed: 250, projectileDamage: 35, projectileType: ProjectileType.Projectile3 },
  { entityType: "Dart", health: 700, power: 700, firingRange: 540, fireRate: 1.2, projectileSpeed: 260, projectileDamage: 42, projectileType: ProjectileType.Projectile3 },
  { entityType: "Scout", health: 940, power: 940, firingRange: 560, fireRate: 1.1, projectileSpeed: 270, projectileDamage: 52, projectileType: ProjectileType.Projectile3 },
  { entityType: "Hawk", health: 1250, power: 1250, firingRange: 580, fireRate: 1.0, projectileSpeed: 280, projectileDamage: 62, projectileType: ProjectileType.Projectile4 },
  { entityType: "Falcon", health: 1675, power: 1675, firingRange: 600, fireRate: 0.95, projectileSpeed: 290, projectileDamage: 80, projectileType: ProjectileType.Projectile4 },
  { entityType: "Harrier", health: 2225, power: 2225, firingRange: 620, fireRate: 0.9, projectileSpeed: 300, projectileDamage: 100, projectileType: ProjectileType.Projectile4 },
  { entityType: "Raptor", health: 2950, power: 2950, firingRange: 640, fireRate: 0.85, projectileSpeed: 310, projectileDamage: 125, projectileType: ProjectileType.Projectile4 },
  { entityType: "Eagle", health: 3925, power: 3925, firingRange: 660, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 155, projectileType: ProjectileType.Projectile5 },
  { entityType: "Corsair", health: 5225, power: 5225, firingRange: 680, fireRate: 0.8, projectileSpeed: 330, projectileDamage: 190, projectileType: ProjectileType.Projectile5 },
  { entityType: "Vanguard", health: 6950, power: 6950, firingRange: 700, fireRate: 0.75, projectileSpeed: 340, projectileDamage: 235, projectileType: ProjectileType.Projectile5 },
  { entityType: "Titan", health: 9250, power: 9250, firingRange: 720, fireRate: 0.7, projectileSpeed: 350, projectileDamage: 290, projectileType: ProjectileType.Projectile6 },
  { entityType: "Dreadnought", health: 12300, power: 12300, firingRange: 740, fireRate: 0.7, projectileSpeed: 360, projectileDamage: 355, projectileType: ProjectileType.Projectile6 },
  { entityType: "Leviathan", health: 16350, power: 16350, firingRange: 760, fireRate: 0.65, projectileSpeed: 370, projectileDamage: 430, projectileType: ProjectileType.Projectile6 },
  { entityType: "Flagship", health: 21750, power: 21750, firingRange: 800, fireRate: 0.6, projectileSpeed: 380, projectileDamage: 530, projectileType: ProjectileType.Projectile6 },
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
