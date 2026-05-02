import { type EntityType, DamageType } from "./types";

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

export interface EnemyBaseConfig {
  entityType: EntityType;
  health: number;
  fireRate: number;
  projectileDamage: number;
  range: number;
}

export type EnemyConfig = EnemyBaseConfig & {
  power: number;
  xpReward: number;
  sizeScale: number;
  speed: number;
  isBoss: boolean;
};

const ENEMY_DEFAULTS = { xpReward: 0, sizeScale: 1, isBoss: false } satisfies Partial<EnemyConfig>;

function roundToNearestEven(value: number): number {
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction !== 0.5) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}

function calculateEnemyPower(health: number): number {
  return Math.floor((health * 4 / 3) / 5) * 5;
}

function calculateEnemyXpReward(power: number): number {
  return Math.round(Math.pow(power, 0.72) * 0.2);
}

function calculateEnemySpeed(zeroBasedTier: number): number {
  return (30 + zeroBasedTier * 1.6) * 0.75;
}

function createEnemyConfig(baseConfig: EnemyBaseConfig, zeroBasedTier: number): EnemyConfig {
  const power = calculateEnemyPower(baseConfig.health);
  return {
    ...ENEMY_DEFAULTS,
    ...baseConfig,
    power,
    xpReward: calculateEnemyXpReward(power),
    speed: calculateEnemySpeed(zeroBasedTier),
  };
}

function createBossConfig(config: EnemyConfig): EnemyConfig {
  return {
    ...config,
    health: config.health * 8,
    power: roundToNearestEven(config.power * 2.5),
    projectileDamage: roundToNearestEven(config.projectileDamage * 2.5),
    xpReward: config.xpReward * 5,
    sizeScale: 2.2,
    speed: config.speed * 0.45,
    isBoss: true,
  };
}

export interface FriendlyConfig {
  entityType: EntityType;
  health: number;
  projectileDamage: number;
  chargesRequired: number;
  plasmaStacks: number;
  laserDamage: number;
  freezeStacks: number;
  chainCount: number;
  buffMultiplier: number;
  fireCount: number;
  beamWidth: number;
  explosionRadius: number;
  hitDelay: number;
  damageType: DamageType;
}

const ENEMY_BASE_CATALOG: EnemyBaseConfig[] = [
  { entityType: "Pulse", health: 30, fireRate: 2.2, projectileDamage: 4, range: 500 },
  { entityType: "Buckler", health: 42, fireRate: 2.1, projectileDamage: 5, range: 510 },
  { entityType: "Pip", health: 53, fireRate: 2.0, projectileDamage: 7, range: 520 },
  { entityType: "Flea", health: 72, fireRate: 1.9, projectileDamage: 9, range: 530 },
  { entityType: "Needle", health: 95, fireRate: 1.8, projectileDamage: 11, range: 540 },
  { entityType: "Bolt", health: 128, fireRate: 1.7, projectileDamage: 14, range: 550 },
  { entityType: "Cricket", health: 170, fireRate: 1.6, projectileDamage: 18, range: 560 },
  { entityType: "Robin", health: 225, fireRate: 1.5, projectileDamage: 22, range: 570 },
  { entityType: "Sparrow", health: 300, fireRate: 1.4, projectileDamage: 28, range: 580 },
  { entityType: "Hornet", health: 398, fireRate: 1.3, projectileDamage: 35, range: 590 },
  { entityType: "Dart", health: 525, fireRate: 1.2, projectileDamage: 42, range: 600 },
  { entityType: "Scout", health: 705, fireRate: 1.1, projectileDamage: 52, range: 610 },
  { entityType: "Hawk", health: 938, fireRate: 1.0, projectileDamage: 62, range: 620 },
  { entityType: "Dynamo", health: 1257, fireRate: 0.95, projectileDamage: 80, range: 630 },
  { entityType: "Harrier", health: 1670, fireRate: 0.9, projectileDamage: 100, range: 640 },
  { entityType: "Raptor", health: 2213, fireRate: 0.85, projectileDamage: 125, range: 650 },
  { entityType: "Eagle", health: 2945, fireRate: 0.8, projectileDamage: 155, range: 660 },
  { entityType: "Corsair", health: 3920, fireRate: 0.8, projectileDamage: 190, range: 670 },
  { entityType: "Vanguard", health: 5213, fireRate: 0.75, projectileDamage: 235, range: 680 },
  { entityType: "Titan", health: 6938, fireRate: 0.7, projectileDamage: 290, range: 690 },
  { entityType: "Dreadnought", health: 9225, fireRate: 0.7, projectileDamage: 355, range: 700 },
  { entityType: "Leviathan", health: 12263, fireRate: 0.65, projectileDamage: 430, range: 710 },
  { entityType: "Flagship", health: 16313, fireRate: 0.6, projectileDamage: 530, range: 720 },
];

export const ENEMY_CATALOG: EnemyConfig[] = ENEMY_BASE_CATALOG.map((baseConfig, zeroBasedTier) => createEnemyConfig(baseConfig, zeroBasedTier));

export const BOSS_CATALOG: EnemyConfig[] = ENEMY_CATALOG.map(createBossConfig);

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Spur", health: 300, projectileDamage: 40, chargesRequired: 8, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Ember", health: 200, projectileDamage: 7, chargesRequired: 3, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Corona", health: 150, projectileDamage: 0, chargesRequired: 1, plasmaStacks: 0, laserDamage: 5, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Laser },
  { entityType: "Pip", health: 150, projectileDamage: 8, chargesRequired: 2, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 2, beamWidth: 0, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Eagle", health: 200, projectileDamage: 0, chargesRequired: 6, plasmaStacks: 3, laserDamage: 10, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Plasma },
  { entityType: "Needle", health: 200, projectileDamage: 0, chargesRequired: 4, plasmaStacks: 0, laserDamage: 3, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Laser },
  { entityType: "Flare", health: 300, projectileDamage: 8, chargesRequired: 8, plasmaStacks: 0, laserDamage: 0, freezeStacks: 3, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0, damageType: DamageType.Ice },
  { entityType: "Dart", health: 200, projectileDamage: 0, chargesRequired: 6, plasmaStacks: 2, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0.33, damageType: DamageType.Plasma },
  { entityType: "Moth", health: 200, projectileDamage: 20, chargesRequired: 4, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Prism", health: 150, projectileDamage: 0, chargesRequired: 2, plasmaStacks: 0, laserDamage: 4, freezeStacks: 2, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Ice },
  { entityType: "Hawk", health: 200, projectileDamage: 10, chargesRequired: 6, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Nova", health: 180, projectileDamage: 5, chargesRequired: 5, plasmaStacks: 0, laserDamage: 0, freezeStacks: 0, chainCount: 3, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Physical },
  { entityType: "Lance", health: 400, projectileDamage: 0, chargesRequired: 14, plasmaStacks: 0, laserDamage: 30, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 6, explosionRadius: 0, hitDelay: 0, damageType: DamageType.Laser },
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
    chainCount: config.chainCount > 0 ? config.chainCount + (level - 1) : 0,
    freezeStacks: config.freezeStacks > 0 ? config.freezeStacks + (level - 1) : 0,
    buffMultiplier: config.buffMultiplier > 0 ? config.buffMultiplier + (level - 1) * 0.5 : 0,
    explosionRadius: config.explosionRadius > 0 ? config.explosionRadius + (level - 1) * 10 : 0,
  };
}
