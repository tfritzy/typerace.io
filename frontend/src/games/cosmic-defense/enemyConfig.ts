import { type EntityType, DamageType, FireMode } from "./types";

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
  fireRate: number;
  projectileDamage: number;
  range: number;
  power: number;
  xpReward: number;
  sizeScale: number;
  speed: number;
  isBoss: boolean;
  projectileColor: number;
}

const BASE_HEALTH = 30;
const HEALTH_GROWTH = 1.33;
const ENEMY_FIRE_RATE = 1.2;
const BASE_PROJECTILE_DAMAGE = 8;
const DAMAGE_GROWTH = 1.008;
const BASE_RANGE = 500;
const ENEMY_SPEED = 22.5;

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


interface EnemyShipBaseConfig {
  entityType: EntityType;
  projectileColor: number;
}

export const ENEMY_SHIP_CATALOG: EnemyShipBaseConfig[] = [
  { entityType: "Pulse",       projectileColor: 0xffffaa },
  { entityType: "Buckler",     projectileColor: 0x99aacc },
  { entityType: "Pip",         projectileColor: 0x88bbff },
  { entityType: "Flea",        projectileColor: 0x99ff88 },
  { entityType: "Needle",      projectileColor: 0x00ffee },
  { entityType: "Bolt",        projectileColor: 0xffee00 },
  { entityType: "Cricket",     projectileColor: 0xaaff44 },
  { entityType: "Robin",       projectileColor: 0xff9933 },
  { entityType: "Sparrow",     projectileColor: 0xffcc44 },
  { entityType: "Hornet",      projectileColor: 0xff8800 },
  { entityType: "Dart",        projectileColor: 0xcc44ff },
  { entityType: "Scout",       projectileColor: 0x4488ff },
  { entityType: "Hawk",        projectileColor: 0xff5500 },
  { entityType: "Dynamo",      projectileColor: 0x0088ff },
  { entityType: "Harrier",     projectileColor: 0xff4400 },
  { entityType: "Raptor",      projectileColor: 0xffaa00 },
  { entityType: "Eagle",       projectileColor: 0xff6600 },
  { entityType: "Corsair",     projectileColor: 0xff2233 },
  { entityType: "Vanguard",    projectileColor: 0x4455ff },
  { entityType: "Titan",       projectileColor: 0xcc1122 },
  { entityType: "Dreadnought", projectileColor: 0xaa0011 },
  { entityType: "Leviathan",   projectileColor: 0x880022 },
  { entityType: "Flagship",    projectileColor: 0xffcc00 },
];

export const ENEMY_SHIP_TYPES: EntityType[] = ENEMY_SHIP_CATALOG.map(c => c.entityType);

export function createEnemyConfigForVirtualTier(virtualTier: number): EnemyConfig {
  const N = ENEMY_SHIP_CATALOG.length;
  const slotIndex = virtualTier % N;
  const ship = ENEMY_SHIP_CATALOG[slotIndex];

  const health = Math.round(BASE_HEALTH * Math.pow(HEALTH_GROWTH, virtualTier));
  const projectileDamage = Math.max(1, Math.round(BASE_PROJECTILE_DAMAGE * Math.pow(DAMAGE_GROWTH, virtualTier)));
  const power = calculateEnemyPower(health);

  return {
    entityType: ship.entityType,
    health,
    fireRate: ENEMY_FIRE_RATE,
    projectileDamage,
    range: BASE_RANGE,
    power,
    xpReward: calculateEnemyXpReward(power),
    sizeScale: 1,
    speed: ENEMY_SPEED,
    isBoss: false,
    projectileColor: ship.projectileColor,
  };
}

export function getWaveHealthMultiplier(shipTypeIndex: number): number {
  const N = ENEMY_SHIP_TYPES.length;
  return 0.25 * Math.pow(16, shipTypeIndex / (N - 1));
}

export function createEnemyConfigForWave(virtualTier: number, shipTypeIndex: number): EnemyConfig {
  const base = createEnemyConfigForVirtualTier(virtualTier);
  const multiplier = getWaveHealthMultiplier(shipTypeIndex);
  const health = Math.max(1, Math.round(base.health * multiplier));
  const power = calculateEnemyPower(health);
  const ship = ENEMY_SHIP_CATALOG[shipTypeIndex];
  return {
    ...base,
    entityType: ship.entityType,
    health,
    power,
    xpReward: calculateEnemyXpReward(power),
    projectileColor: ship.projectileColor,
  };
}

export function createBossConfigForWave(virtualTier: number, shipTypeIndex: number): EnemyConfig {
  const base = createEnemyConfigForWave(virtualTier, shipTypeIndex);
  return {
    ...base,
    health: base.health * 8,
    power: roundToNearestEven(base.power * 2.5),
    projectileDamage: roundToNearestEven(base.projectileDamage * 2.5),
    xpReward: base.xpReward * 5,
    sizeScale: 2.2,
    speed: base.speed,
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
  chillDurationSeconds: number;
  chainCount: number;
  buffMultiplier: number;
  fireCount: number;
  projectileSize: number;
  explosionRadius: number;
  hitDelay: number;
  damageType: DamageType;
  fireMode: FireMode;
  projectileColor: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = ENEMY_SHIP_TYPES.map((_, i) => createEnemyConfigForVirtualTier(i));

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Spur",   health: 300, projectileDamage: 40, chargesRequired: 8,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 9, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xffdd00 },
  { entityType: "Ember",  health: 200, projectileDamage: 12, chargesRequired: 3,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 4, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xff7700 },
  { entityType: "Corona", health: 150, projectileDamage: 0,  chargesRequired: 1,  plasmaStacks: 0,  laserDamage: 5,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0xb060e0 },
  { entityType: "Pip",    health: 150, projectileDamage: 5,  chargesRequired: 2,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 2, projectileSize: 3, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x88bbff },
  { entityType: "Eagle",  health: 200, projectileDamage: 0,  chargesRequired: 6,  plasmaStacks: 8,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Plasma,   fireMode: FireMode.Laser,      projectileColor: 0xff4422 },
  { entityType: "Needle", health: 200, projectileDamage: 0,  chargesRequired: 4,  plasmaStacks: 0,  laserDamage: 6,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0x50e878 },
  { entityType: "Flare",  health: 300, projectileDamage: 14, chargesRequired: 8,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 3, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 6, explosionRadius: 120, hitDelay: 0,    damageType: DamageType.Ice,      fireMode: FireMode.Projectile, projectileColor: 0x88eeff },
  { entityType: "Dart",   health: 200, projectileDamage: 0,  chargesRequired: 6,  plasmaStacks: 10, laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 5, explosionRadius: 120, hitDelay: 0.33, damageType: DamageType.Plasma,   fireMode: FireMode.Projectile, projectileColor: 0xcc44ff },
  { entityType: "Moth",   health: 200, projectileDamage: 20, chargesRequired: 4,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 7, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x44ff99 },
  { entityType: "Prism",  health: 150, projectileDamage: 0,  chargesRequired: 3,  plasmaStacks: 0,  laserDamage: 4,  chillDurationSeconds: 2, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Ice,      fireMode: FireMode.Laser,      projectileColor: 0x89b4fa },
  { entityType: "Hawk",   health: 200, projectileDamage: 18, chargesRequired: 6,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 6, explosionRadius: 120, hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xff5500 },
  { entityType: "Nova",   health: 180, projectileDamage: 8,  chargesRequired: 5,  plasmaStacks: 0,  laserDamage: 0,  chillDurationSeconds: 0, chainCount: 3, buffMultiplier: 0, fireCount: 1, projectileSize: 4, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x99ff44 },
  { entityType: "Lance",  health: 400, projectileDamage: 0,  chargesRequired: 10, plasmaStacks: 0,  laserDamage: 30, chillDurationSeconds: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, projectileSize: 6, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0xb060e0 },
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
    chillDurationSeconds: config.chillDurationSeconds > 0 ? config.chillDurationSeconds + (level - 1) : 0,
    plasmaStacks: config.plasmaStacks > 0 ? config.plasmaStacks + (level - 1) : 0,
    buffMultiplier: config.buffMultiplier > 0 ? config.buffMultiplier + (level - 1) * 0.5 : 0,
    explosionRadius: config.explosionRadius > 0 ? config.explosionRadius + (level - 1) * 10 : 0,
  };
}
