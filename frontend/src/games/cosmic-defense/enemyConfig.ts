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

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Dot", health: 50, power: 50, firingRange: 400, fireRate: 2.0, projectileSpeed: 180, projectileDamage: 5, projectileType: ProjectileType.Projectile1 },
  { entityType: "Pip", health: 70, power: 70, firingRange: 400, fireRate: 1.8, projectileSpeed: 190, projectileDamage: 7, projectileType: ProjectileType.Projectile1 },
  { entityType: "Flea", health: 100, power: 100, firingRange: 420, fireRate: 1.6, projectileSpeed: 200, projectileDamage: 10, projectileType: ProjectileType.Projectile1 },
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

export const FRIENDLY_CATALOG: EnemyConfig[] = [
  { entityType: "Mite", health: 200, power: 0, firingRange: 350, fireRate: 2.0, projectileSpeed: 200, projectileDamage: 8, projectileType: ProjectileType.Projectile1 },
  { entityType: "Speck", health: 300, power: 0, firingRange: 370, fireRate: 1.8, projectileSpeed: 220, projectileDamage: 12, projectileType: ProjectileType.Projectile1 },
  { entityType: "Gnat", health: 400, power: 0, firingRange: 380, fireRate: 1.7, projectileSpeed: 190, projectileDamage: 15, projectileType: ProjectileType.Projectile1 },
  { entityType: "Flicker", health: 500, power: 0, firingRange: 400, fireRate: 1.6, projectileSpeed: 250, projectileDamage: 18, projectileType: ProjectileType.Projectile1 },
  { entityType: "Clipper", health: 650, power: 0, firingRange: 420, fireRate: 1.5, projectileSpeed: 210, projectileDamage: 25, projectileType: ProjectileType.Projectile2 },
  { entityType: "Stinger", health: 900, power: 0, firingRange: 450, fireRate: 1.4, projectileSpeed: 280, projectileDamage: 32, projectileType: ProjectileType.Projectile2 },
  { entityType: "Crest", health: 1200, power: 0, firingRange: 480, fireRate: 1.3, projectileSpeed: 230, projectileDamage: 40, projectileType: ProjectileType.Projectile2 },
  { entityType: "Osprey", health: 1800, power: 0, firingRange: 520, fireRate: 1.2, projectileSpeed: 260, projectileDamage: 55, projectileType: ProjectileType.Projectile3 },
  { entityType: "Kestrel", health: 2500, power: 0, firingRange: 550, fireRate: 1.1, projectileSpeed: 240, projectileDamage: 70, projectileType: ProjectileType.Projectile3 },
  { entityType: "Vulture", health: 3200, power: 0, firingRange: 580, fireRate: 1.0, projectileSpeed: 300, projectileDamage: 90, projectileType: ProjectileType.Projectile3 },
  { entityType: "Talon", health: 4500, power: 0, firingRange: 620, fireRate: 0.9, projectileSpeed: 270, projectileDamage: 120, projectileType: ProjectileType.Projectile4 },
  { entityType: "Warden", health: 6500, power: 0, firingRange: 660, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 160, projectileType: ProjectileType.Projectile4 },
  { entityType: "Behemoth", health: 10000, power: 0, firingRange: 700, fireRate: 0.7, projectileSpeed: 250, projectileDamage: 250, projectileType: ProjectileType.Projectile5 },
  { entityType: "Juggernaut", health: 15000, power: 0, firingRange: 740, fireRate: 2.5, projectileSpeed: 350, projectileDamage: 400, projectileType: ProjectileType.Projectile5 },
  { entityType: "Colossus", health: 22000, power: 0, firingRange: 780, fireRate: 3.0, projectileSpeed: 290, projectileDamage: 600, projectileType: ProjectileType.Projectile6 },
];

export const FRIENDLY_CONFIG_MAP = new Map<string, EnemyConfig>(
  FRIENDLY_CATALOG.map((c) => [c.entityType, c])
);
