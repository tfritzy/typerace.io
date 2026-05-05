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

const DEFAULT_PROJECTILE_COLOR = 0xffd700;

const ENEMY_SHIP_PROJECTILE_COLORS: Partial<Record<EntityType, number>> = {
  Pulse: 0xffffaa,
  Buckler: 0x99aacc,
  Pip: 0x88bbff,
  Flea: 0x99ff88,
  Needle: 0x00ffee,
  Bolt: 0xffee00,
  Cricket: 0xaaff44,
  Robin: 0xff9933,
  Sparrow: 0xffcc44,
  Hornet: 0xff8800,
  Dart: 0xcc44ff,
  Scout: 0x4488ff,
  Hawk: 0xff5500,
  Dynamo: 0x0088ff,
  Harrier: 0xff4400,
  Raptor: 0xffaa00,
  Eagle: 0xff6600,
  Corsair: 0xff2233,
  Vanguard: 0x4455ff,
  Titan: 0xcc1122,
  Dreadnought: 0xaa0011,
  Leviathan: 0x880022,
  Flagship: 0xffcc00,
};

export function getProjectileColorForType(entityType: EntityType): number {
  return ENEMY_SHIP_PROJECTILE_COLORS[entityType] ?? DEFAULT_PROJECTILE_COLOR;
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


export const ENEMY_SHIP_TYPES: EntityType[] = [
  "Pulse", "Buckler", "Pip", "Flea", "Needle", "Bolt", "Cricket", "Robin",
  "Sparrow", "Hornet", "Dart", "Scout", "Hawk", "Dynamo", "Harrier", "Raptor",
  "Eagle", "Corsair", "Vanguard", "Titan", "Dreadnought", "Leviathan", "Flagship",
];

export function createEnemyConfigForVirtualTier(virtualTier: number): EnemyConfig {
  const N = ENEMY_SHIP_TYPES.length;
  const slotIndex = virtualTier % N;

  const health = Math.round(BASE_HEALTH * Math.pow(HEALTH_GROWTH, virtualTier));
  const projectileDamage = Math.max(1, Math.round(BASE_PROJECTILE_DAMAGE * Math.pow(DAMAGE_GROWTH, virtualTier)));
  const power = calculateEnemyPower(health);

  return {
    entityType: ENEMY_SHIP_TYPES[slotIndex],
    health,
    fireRate: ENEMY_FIRE_RATE,
    projectileDamage,
    range: BASE_RANGE,
    power,
    xpReward: calculateEnemyXpReward(power),
    sizeScale: 1,
    speed: ENEMY_SPEED,
    isBoss: false,
    projectileColor: getProjectileColorForType(ENEMY_SHIP_TYPES[slotIndex]),
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
  return {
    ...base,
    entityType: ENEMY_SHIP_TYPES[shipTypeIndex],
    health,
    power,
    xpReward: calculateEnemyXpReward(power),
  };
}

export function createBossConfigForVirtualTier(virtualTier: number): EnemyConfig {
  const base = createEnemyConfigForVirtualTier(virtualTier);
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
  freezeStacks: number;
  chainCount: number;
  buffMultiplier: number;
  fireCount: number;
  beamWidth: number;
  explosionRadius: number;
  hitDelay: number;
  damageType: DamageType;
  fireMode: FireMode;
  projectileColor: number;
}

export const ENEMY_CATALOG: EnemyConfig[] = ENEMY_SHIP_TYPES.map((_, i) => createEnemyConfigForVirtualTier(i));

export const FRIENDLY_CATALOG: FriendlyConfig[] = [
  { entityType: "Spur",   health: 300, projectileDamage: 40, chargesRequired: 8,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xffdd00 },
  { entityType: "Ember",  health: 200, projectileDamage: 7,  chargesRequired: 3,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xff7700 },
  { entityType: "Corona", health: 150, projectileDamage: 0,  chargesRequired: 1,  plasmaStacks: 0,  laserDamage: 5,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0xb060e0 },
  { entityType: "Pip",    health: 150, projectileDamage: 8,  chargesRequired: 2,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 2, beamWidth: 0, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x88bbff },
  { entityType: "Eagle",  health: 200, projectileDamage: 0,  chargesRequired: 6,  plasmaStacks: 10, laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Plasma,   fireMode: FireMode.Laser,      projectileColor: 0xff4422 },
  { entityType: "Needle", health: 200, projectileDamage: 0,  chargesRequired: 4,  plasmaStacks: 0,  laserDamage: 3,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0x50e878 },
  { entityType: "Flare",  health: 300, projectileDamage: 8,  chargesRequired: 8,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 3, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0,    damageType: DamageType.Ice,      fireMode: FireMode.Projectile, projectileColor: 0x88eeff },
  { entityType: "Dart",   health: 200, projectileDamage: 0,  chargesRequired: 6,  plasmaStacks: 2,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0.33, damageType: DamageType.Plasma,   fireMode: FireMode.Projectile, projectileColor: 0xcc44ff },
  { entityType: "Moth",   health: 200, projectileDamage: 20, chargesRequired: 4,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x44ff99 },
  { entityType: "Prism",  health: 150, projectileDamage: 0,  chargesRequired: 2,  plasmaStacks: 0,  laserDamage: 4,  freezeStacks: 2, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 2, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Ice,      fireMode: FireMode.Laser,      projectileColor: 0x89b4fa },
  { entityType: "Hawk",   health: 200, projectileDamage: 10, chargesRequired: 6,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 120, hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0xff5500 },
  { entityType: "Nova",   health: 180, projectileDamage: 5,  chargesRequired: 5,  plasmaStacks: 0,  laserDamage: 0,  freezeStacks: 0, chainCount: 3, buffMultiplier: 0, fireCount: 1, beamWidth: 0, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Physical, fireMode: FireMode.Projectile, projectileColor: 0x99ff44 },
  { entityType: "Lance",  health: 400, projectileDamage: 0,  chargesRequired: 14, plasmaStacks: 0,  laserDamage: 30, freezeStacks: 0, chainCount: 0, buffMultiplier: 0, fireCount: 1, beamWidth: 6, explosionRadius: 0,   hitDelay: 0,    damageType: DamageType.Laser,    fireMode: FireMode.Laser,      projectileColor: 0xb060e0 },
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
    plasmaStacks: config.plasmaStacks > 0 ? config.plasmaStacks + (level - 1) : 0,
    buffMultiplier: config.buffMultiplier > 0 ? config.buffMultiplier + (level - 1) * 0.5 : 0,
    explosionRadius: config.explosionRadius > 0 ? config.explosionRadius + (level - 1) * 10 : 0,
  };
}
