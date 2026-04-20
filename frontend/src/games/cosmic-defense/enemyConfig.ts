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
  projectileDamage: number;
  projectileType: ProjectileType;
  range: number;
}

export function goldForEnemy(config: EnemyConfig): number {
  return Math.max(1, Math.round(Math.pow(config.health, 0.6) / 3));
}

export interface FriendlyConfig {
  entityType: EntityType;
  health: number;
  projectileDamage: number;
  projectileType: ProjectileType;
  chargesRequired: number;
  plasmaStacks: number;
  chargesGranted: number;
  laserDamage: number;
  freezeStacks: number;
  chainCount: number;
  buffMultiplier: number;
  fireCount: number;
  beamWidth: number;
  explosionRadius: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Pulse", health: 20, power: 40, fireRate: 2.2, projectileDamage: 4, projectileType: ProjectileType.Tiny, range: 500 },
  { entityType: "Buckler", health: 28, power: 55, fireRate: 2.1, projectileDamage: 5, projectileType: ProjectileType.Tiny, range: 510 },
  { entityType: "Pip", health: 35, power: 70, fireRate: 2.0, projectileDamage: 7, projectileType: ProjectileType.Tiny, range: 520 },
  { entityType: "Flea", health: 48, power: 95, fireRate: 1.9, projectileDamage: 9, projectileType: ProjectileType.Tiny, range: 530 },
  { entityType: "Needle", health: 63, power: 125, fireRate: 1.8, projectileDamage: 11, projectileType: ProjectileType.Projectile2, range: 540 },
  { entityType: "Bolt", health: 85, power: 170, fireRate: 1.7, projectileDamage: 14, projectileType: ProjectileType.Projectile2, range: 550 },
  { entityType: "Cricket", health: 113, power: 225, fireRate: 1.6, projectileDamage: 18, projectileType: ProjectileType.Projectile2, range: 560 },
  { entityType: "Robin", health: 150, power: 300, fireRate: 1.5, projectileDamage: 22, projectileType: ProjectileType.Projectile2, range: 570 },
  { entityType: "Sparrow", health: 200, power: 400, fireRate: 1.4, projectileDamage: 28, projectileType: ProjectileType.Projectile3, range: 580 },
  { entityType: "Hornet", health: 265, power: 530, fireRate: 1.3, projectileDamage: 35, projectileType: ProjectileType.Projectile3, range: 590 },
  { entityType: "Dart", health: 350, power: 700, fireRate: 1.2, projectileDamage: 42, projectileType: ProjectileType.Projectile3, range: 600 },
  { entityType: "Scout", health: 470, power: 940, fireRate: 1.1, projectileDamage: 52, projectileType: ProjectileType.Projectile3, range: 610 },
  { entityType: "Hawk", health: 625, power: 1250, fireRate: 1.0, projectileDamage: 62, projectileType: ProjectileType.Projectile4, range: 620 },
  { entityType: "Dynamo", health: 838, power: 1675, fireRate: 0.95, projectileDamage: 80, projectileType: ProjectileType.Projectile4, range: 630 },
  { entityType: "Harrier", health: 1113, power: 2225, fireRate: 0.9, projectileDamage: 100, projectileType: ProjectileType.Projectile4, range: 640 },
  { entityType: "Raptor", health: 1475, power: 2950, fireRate: 0.85, projectileDamage: 125, projectileType: ProjectileType.Projectile4, range: 650 },
  { entityType: "Eagle", health: 1963, power: 3925, fireRate: 0.8, projectileDamage: 155, projectileType: ProjectileType.Projectile5, range: 660 },
  { entityType: "Corsair", health: 2613, power: 5225, fireRate: 0.8, projectileDamage: 190, projectileType: ProjectileType.Projectile5, range: 670 },
  { entityType: "Vanguard", health: 3475, power: 6950, fireRate: 0.75, projectileDamage: 235, projectileType: ProjectileType.Projectile5, range: 680 },
  { entityType: "Titan", health: 4625, power: 9250, fireRate: 0.7, projectileDamage: 290, projectileType: ProjectileType.Projectile6, range: 690 },
  { entityType: "Dreadnought", health: 6150, power: 12300, fireRate: 0.7, projectileDamage: 355, projectileType: ProjectileType.Projectile6, range: 700 },
  { entityType: "Leviathan", health: 8175, power: 16350, fireRate: 0.65, projectileDamage: 430, projectileType: ProjectileType.Projectile6, range: 710 },
  { entityType: "Flagship", health: 10875, power: 21750, fireRate: 0.6, projectileDamage: 530, projectileType: ProjectileType.Projectile6, range: 720 },
];

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Spur", health: 300, projectileDamage: 40, projectileType: ProjectileType.Projectile5, chargesRequired: 8, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Ember", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 6, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 2, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Corona", health: 150, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 1, plasmaStacks: 0, chargesGranted: 0, laserDamage: 5, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0 },
  { entityType: "Pip", health: 150, projectileDamage: 4, projectileType: ProjectileType.Tiny, chargesRequired: 2, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 2, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Eagle", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 10, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Needle", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, plasmaStacks: 0, chargesGranted: 0, laserDamage: 3, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0 },
  { entityType: "Flare", health: 300, projectileDamage: 8, projectileType: ProjectileType.Projectile4, chargesRequired: 8, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 3, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120 },
  { entityType: "Dart", health: 200, projectileDamage: 6, projectileType: ProjectileType.Projectile3, chargesRequired: 6, plasmaStacks: 2, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120 },
  { entityType: "Moth", health: 200, projectileDamage: 10, projectileType: ProjectileType.Projectile1, chargesRequired: 4, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Prism", health: 150, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 2, plasmaStacks: 0, chargesGranted: 0, laserDamage: 4, freezeStacks: 2, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0 },
  { entityType: "Hawk", health: 200, projectileDamage: 10, projectileType: ProjectileType.Projectile2, chargesRequired: 6, plasmaStacks: 4, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Nova", health: 180, projectileDamage: 5, projectileType: ProjectileType.Projectile1, chargesRequired: 5, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 3, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0 },
  { entityType: "Lance", health: 400, projectileDamage: 0, projectileType: ProjectileType.Projectile6, chargesRequired: 14, plasmaStacks: 0, chargesGranted: 0, laserDamage: 30, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 6, explosionRadius: 0 },
];

export const FRIENDLY_CONFIG_MAP = new Map<string, FriendlyConfig>(
  FRIENDLY_CATALOG.map((c) => [c.entityType, c])
);

export function getScaledConfig(config: FriendlyConfig, level: number): FriendlyConfig {
  if (level <= 1) return config;
  const mult = Math.pow(1.5, level - 1);
  return {
    ...config,
    health: Math.round(config.health * mult),
    projectileDamage: Math.round(config.projectileDamage * mult),
    laserDamage: Math.round(config.laserDamage * mult),
    chargesGranted: config.chargesGranted + Math.floor((level - 1) * 0.5),
    chainCount: config.chainCount + (level - 1),
    freezeStacks: config.freezeStacks + (level - 1),
    buffMultiplier: config.buffMultiplier + (level - 1) * 0.5,
    explosionRadius: config.explosionRadius > 0 ? config.explosionRadius + (level - 1) * 10 : 0,
  };
}
