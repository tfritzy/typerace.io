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
  xpReward: number;
  sizeScale: number;
  speedMultiplier: number;
  isBoss: boolean;
}

const ENEMY_DEFAULTS = { xpReward: 0, sizeScale: 1, speedMultiplier: 1, isBoss: false };

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
  hitDelay: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = [
  { ...ENEMY_DEFAULTS, entityType: "Pulse", health: 30, power: 40, fireRate: 2.2, projectileDamage: 4, projectileType: ProjectileType.Tiny, range: 500, xpReward: 3 },
  { ...ENEMY_DEFAULTS, entityType: "Buckler", health: 42, power: 55, fireRate: 2.1, projectileDamage: 5, projectileType: ProjectileType.Tiny, range: 510, xpReward: 3 },
  { ...ENEMY_DEFAULTS, entityType: "Pip", health: 53, power: 70, fireRate: 2.0, projectileDamage: 7, projectileType: ProjectileType.Tiny, range: 520, xpReward: 4 },
  { ...ENEMY_DEFAULTS, entityType: "Flea", health: 72, power: 95, fireRate: 1.9, projectileDamage: 9, projectileType: ProjectileType.Tiny, range: 530, xpReward: 4 },
  { ...ENEMY_DEFAULTS, entityType: "Needle", health: 95, power: 125, fireRate: 1.8, projectileDamage: 11, projectileType: ProjectileType.Projectile2, range: 540, xpReward: 5 },
  { ...ENEMY_DEFAULTS, entityType: "Bolt", health: 128, power: 170, fireRate: 1.7, projectileDamage: 14, projectileType: ProjectileType.Projectile2, range: 550, xpReward: 6 },
  { ...ENEMY_DEFAULTS, entityType: "Cricket", health: 170, power: 225, fireRate: 1.6, projectileDamage: 18, projectileType: ProjectileType.Projectile2, range: 560, xpReward: 7 },
  { ...ENEMY_DEFAULTS, entityType: "Robin", health: 225, power: 300, fireRate: 1.5, projectileDamage: 22, projectileType: ProjectileType.Projectile2, range: 570, xpReward: 9 },
  { ...ENEMY_DEFAULTS, entityType: "Sparrow", health: 300, power: 400, fireRate: 1.4, projectileDamage: 28, projectileType: ProjectileType.Projectile3, range: 580, xpReward: 10 },
  { ...ENEMY_DEFAULTS, entityType: "Hornet", health: 398, power: 530, fireRate: 1.3, projectileDamage: 35, projectileType: ProjectileType.Projectile3, range: 590, xpReward: 12 },
  { ...ENEMY_DEFAULTS, entityType: "Dart", health: 525, power: 700, fireRate: 1.2, projectileDamage: 42, projectileType: ProjectileType.Projectile3, range: 600, xpReward: 14 },
  { ...ENEMY_DEFAULTS, entityType: "Scout", health: 705, power: 940, fireRate: 1.1, projectileDamage: 52, projectileType: ProjectileType.Projectile3, range: 610, xpReward: 17 },
  { ...ENEMY_DEFAULTS, entityType: "Hawk", health: 938, power: 1250, fireRate: 1.0, projectileDamage: 62, projectileType: ProjectileType.Projectile4, range: 620, xpReward: 20 },
  { ...ENEMY_DEFAULTS, entityType: "Dynamo", health: 1257, power: 1675, fireRate: 0.95, projectileDamage: 80, projectileType: ProjectileType.Projectile4, range: 630, xpReward: 24 },
  { ...ENEMY_DEFAULTS, entityType: "Harrier", health: 1670, power: 2225, fireRate: 0.9, projectileDamage: 100, projectileType: ProjectileType.Projectile4, range: 640, xpReward: 29 },
  { ...ENEMY_DEFAULTS, entityType: "Raptor", health: 2213, power: 2950, fireRate: 0.85, projectileDamage: 125, projectileType: ProjectileType.Projectile4, range: 650, xpReward: 34 },
  { ...ENEMY_DEFAULTS, entityType: "Eagle", health: 2945, power: 3925, fireRate: 0.8, projectileDamage: 155, projectileType: ProjectileType.Projectile5, range: 660, xpReward: 40 },
  { ...ENEMY_DEFAULTS, entityType: "Corsair", health: 3920, power: 5225, fireRate: 0.8, projectileDamage: 190, projectileType: ProjectileType.Projectile5, range: 670, xpReward: 48 },
  { ...ENEMY_DEFAULTS, entityType: "Vanguard", health: 5213, power: 6950, fireRate: 0.75, projectileDamage: 235, projectileType: ProjectileType.Projectile5, range: 680, xpReward: 57 },
  { ...ENEMY_DEFAULTS, entityType: "Titan", health: 6938, power: 9250, fireRate: 0.7, projectileDamage: 290, projectileType: ProjectileType.Projectile6, range: 690, xpReward: 67 },
  { ...ENEMY_DEFAULTS, entityType: "Dreadnought", health: 9225, power: 12300, fireRate: 0.7, projectileDamage: 355, projectileType: ProjectileType.Projectile6, range: 700, xpReward: 80 },
  { ...ENEMY_DEFAULTS, entityType: "Leviathan", health: 12263, power: 16350, fireRate: 0.65, projectileDamage: 430, projectileType: ProjectileType.Projectile6, range: 710, xpReward: 95 },
  { ...ENEMY_DEFAULTS, entityType: "Flagship", health: 16313, power: 21750, fireRate: 0.6, projectileDamage: 530, projectileType: ProjectileType.Projectile6, range: 720, xpReward: 112 },
];

export const BOSS_CATALOG: EnemyConfig[] = [
  { ...ENEMY_CATALOG[0], health: 240, power: 100, projectileDamage: 10, xpReward: 15, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[1], health: 336, power: 138, projectileDamage: 12, xpReward: 15, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[2], health: 424, power: 175, projectileDamage: 18, xpReward: 20, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[3], health: 576, power: 238, projectileDamage: 22, xpReward: 20, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[4], health: 760, power: 312, projectileDamage: 28, xpReward: 25, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[5], health: 1024, power: 425, projectileDamage: 35, xpReward: 30, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[6], health: 1360, power: 562, projectileDamage: 45, xpReward: 35, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[7], health: 1800, power: 750, projectileDamage: 55, xpReward: 45, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[8], health: 2400, power: 1000, projectileDamage: 70, xpReward: 50, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[9], health: 3184, power: 1325, projectileDamage: 88, xpReward: 60, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[10], health: 4200, power: 1750, projectileDamage: 105, xpReward: 70, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[11], health: 5640, power: 2350, projectileDamage: 130, xpReward: 85, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[12], health: 7504, power: 3125, projectileDamage: 155, xpReward: 100, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[13], health: 10056, power: 4188, projectileDamage: 200, xpReward: 120, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[14], health: 13360, power: 5562, projectileDamage: 250, xpReward: 145, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[15], health: 17704, power: 7375, projectileDamage: 312, xpReward: 170, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[16], health: 23560, power: 9812, projectileDamage: 388, xpReward: 200, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[17], health: 31360, power: 13062, projectileDamage: 475, xpReward: 240, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[18], health: 41704, power: 17375, projectileDamage: 588, xpReward: 285, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[19], health: 55504, power: 23125, projectileDamage: 725, xpReward: 335, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[20], health: 73800, power: 30750, projectileDamage: 888, xpReward: 400, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[21], health: 98104, power: 40875, projectileDamage: 1075, xpReward: 475, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
  { ...ENEMY_CATALOG[22], health: 130504, power: 54375, projectileDamage: 1325, xpReward: 560, sizeScale: 2.2, speedMultiplier: 0.45, isBoss: true },
];

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Spur", health: 300, projectileDamage: 40, projectileType: ProjectileType.Projectile5, chargesRequired: 8, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Ember", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 6, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 2, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Corona", health: 150, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 1, plasmaStacks: 0, chargesGranted: 0, laserDamage: 5, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Pip", health: 150, projectileDamage: 4, projectileType: ProjectileType.Tiny, chargesRequired: 2, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 2, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Eagle", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 10, plasmaStacks: 0, chargesGranted: 1, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Needle", health: 200, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 4, plasmaStacks: 0, chargesGranted: 0, laserDamage: 3, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Flare", health: 300, projectileDamage: 8, projectileType: ProjectileType.Projectile4, chargesRequired: 8, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 3, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0 },
  { entityType: "Dart", health: 200, projectileDamage: 0, projectileType: ProjectileType.Projectile3, chargesRequired: 6, plasmaStacks: 2, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0.33 },
  { entityType: "Moth", health: 200, projectileDamage: 10, projectileType: ProjectileType.Projectile1, chargesRequired: 4, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Prism", health: 150, projectileDamage: 0, projectileType: ProjectileType.Tiny, chargesRequired: 2, plasmaStacks: 0, chargesGranted: 0, laserDamage: 4, freezeStacks: 2, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Hawk", health: 200, projectileDamage: 10, projectileType: ProjectileType.Projectile2, chargesRequired: 6, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0 },
  { entityType: "Nova", health: 180, projectileDamage: 5, projectileType: ProjectileType.Projectile1, chargesRequired: 5, plasmaStacks: 0, chargesGranted: 0, laserDamage: 0, freezeStacks: 0, chainCount: 3, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0 },
  { entityType: "Lance", health: 400, projectileDamage: 0, projectileType: ProjectileType.Projectile6, chargesRequired: 14, plasmaStacks: 0, chargesGranted: 0, laserDamage: 30, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 6, explosionRadius: 0, hitDelay: 0 },
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
    chargesGranted: config.chargesGranted > 0 ? config.chargesGranted + (level - 1) : 0,
    chainCount: config.chainCount > 0 ? config.chainCount + (level - 1) : 0,
    freezeStacks: config.freezeStacks > 0 ? config.freezeStacks + (level - 1) : 0,
    buffMultiplier: config.buffMultiplier > 0 ? config.buffMultiplier + (level - 1) * 0.5 : 0,
    explosionRadius: config.explosionRadius > 0 ? config.explosionRadius + (level - 1) * 10 : 0,
  };
}
