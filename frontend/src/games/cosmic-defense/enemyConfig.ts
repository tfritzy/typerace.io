import { type EntityType, ProjectileType } from "./types";

export interface ShipHitbox {
  hitWidth: number;
  hitHeight: number;
}

export const SHIP_HITBOX_MAP: Record<EntityType, ShipHitbox> = {
  Vanguard: { hitWidth: 96, hitHeight: 87 },
  Sentinel: { hitWidth: 66, hitHeight: 84 },
  Corsair: { hitWidth: 99, hitHeight: 72 },
  Dynamo: { hitWidth: 90, hitHeight: 72 },
  Scout: { hitWidth: 63, hitHeight: 60 },
  Dart: { hitWidth: 66, hitHeight: 60 },
  Wasp: { hitWidth: 72, hitHeight: 57 },
  Inferno: { hitWidth: 78, hitHeight: 81 },
  Hawk: { hitWidth: 75, hitHeight: 66 },
  Sparrow: { hitWidth: 69, hitHeight: 60 },
  Gnat: { hitWidth: 51, hitHeight: 54 },
  Stinger: { hitWidth: 72, hitHeight: 57 },
  Needle: { hitWidth: 66, hitHeight: 48 },
  Pulse: { hitWidth: 48, hitHeight: 30 },
  Titan: { hitWidth: 96, hitHeight: 81 },
  Raptor: { hitWidth: 78, hitHeight: 72 },
  Lance: { hitWidth: 99, hitHeight: 60 },
  Grace: { hitWidth: 114, hitHeight: 60 },
  Pip: { hitWidth: 42, hitHeight: 48 },
  Raven: { hitWidth: 78, hitHeight: 87 },
  Osprey: { hitWidth: 66, hitHeight: 84 },
  Leviathan: { hitWidth: 144, hitHeight: 81 },
  Talon: { hitWidth: 75, hitHeight: 75 },
  Hornet: { hitWidth: 63, hitHeight: 54 },
  Bastion: { hitWidth: 99, hitHeight: 93 },
  Dreadnought: { hitWidth: 171, hitHeight: 87 },
  Marauder: { hitWidth: 117, hitHeight: 78 },
  Eagle: { hitWidth: 84, hitHeight: 72 },
  Mender: { hitWidth: 60, hitHeight: 48 },
  Tender: { hitWidth: 69, hitHeight: 48 },
  Haven: { hitWidth: 111, hitHeight: 90 },
  Warden: { hitWidth: 96, hitHeight: 78 },
  Prism: { hitWidth: 60, hitHeight: 69 },
  Harrier: { hitWidth: 84, hitHeight: 66 },
  Viper: { hitWidth: 69, hitHeight: 60 },
  Flea: { hitWidth: 45, hitHeight: 54 },
  Broadside: { hitWidth: 108, hitHeight: 72 },
  Kestrel: { hitWidth: 78, hitHeight: 63 },
  Flare: { hitWidth: 63, hitHeight: 57 },
  Striker: { hitWidth: 81, hitHeight: 57 },
  Robin: { hitWidth: 63, hitHeight: 51 },
  Cricket: { hitWidth: 69, hitHeight: 54 },
  Moth: { hitWidth: 60, hitHeight: 48 },
  Colossus: { hitWidth: 117, hitHeight: 93 },
  Cutlass: { hitWidth: 102, hitHeight: 69 },
  Sabre: { hitWidth: 105, hitHeight: 72 },
  Mantis: { hitWidth: 69, hitHeight: 63 },
  Buckler: { hitWidth: 48, hitHeight: 42 },
  Crest: { hitWidth: 66, hitHeight: 66 },
  Ember: { hitWidth: 69, hitHeight: 66 },
  Vulture: { hitWidth: 78, hitHeight: 63 },
  Nova: { hitWidth: 63, hitHeight: 63 },
  Ward: { hitWidth: 63, hitHeight: 54 },
  Barb: { hitWidth: 75, hitHeight: 54 },
  Spark: { hitWidth: 72, hitHeight: 51 },
  Flagship: { hitWidth: 114, hitHeight: 75 },
  Aegis: { hitWidth: 75, hitHeight: 75 },
  Bolt: { hitWidth: 72, hitHeight: 66 },
  Spur: { hitWidth: 78, hitHeight: 63 },
  Dot: { hitWidth: 57, hitHeight: 57 },
  Corona: { hitWidth: 87, hitHeight: 63 },
  Clipper: { hitWidth: 66, hitHeight: 54 },
};

export interface EnemyConfig {
  entityType: EntityType;
  health: number;
  power: number;
  fireRate: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  range: number;
}

export function goldForEnemy(config: EnemyConfig): number {
  return Math.round(Math.pow(config.health, 0.6));
}

export interface FriendlyConfig {
  entityType: EntityType;
  health: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  chargesRequired: number;
  healAmount: number;
  shieldAmount: number;
  plasmaStacks: number;
  chargesGranted: number;
  laserDamage: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Pulse", health: 40, power: 40, fireRate: 2.2, projectileSpeed: 170, projectileDamage: 4, projectileType: ProjectileType.Tiny, range: 250 },
  { entityType: "Buckler", health: 55, power: 55, fireRate: 2.1, projectileSpeed: 180, projectileDamage: 5, projectileType: ProjectileType.Tiny, range: 255 },
  { entityType: "Pip", health: 70, power: 70, fireRate: 2.0, projectileSpeed: 190, projectileDamage: 7, projectileType: ProjectileType.Tiny, range: 260 },
  { entityType: "Flea", health: 95, power: 95, fireRate: 1.9, projectileSpeed: 200, projectileDamage: 9, projectileType: ProjectileType.Tiny, range: 265 },
  { entityType: "Needle", health: 125, power: 125, fireRate: 1.8, projectileSpeed: 210, projectileDamage: 11, projectileType: ProjectileType.Projectile2, range: 270 },
  { entityType: "Bolt", health: 170, power: 170, fireRate: 1.7, projectileSpeed: 220, projectileDamage: 14, projectileType: ProjectileType.Projectile2, range: 275 },
  { entityType: "Cricket", health: 225, power: 225, fireRate: 1.6, projectileSpeed: 230, projectileDamage: 18, projectileType: ProjectileType.Projectile2, range: 280 },
  { entityType: "Robin", health: 300, power: 300, fireRate: 1.5, projectileSpeed: 235, projectileDamage: 22, projectileType: ProjectileType.Projectile2, range: 285 },
  { entityType: "Sparrow", health: 400, power: 400, fireRate: 1.4, projectileSpeed: 240, projectileDamage: 28, projectileType: ProjectileType.Projectile3, range: 290 },
  { entityType: "Hornet", health: 530, power: 530, fireRate: 1.3, projectileSpeed: 250, projectileDamage: 35, projectileType: ProjectileType.Projectile3, range: 295 },
  { entityType: "Dart", health: 700, power: 700, fireRate: 1.2, projectileSpeed: 260, projectileDamage: 42, projectileType: ProjectileType.Projectile3, range: 300 },
  { entityType: "Scout", health: 940, power: 940, fireRate: 1.1, projectileSpeed: 270, projectileDamage: 52, projectileType: ProjectileType.Projectile3, range: 305 },
  { entityType: "Hawk", health: 1250, power: 1250, fireRate: 1.0, projectileSpeed: 280, projectileDamage: 62, projectileType: ProjectileType.Projectile4, range: 310 },
  { entityType: "Dynamo", health: 1675, power: 1675, fireRate: 0.95, projectileSpeed: 290, projectileDamage: 80, projectileType: ProjectileType.Projectile4, range: 315 },
  { entityType: "Harrier", health: 2225, power: 2225, fireRate: 0.9, projectileSpeed: 300, projectileDamage: 100, projectileType: ProjectileType.Projectile4, range: 320 },
  { entityType: "Raptor", health: 2950, power: 2950, fireRate: 0.85, projectileSpeed: 310, projectileDamage: 125, projectileType: ProjectileType.Projectile4, range: 325 },
  { entityType: "Eagle", health: 3925, power: 3925, fireRate: 0.8, projectileSpeed: 320, projectileDamage: 155, projectileType: ProjectileType.Projectile5, range: 330 },
  { entityType: "Corsair", health: 5225, power: 5225, fireRate: 0.8, projectileSpeed: 330, projectileDamage: 190, projectileType: ProjectileType.Projectile5, range: 335 },
  { entityType: "Vanguard", health: 6950, power: 6950, fireRate: 0.75, projectileSpeed: 340, projectileDamage: 235, projectileType: ProjectileType.Projectile5, range: 340 },
  { entityType: "Titan", health: 9250, power: 9250, fireRate: 0.7, projectileSpeed: 350, projectileDamage: 290, projectileType: ProjectileType.Projectile6, range: 345 },
  { entityType: "Dreadnought", health: 12300, power: 12300, fireRate: 0.7, projectileSpeed: 360, projectileDamage: 355, projectileType: ProjectileType.Projectile6, range: 350 },
  { entityType: "Leviathan", health: 16350, power: 16350, fireRate: 0.65, projectileSpeed: 370, projectileDamage: 430, projectileType: ProjectileType.Projectile6, range: 355 },
  { entityType: "Flagship", health: 21750, power: 21750, fireRate: 0.6, projectileSpeed: 380, projectileDamage: 530, projectileType: ProjectileType.Projectile6, range: 360 },
];

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Moth", health: 200, projectileDamage: 8, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Needle", health: 800, projectileDamage: 40, projectileType: ProjectileType.Projectile2, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Clipper", health: 3000, projectileDamage: 200, projectileType: ProjectileType.Projectile3, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Warden", health: 12000, projectileDamage: 1000, projectileType: ProjectileType.Projectile5, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },

  { entityType: "Osprey", health: 150, projectileDamage: 5, projectileType: ProjectileType.Tiny, chargesRequired: 2, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Raven", health: 600, projectileDamage: 25, projectileType: ProjectileType.Projectile2, chargesRequired: 2, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Vanguard", health: 2500, projectileDamage: 130, projectileType: ProjectileType.Projectile3, chargesRequired: 2, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Titan", health: 10000, projectileDamage: 650, projectileType: ProjectileType.Projectile5, chargesRequired: 2, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },

  { entityType: "Mender", health: 250, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 25, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Tender", health: 1000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 100, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Grace", health: 4000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 400, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Haven", health: 15000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 3, healAmount: 1500, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },

  { entityType: "Buckler", health: 250, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 0, shieldAmount: 40, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Ward", health: 1000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 0, shieldAmount: 160, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Aegis", health: 4000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 0, shieldAmount: 640, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Bastion", health: 15000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 3, healAmount: 0, shieldAmount: 2500, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0 },

  { entityType: "Spark", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 1, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Ember", health: 800, projectileDamage: 0, projectileType: ProjectileType.Projectile2, chargesRequired: 4, healAmount: 0, shieldAmount: 0, plasmaStacks: 2, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Corona", health: 3000, projectileDamage: 0, projectileType: ProjectileType.Projectile3, chargesRequired: 3, healAmount: 0, shieldAmount: 0, plasmaStacks: 3, chargesGranted: 0, laserDamage: 0 },
  { entityType: "Inferno", health: 12000, projectileDamage: 0, projectileType: ProjectileType.Projectile5, chargesRequired: 3, healAmount: 0, shieldAmount: 0, plasmaStacks: 5, chargesGranted: 0, laserDamage: 0 },

  { entityType: "Pulse", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 8, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0 },
  { entityType: "Flare", health: 800, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 7, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0 },
  { entityType: "Bolt", health: 3000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 6, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0 },
  { entityType: "Dynamo", health: 12000, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 5, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0 },

  { entityType: "Prism", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 5, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 10 },
  { entityType: "Nova", health: 800, projectileDamage: 0, projectileType: ProjectileType.Projectile2, chargesRequired: 5, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 50 },
  { entityType: "Sabre", health: 3000, projectileDamage: 0, projectileType: ProjectileType.Projectile3, chargesRequired: 5, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 250 },
  { entityType: "Leviathan", health: 12000, projectileDamage: 0, projectileType: ProjectileType.Projectile6, chargesRequired: 6, healAmount: 0, shieldAmount: 0, plasmaStacks: 0, chargesGranted: 0, laserDamage: 1200 },
];

export const FRIENDLY_CONFIG_MAP = new Map<string, FriendlyConfig>(
  FRIENDLY_CATALOG.map((c) => [c.entityType, c])
);
