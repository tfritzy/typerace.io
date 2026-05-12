import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_VITAL_MATRIX_BONUS } from "./constants";
import { type EntityType, ColorPreset, ExplosionType, Team, getExplosionType, DamageType, FireMode } from "./types";
import { SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, getScaledConfig, createEnemyConfigForWave, createBossConfigForWave, ENEMY_SHIP_TYPES, getWaveHealthMultiplier } from "./enemyConfig";
import { getShipRole, type ShipRole } from "./shipCatalog";
import { RELIC_CATALOG, computeRelicEffects, type RelicId, type RelicEffects } from "./relics";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
export const ENEMY_SPAWN_CENTER_EXCLUSION_HALF_HEIGHT = 120;
const PLASMA_DAMAGE_PER_TICK = 1;
const LASER_RANGE = 2200;
const SCORE_PER_XP = 10;
const MAX_CHAIN_JUMP_DISTANCE = 300;
const STREAK_MILESTONE_INTERVAL = 5;
const DEATH_EXPLOSION_RADIUS = 100;
export const PROJECTILE_SPEED = 1600;

export enum TargetingMode {
  NearestToPlanet = 0,
  Strongest = 1,
  Weakest = 2,
  Random = 3,
}

export interface EntityState {
  id: number;
  entityType: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  power: number;
  colorPreset: ColorPreset;
  team: Team;
  fireRate: number;
  projectileDamage: number;
  fireTimer: number;
  rotation: number;
  displayRotation: number;
  speed: number;
  chargesRequired: number;
  charge: number;
  xpReward: number;
  range: number;
  hitHalfW: number;
  hitHalfH: number;
  role: ShipRole | null;
  plasmaStacks: number;
  plasmaStacksApplied: number;
  laserDamage: number;
  kills: number;
  damageDealt: number;
  targetingMode: TargetingMode;
  level: number;
  chillDurationSeconds: number;
  chainCount: number;
  buffMultiplier: number;
  buffedNextAttack: boolean;
  fireCount: number;
  projectileSize: number;
  explosionRadius: number;
  hitDelay: number;
  sizeScale: number;
  isBoss: boolean;
  damageType: DamageType;
  fireMode: FireMode;
  projectileColor: number;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shooterId: number;
}

export interface PendingShot {
  fireAt: number;
  shooterId: number;
  targetEntityId: number | null;
}

export interface ExplosionState {
  id: number;
  x: number;
  y: number;
  explosionType: ExplosionType | undefined;
  explosionRadius: number;
}

export interface SpawnState {
  elapsed: number;
  spawnAccumulator: number;
  currentWave: number;
  enemiesSpawnedInWave: number;
  enemiesInWave: number;
  bossWarned: boolean;
  waveShipTypeIndex: number;
}

export class GameEvent {
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export class GameDataEvent<T> {
  private listeners = new Set<(data: T) => void>();

  subscribe(listener: (data: T) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(data: T): void {
    for (const listener of this.listeners) listener(data);
  }
}

export interface DamageData {
  amount: number;
  x: number;
  y: number;
  isPlasma?: boolean;
}

export interface EntityDeathData {
  x: number;
  y: number;
  team: Team;
  entityType: EntityType;
  xpAmount: number;
  sizeScale: number;
}

export interface XPData {
  xp: number;
  level: number;
  xpNeeded: number;
}

export interface ScoreData {
  score: number;
}

export interface BossApproachingData {
  entityType: EntityType;
}

export interface BossSpawnedData {
  id: number;
  entityType: EntityType;
  maxHealth: number;
}

export interface BossDefeatedData {
  id: number;
}

export interface RelicDropData {
  relicId: RelicId;
  x: number;
  y: number;
}

export interface LaserBeam {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
  width: number;
  color: number;
}

export interface GameState {
  entities: EntityState[];
  entityById: Map<number, EntityState>;
  explosions: ExplosionState[];
  laserBeams: LaserBeam[];
  projectiles: ProjectileState[];
  pendingShots: PendingShot[];
  time: {
    time: number;
    deltaTime: number;
  };
  nextId: number;
  planetHealth: number;
  maxPlanetHealth: number;
  spawner: SpawnState;
  xp: number;
  score: number;
  totalKills: number;
  planetHealthFromKills: number;
  level: number;
  pendingChoice: boolean;
  paused: boolean;
  relics: RelicId[];
  relicEffects: RelicEffects;
  perfectWordStreak: number;
  onPlanetDamaged: GameEvent;
  onDamageDealt: GameDataEvent<DamageData>;
  onEnemyEntityDeath: GameDataEvent<EntityDeathData>;
  onXPChanged: GameDataEvent<XPData>;
  onScoreChanged: GameDataEvent<ScoreData>;
  onLevelUp: GameEvent;
  onBossApproaching: GameEvent;
  onBossSpawned: GameDataEvent<BossSpawnedData>;
  onBossDefeated: GameDataEvent<BossDefeatedData>;
  onRelicDropped: GameDataEvent<RelicDropData>;
  onPauseStateChanged: GameDataEvent<boolean>;
  onGameOver: GameEvent;
}

let gameState: GameState | null = null;
const stateCreatedListeners: Array<() => void> = [];

export function getState(): GameState | null {
  return gameState;
}

export function onStateCreated(cb: () => void): () => void {
  if (gameState) {
    cb();
  } else {
    stateCreatedListeners.push(cb);
  }
  return () => {
    const idx = stateCreatedListeners.indexOf(cb);
    if (idx >= 0) stateCreatedListeners.splice(idx, 1);
  };
}

export function createGameState(): GameState {
  const state: GameState = {
    entities: [],
    entityById: new Map(),
    explosions: [],
    laserBeams: [],
    projectiles: [],
    pendingShots: [],
    time: { time: 0, deltaTime: 0 },
    nextId: 1,
    planetHealth: 1000,
    maxPlanetHealth: 1000,
    spawner: {
      elapsed: 0,
      spawnAccumulator: 0,
      currentWave: 0,
      enemiesSpawnedInWave: 0,
      waveShipTypeIndex: INITIAL_WAVE_SHIP_TYPE_INDEX,
      enemiesInWave: getEnemiesInWave(INITIAL_WAVE_SHIP_TYPE_INDEX),
      bossWarned: false,
    },
    xp: 0,
    score: 0,
    totalKills: 0,
    planetHealthFromKills: 0,
    level: 1,
    pendingChoice: true,
    paused: true,
    relics: [],
    relicEffects: computeRelicEffects([]),
    perfectWordStreak: 0,
    onPlanetDamaged: new GameEvent(),
    onDamageDealt: new GameDataEvent<DamageData>(),
    onEnemyEntityDeath: new GameDataEvent<EntityDeathData>(),
    onXPChanged: new GameDataEvent<XPData>(),
    onScoreChanged: new GameDataEvent<ScoreData>(),
    onLevelUp: new GameEvent(),
    onBossApproaching: new GameEvent(),
    onBossSpawned: new GameDataEvent<BossSpawnedData>(),
    onBossDefeated: new GameDataEvent<BossDefeatedData>(),
    onRelicDropped: new GameDataEvent<RelicDropData>(),
    onPauseStateChanged: new GameDataEvent<boolean>(),
    onGameOver: new GameEvent(),
  };

  gameState = state;
  for (const cb of stateCreatedListeners) cb();
  stateCreatedListeners.length = 0;
  return state;
}

function addEntity(state: GameState, entity: EntityState): void {
  state.entities.push(entity);
  state.entityById.set(entity.id, entity);
}

function removeEntityAt(state: GameState, index: number): void {
  const entity = state.entities[index];
  state.entityById.delete(entity.id);
  state.entities.splice(index, 1);
}

function makeBaseEntity(
  state: GameState,
  entityType: EntityType,
  x: number,
  y: number,
  team: Team,
  colorPreset: ColorPreset
): EntityState {
  const hitbox = SHIP_HITBOX_MAP[entityType];
  return {
    id: state.nextId++,
    entityType,
    x,
    y,
    vx: 0,
    vy: 0,
    health: 0,
    maxHealth: 0,
    power: 0,
    colorPreset,
    team,
    fireRate: 0,
    projectileDamage: 0,
    fireTimer: 0,
    rotation: 0,
    displayRotation: 0,
    speed: 0,
    chargesRequired: 0,
    charge: 0,
    xpReward: 0,
    range: 0,
    hitHalfW: hitbox.hitWidth / 2,
    hitHalfH: hitbox.hitHeight / 2,
    role: null,
    plasmaStacks: 0,
    plasmaStacksApplied: 0,
    laserDamage: 0,
    kills: 0,
    damageDealt: 0,
    targetingMode: TargetingMode.NearestToPlanet,
    level: 0,
    chillDurationSeconds: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    fireCount: 1,
    projectileSize: 5,
    explosionRadius: 0,
    hitDelay: 0,
    sizeScale: 1,
    isBoss: false,
    damageType: DamageType.Physical,
    fireMode: FireMode.Projectile,
    projectileColor: 0xffd700,
  };
}

function spawnInRightSixteenth(config: EnemyConfig): { x: number; y: number } {
  const pad = 60;
  const xStart = (CANVAS_WIDTH * 15) / 16;
  const minY = pad;
  const maxY = CANVAS_HEIGHT - pad;
  const hitHalfH = (SHIP_HITBOX_MAP[config.entityType].hitHeight * config.sizeScale) / 2;
  const spawnExclusionHalfHeight = ENEMY_SPAWN_CENTER_EXCLUSION_HALF_HEIGHT + hitHalfH;
  const exclusionTop = Math.max(minY, PLANET_Y - spawnExclusionHalfHeight);
  const exclusionBottom = Math.min(maxY, PLANET_Y + spawnExclusionHalfHeight);
  const topBandHeight = Math.max(0, exclusionTop - minY);
  const bottomBandHeight = Math.max(0, maxY - exclusionBottom);
  const spawnBandTotalHeight = topBandHeight + bottomBandHeight;
  let y: number;
  if (spawnBandTotalHeight <= 0) {
    y = Math.random() < 0.5 ? minY : maxY;
  } else {
    const roll = Math.random() * spawnBandTotalHeight;
    if (roll < topBandHeight) {
      y = minY + Math.random() * topBandHeight;
    } else {
      y = exclusionBottom + Math.random() * bottomBandHeight;
    }
  }
  return {
    x: xStart + Math.random() * (CANVAS_WIDTH - xStart - pad),
    y,
  };
}

export function spawnEntity(state: GameState, config: EnemyConfig, team: Team): void {
  const { x, y } = spawnInRightSixteenth(config);
  const baseEntity = makeBaseEntity(state, config.entityType, x, y, team, ColorPreset.Preset4);
  const entity: EntityState = {
    ...baseEntity,
    ...config,
    maxHealth: config.health,
    fireTimer: Math.random() * config.fireRate,
    rotation: Math.PI,
    displayRotation: Math.PI,
    vx: -config.speed,
    hitHalfW: baseEntity.hitHalfW * config.sizeScale,
    hitHalfH: baseEntity.hitHalfH * config.sizeScale,
  };
  addEntity(state, entity);
  if (entity.isBoss) {
    state.onBossSpawned.emit({ id: entity.id, entityType: entity.entityType, maxHealth: entity.maxHealth });
  }
}

export function spawnAlliedEntity(
  state: GameState,
  config: FriendlyConfig,
  colorPreset: ColorPreset,
  x: number,
  y: number,
  level: number = 1
): number {
  const scaled = getScaledConfig(config, level);
  const entity = makeBaseEntity(state, config.entityType, x, y, Team.Allied, colorPreset);
  entity.health = scaled.health;
  entity.maxHealth = scaled.health;
  entity.projectileDamage = scaled.projectileDamage;
  entity.chargesRequired = config.chargesRequired;
  entity.role = getShipRole(config.entityType);
  entity.plasmaStacksApplied = scaled.plasmaStacks;
  entity.laserDamage = scaled.laserDamage;
  entity.level = level;
  entity.chillDurationSeconds = scaled.chillDurationSeconds;
  entity.chainCount = scaled.chainCount;
  entity.buffMultiplier = scaled.buffMultiplier;
  entity.fireCount = config.fireCount;
  entity.projectileSize = config.projectileSize;
  entity.explosionRadius = scaled.explosionRadius;
  entity.hitDelay = config.hitDelay;
  entity.damageType = config.damageType;
  entity.fireMode = config.fireMode;
  entity.projectileColor = config.projectileColor;
  addEntity(state, entity);
  return entity.id;
}

function isInBounds(x: number, y: number): boolean {
  const pad = 200;
  return (
    x >= -pad &&
    x <= CANVAS_WIDTH + pad &&
    y >= -pad &&
    y <= CANVAS_HEIGHT + pad
  );
}

function checkCollisions(state: GameState): void {
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (e.team === Team.Enemy && !isInBounds(e.x, e.y)) {
      removeEntityAt(state, i);
    }
  }
}

function segmentPointDistSq(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {
    const dx = px - ax; const dy = py - ay;
    return dx * dx + dy * dy;
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  const dx = px - cx; const dy = py - cy;
  return dx * dx + dy * dy;
}

const _targetResult = { x: 0, y: 0, entity: null as EntityState | null };

function findNearestTarget(
  state: GameState,
  entity: EntityState
): { x: number; y: number; entity: EntityState | null } | null {
  if (entity.team === Team.Enemy) {
    _targetResult.x = PLANET_X;
    _targetResult.y = PLANET_Y;
    _targetResult.entity = null;
    return _targetResult;
  }

  let bestScore = -Infinity;
  let found = false;
  const mode = entity.targetingMode;

  if (mode === TargetingMode.Random) {
    for (let attempts = 0; attempts < state.entities.length; attempts++) {
      const target = state.entities[Math.floor(Math.random() * state.entities.length)];
      if (target.team !== Team.Enemy) continue;
      _targetResult.x = target.x;
      _targetResult.y = target.y;
      _targetResult.entity = target;
      return _targetResult;
    }
    for (const target of state.entities) {
      if (target.team !== Team.Enemy) continue;
      _targetResult.x = target.x;
      _targetResult.y = target.y;
      _targetResult.entity = target;
      return _targetResult;
    }
    return null;
  }

  for (const other of state.entities) {
    if (other.team !== Team.Enemy) continue;

    let score: number;
    switch (mode) {
      case TargetingMode.NearestToPlanet: {
        const dx = other.x - PLANET_X;
        const dy = other.y - PLANET_Y;
        score = -(dx * dx + dy * dy);
        break;
      }
      case TargetingMode.Strongest:
        score = other.maxHealth;
        break;
      case TargetingMode.Weakest:
        score = -other.health;
        break;
      default: {
        const dx = entity.x - other.x;
        const dy = entity.y - other.y;
        score = -(dx * dx + dy * dy);
        break;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      _targetResult.x = other.x;
      _targetResult.y = other.y;
      _targetResult.entity = other;
      found = true;
    }
  }

  return found ? _targetResult : null;
}

function applyDeathExplosion(state: GameState, origin: EntityState, apply: (e: EntityState) => void): void {
  const r2 = DEATH_EXPLOSION_RADIUS * DEATH_EXPLOSION_RADIUS;
  for (const other of state.entities) {
    if (other.team !== Team.Enemy || other.id === origin.id) continue;
    const dx = other.x - origin.x;
    const dy = other.y - origin.y;
    if (dx * dx + dy * dy <= r2) apply(other);
  }
}

function findNearestEnemy(state: GameState, origin: EntityState, predicate?: (e: EntityState) => boolean): EntityState | null {
  let nearest: EntityState | null = null;
  let nearestDistSq = Infinity;
  for (const other of state.entities) {
    if (other.team !== Team.Enemy || other.id === origin.id) continue;
    if (predicate && !predicate(other)) continue;
    const dx = other.x - origin.x;
    const dy = other.y - origin.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < nearestDistSq) { nearestDistSq = distSq; nearest = other; }
  }
  return nearest;
}

function findNearestChainTarget(state: GameState, x: number, y: number, excludedIds: Set<number>): EntityState | null {
  let nearest: EntityState | null = null;
  let nearestDistSq = Infinity;
  const maxJumpDistSq = MAX_CHAIN_JUMP_DISTANCE * MAX_CHAIN_JUMP_DISTANCE;
  for (const other of state.entities) {
    if (other.team !== Team.Enemy || excludedIds.has(other.id)) continue;
    const dx = other.x - x;
    const dy = other.y - y;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxJumpDistSq) continue;
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = other;
    }
  }
  return nearest;
}

function applyChillDuration(state: GameState, target: EntityState, durationSeconds: number): void {
  if (durationSeconds <= 0) return;
  target.chillDurationSeconds += durationSeconds;
  if (state.relicEffects.frostNovaDamage > 0) {
    dealDamageToEntity(state, null, target, state.relicEffects.frostNovaDamage);
  }
  if (state.relicEffects.plasmaOnChillApply > 0) {
    target.plasmaStacks += state.relicEffects.plasmaOnChillApply;
  }
}

function dealDamageToEntity(
  state: GameState,
  attacker: EntityState | null,
  target: EntityState,
  damage: number,
  isPlasma = false
): boolean {
  let effectiveDamage = damage;
  if (attacker?.team === Team.Allied && target.team === Team.Enemy) {
    const streakMultiplier = Math.min(1.25, 1 + state.perfectWordStreak * state.relicEffects.streakDamageBonus);
    effectiveDamage = Math.round(effectiveDamage * state.relicEffects.damageMultiplier * streakMultiplier);
    if (state.relicEffects.chilledDamageMultiplier > 1 && target.chillDurationSeconds > 0) {
      effectiveDamage = Math.round(effectiveDamage * state.relicEffects.chilledDamageMultiplier);
    }
    if (state.relicEffects.firstStrikeDamageBonus > 0 && target.health === target.maxHealth) {
      effectiveDamage = Math.round(effectiveDamage * (1 + state.relicEffects.firstStrikeDamageBonus));
    }
    if (state.relicEffects.plasmaDamageBonusPerStack > 0 && target.plasmaStacks > 0) {
      effectiveDamage = Math.round(effectiveDamage * (1 + target.plasmaStacks * state.relicEffects.plasmaDamageBonusPerStack));
    }
    if (state.relicEffects.chillDurationBonusSeconds > 0 && attacker.chillDurationSeconds > 0) applyChillDuration(state, target, state.relicEffects.chillDurationBonusSeconds);
    if (state.relicEffects.plasmaStacksBonus > 0 && attacker.plasmaStacksApplied > 0) target.plasmaStacks += state.relicEffects.plasmaStacksBonus;
    if (state.relicEffects.physicalAgainstPlasmaStacks > 0 && attacker.damageType === DamageType.Physical && target.plasmaStacks > 0) {
      target.plasmaStacks += state.relicEffects.physicalAgainstPlasmaStacks;
    }
    if (state.relicEffects.lifeStealPercent > 0) {
      state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + Math.ceil(effectiveDamage * state.relicEffects.lifeStealPercent));
    }
  }
  target.health -= effectiveDamage;
  if (attacker) attacker.damageDealt += effectiveDamage;

  const killed = target.health <= 0;

  if (killed) {
    if (attacker) attacker.kills++;
    if (target.team === Team.Enemy) {
      state.totalKills++;
      if (state.relicEffects.planetHealPerKill > 0) {
        state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.planetHealPerKill);
      }
      if (state.relicEffects.maxPlanetHealthPerKill > 0 && state.planetHealthFromKills < MAX_VITAL_MATRIX_BONUS) {
        const bonus = Math.min(MAX_VITAL_MATRIX_BONUS - state.planetHealthFromKills, state.relicEffects.maxPlanetHealthPerKill);
        state.planetHealthFromKills += bonus;
        state.maxPlanetHealth += bonus;
        state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + bonus);
      }
      if (attacker && attacker.team === Team.Allied && state.relicEffects.chargesPerKill > 0) {
        grantCharge(state, attacker, state.relicEffects.chargesPerKill);
      }
      if (state.relicEffects.chargesOnChilledKill > 0 && target.chillDurationSeconds > 0) {
        for (const e of state.entities) {
          if (e.team === Team.Allied) grantCharge(state, e, state.relicEffects.chargesOnChilledKill);
        }
      }
      if (state.relicEffects.deathNovaPlasmaStacks > 0) {
        applyDeathExplosion(state, target, (other) => { other.plasmaStacks += state.relicEffects.deathNovaPlasmaStacks; });
      }
      if (state.relicEffects.frostChainChillDurationSeconds > 0 && target.chillDurationSeconds > 0) {
        applyDeathExplosion(state, target, (other) => { other.chillDurationSeconds += state.relicEffects.frostChainChillDurationSeconds; });
      }
      if (state.relicEffects.plasmaDeathSpread > 0 && target.plasmaStacks > 0) {
        applyDeathExplosion(state, target, (other) => { other.plasmaStacks += state.relicEffects.plasmaDeathSpread; });
      }
      if (state.relicEffects.plasmaDeathTransfer > 0 && target.plasmaStacks > 0) {
        const nearest = findNearestEnemy(state, target);
        if (nearest) nearest.plasmaStacks += target.plasmaStacks;
      }
      if (state.relicEffects.chillKillSpreadDurationSeconds > 0 && target.chillDurationSeconds > 0) {
        const nearest = findNearestEnemy(state, target, (e) => e.chillDurationSeconds === 0);
        if (nearest) nearest.chillDurationSeconds += state.relicEffects.chillKillSpreadDurationSeconds;
      }
      const xpAmount = target.xpReward;
      state.score += xpAmount * SCORE_PER_XP;
      state.onScoreChanged.emit({ score: state.score });
      state.onEnemyEntityDeath.emit({
        x: target.x,
        y: target.y,
        team: target.team,
        entityType: target.entityType,
        xpAmount,
        sizeScale: target.sizeScale,
      });
      if (target.isBoss) {
        state.onBossDefeated.emit({ id: target.id });
        const unowned = RELIC_CATALOG.filter((r) => !state.relics.includes(r.id));
        if (unowned.length > 0) {
          const relicIndex = (state.spawner.currentWave - 1) % unowned.length;
          const relicId = unowned[relicIndex].id;
          state.onRelicDropped.emit({ relicId, x: target.x, y: target.y });
        }
      }
    }
    const idx = state.entities.indexOf(target);
    if (idx >= 0) removeEntityAt(state, idx);
  }

  state.onDamageDealt.emit({ amount: damage, x: target.x, y: target.y, isPlasma });

  return killed;
}

function spawnExplosion(state: GameState, entityType: EntityType, x: number, y: number, explosionRadius = 0): void {
  const explosionType = getExplosionType(entityType);
  if (explosionType === undefined) return;
  state.explosions.push({ id: state.nextId++, x, y, explosionType, explosionRadius });
}

function performInstantHit(
  state: GameState,
  shooter: EntityState,
  target: { x: number; y: number; entity: EntityState | null },
  damage: number
): void {
  spawnExplosion(state, shooter.entityType, target.x, target.y, shooter.explosionRadius);

  if (target.entity) {
    dealDamageToEntity(state, shooter, target.entity, damage);
  } else {
    const reducedDamage = shooter.team === Team.Enemy
      ? Math.round(damage * state.relicEffects.planetDamageReduction)
      : damage;
    state.planetHealth = Math.max(0, state.planetHealth - reducedDamage);
    if (state.planetHealth === 0 && !state.paused) {
      pauseGame(state);
      state.onGameOver.emit();
    }
    if (shooter.team === Team.Enemy && reducedDamage > 0) {
      if (state.relicEffects.chargesOnPlanetDamage > 0) {
        for (const e of state.entities) {
          grantCharge(state, e, state.relicEffects.chargesOnPlanetDamage);
        }
      }
      if (state.relicEffects.planetChillOnHitSeconds > 0) {
        applyChillDuration(state, shooter, state.relicEffects.planetChillOnHitSeconds);
      }
    }
    state.onPlanetDamaged.emit();
  }
}

function tickHalfSecond(state: GameState, dt: number): void {
  const prevHalf = Math.floor((state.time.time - dt) * 2);
  const curHalf = Math.floor(state.time.time * 2);
  if (curHalf <= prevHalf) return;

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (e.team !== Team.Enemy) continue;

    if (e.plasmaStacks > 0) {
      const prevStacks = e.plasmaStacks;
      const dmg = e.plasmaStacks * PLASMA_DAMAGE_PER_TICK * state.relicEffects.plasmaDamageMultiplier;
      e.plasmaStacks = Math.max(0, e.plasmaStacks - 1);
      if (dealDamageToEntity(state, null, e, dmg, true)) continue;
      if (prevStacks > 0 && e.plasmaStacks === 0 && state.relicEffects.plasmaExpiredDamage > 0) {
        if (dealDamageToEntity(state, null, e, state.relicEffects.plasmaExpiredDamage)) continue;
      }
    }
  }
}

function tickPerSecond(state: GameState, dt: number): void {
  const prevSecond = Math.floor(state.time.time - dt);
  const curSecond = Math.floor(state.time.time);
  if (curSecond <= prevSecond) return;

  if (state.relicEffects.planetHealPerSecond > 0) {
    state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.planetHealPerSecond);
  }
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (e.team !== Team.Enemy) continue;

    if (e.chillDurationSeconds > 0) {
      e.chillDurationSeconds = Math.max(0, e.chillDurationSeconds - 1);
    }
  }
}

function tickEntities(state: GameState, dt: number): void {
  const enemySpeedMultiplier = state.relicEffects.enemySpeedMultiplier;

  for (const e of state.entities) {
    const isChilled = e.team === Team.Enemy && e.chillDurationSeconds > 0;
    const target = findNearestTarget(state, e);
    let inRange = false;

    if (target) {
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      inRange = e.range <= 0 || dist <= e.range;

      if (inRange) {
        if (e.speed > 0) { e.vx = 0; e.vy = 0; }
        e.rotation = Math.atan2(dy, dx);

        if (e.chargesRequired <= 0) {
          e.fireTimer -= dt / state.relicEffects.enemyFireSlowMultiplier;
          if (e.fireTimer <= 0) {
            e.fireTimer += e.fireRate;
            performInstantHit(state, e, target, e.projectileDamage);
          }
        }
      }
    }

    if (!inRange && e.speed > 0) {
      const plasmaPenalty = state.relicEffects.plasmaSlow > 0 && e.plasmaStacks > 0 ? (1 - state.relicEffects.plasmaSlow) : 1;
      const chillPenalty = isChilled ? 0.5 : 1;
      const effectiveSpeed = e.team === Team.Enemy ? e.speed * enemySpeedMultiplier * plasmaPenalty * chillPenalty : e.speed;
      e.vx = -effectiveSpeed;
      e.vy = 0;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rotation = Math.atan2(e.vy, e.vx);
    }
  }
}

function tickLaserBeams(state: GameState): void {
  const LASER_BEAM_DURATION = 0.35;
  for (let i = state.laserBeams.length - 1; i >= 0; i--) {
    if (state.time.time - state.laserBeams[i].time > LASER_BEAM_DURATION) {
      state.laserBeams.splice(i, 1);
    }
  }
}

function tickPendingShots(state: GameState): void {
  for (let i = state.pendingShots.length - 1; i >= 0; i--) {
    const shot = state.pendingShots[i];
    if (state.time.time < shot.fireAt) continue;
    state.pendingShots.splice(i, 1);

    const shooter = state.entityById.get(shot.shooterId);
    if (!shooter) continue;

    let targetX: number;
    let targetY: number;
    if (shot.targetEntityId !== null) {
      const targetEntity = state.entityById.get(shot.targetEntityId);
      if (targetEntity) {
        targetX = targetEntity.x;
        targetY = targetEntity.y;
      } else {
        const fallback = findNearestTarget(state, shooter);
        if (!fallback) continue;
        targetX = fallback.x;
        targetY = fallback.y;
      }
    } else {
      targetX = PLANET_X;
      targetY = PLANET_Y;
    }

    if (shooter.fireMode === FireMode.Laser) {
      executeLaserShot(state, shooter, targetX, targetY);
    } else {
      executeProjectileShot(state, shooter, targetX, targetY);
    }
  }
}

function executeProjectileShot(state: GameState, shooter: EntityState, targetX: number, targetY: number): void {
  const dx = targetX - shooter.x;
  const dy = targetY - shooter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  state.projectiles.push({
    id: state.nextId++,
    x: shooter.x,
    y: shooter.y,
    vx: (dx / dist) * PROJECTILE_SPEED,
    vy: (dy / dist) * PROJECTILE_SPEED,
    shooterId: shooter.id,
  });
}

function applyHitEffects(state: GameState, shooter: EntityState, target: EntityState, dmg: number): void {
  if (shooter.plasmaStacksApplied > 0) target.plasmaStacks += shooter.plasmaStacksApplied;
  if (shooter.chillDurationSeconds > 0) applyChillDuration(state, target, shooter.chillDurationSeconds);
  dealDamageToEntity(state, shooter, target, dmg);
}

function applyProjectileChains(state: GameState, shooter: EntityState, lastHitTarget: EntityState): void {
  if (shooter.chainCount <= 0) return;
  const dmg = getBuffedDamage(shooter, getEffectiveProjectileDamage(state, shooter));
  const hitIds = new Set<number>([lastHitTarget.id]);
  let currentTarget: EntityState | null = lastHitTarget;
  let chainsRemaining = shooter.chainCount;

  while (currentTarget && chainsRemaining > 0) {
    const nextTarget = findNearestChainTarget(state, currentTarget.x, currentTarget.y, hitIds);
    if (!nextTarget) break;
    hitIds.add(nextTarget.id);
    spawnExplosion(state, shooter.entityType, nextTarget.x, nextTarget.y);
    dealDamageToEntity(state, shooter, nextTarget, dmg);
    currentTarget = nextTarget;
    chainsRemaining--;
  }
}

function applyProjectileHit(state: GameState, proj: ProjectileState, hitEntity: EntityState): void {
  const shooter = state.entityById.get(proj.shooterId);
  if (!shooter) return;

  const dmg = getEffectiveDamage(state, shooter);
  const explosionRadius = shooter.explosionRadius > 0
    ? (shooter.team === Team.Allied ? shooter.explosionRadius * state.relicEffects.explosionRadiusMultiplier : shooter.explosionRadius)
    : 0;

  if (explosionRadius > 0) {
    spawnExplosion(state, shooter.entityType, proj.x, proj.y, explosionRadius);
    const r2 = explosionRadius * explosionRadius;
    for (let k = state.entities.length - 1; k >= 0; k--) {
      const splash = state.entities[k];
      if (splash.team !== Team.Enemy) continue;
      const ex = splash.x - proj.x;
      const ey = splash.y - proj.y;
      if (ex * ex + ey * ey > r2) continue;
      applyHitEffects(state, shooter, splash, dmg);
    }
  } else {
    spawnExplosion(state, shooter.entityType, hitEntity.x, hitEntity.y);
    applyHitEffects(state, shooter, hitEntity, dmg);
  }
  applyProjectileChains(state, shooter, hitEntity);
}

function tickProjectiles(state: GameState, dt: number): void {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    const oldX = proj.x;
    const oldY = proj.y;
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;

    if (!isInBounds(proj.x, proj.y)) {
      state.projectiles.splice(i, 1);
      continue;
    }

    let collided = false;
    for (let j = state.entities.length - 1; j >= 0; j--) {
      const other = state.entities[j];
      if (other.team !== Team.Enemy) continue;
      const r = Math.max(other.hitHalfW, other.hitHalfH);
      if (segmentPointDistSq(oldX, oldY, proj.x, proj.y, other.x, other.y) > r * r) continue;
      applyProjectileHit(state, proj, other);
      collided = true;
      break;
    }
    if (collided) {
      state.projectiles.splice(i, 1);
    }
  }
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  if (state.paused) return;
  tickPerSecond(state, dt);
  tickHalfSecond(state, dt);
  tickEntities(state, dt);
  checkCollisions(state);
  tickLaserBeams(state);
  tickPendingShots(state);
  tickProjectiles(state, dt);
}

function getBuffedDamage(e: EntityState, baseDamage: number): number {
  if (e.buffedNextAttack) {
    e.buffedNextAttack = false;
    return Math.round(baseDamage * 2);
  }
  return baseDamage;
}

function getEffectiveProjectileDamage(state: GameState, shooter: EntityState): number {
  let mult = 1;
  if (shooter.team === Team.Allied) {
    if (shooter.damageType === DamageType.Physical) mult = state.relicEffects.projectileDamageMultiplier;
  }
  return Math.round(shooter.projectileDamage * mult);
}

function getEffectiveLaserDamage(state: GameState, shooter: EntityState): number {
  const mult = shooter.damageType === DamageType.Laser
    ? state.relicEffects.laserDamageMultiplier
    : 1;
  return Math.round(shooter.laserDamage * mult);
}

function getEffectiveDamage(state: GameState, shooter: EntityState): number {
  return getBuffedDamage(
    shooter,
    shooter.laserDamage > 0
      ? getEffectiveLaserDamage(state, shooter)
      : getEffectiveProjectileDamage(state, shooter)
  );
}

function fireShot(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;
  state.pendingShots.push({
    fireAt: state.time.time + e.hitDelay,
    shooterId: e.id,
    targetEntityId: target.entity?.id ?? null,
  });
}

function fireLaser(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;
  state.pendingShots.push({
    fireAt: state.time.time + e.hitDelay,
    shooterId: e.id,
    targetEntityId: target.entity?.id ?? null,
  });
}

function executeLaserShot(state: GameState, e: EntityState, targetX: number, targetY: number): void {
  const dx = targetX - e.x;
  const dy = targetY - e.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;
  const piercing = e.role !== "laser";

  const muzzleOffset = 12;
  const startX = e.x + nx * muzzleOffset;
  const startY = e.y + ny * muzzleOffset;
  const beamLen = piercing ? LASER_RANGE : len;
  const endX = e.x + nx * beamLen;
  const endY = e.y + ny * beamLen;

  const dmg = getEffectiveDamage(state, e);
  const searchRange = piercing ? LASER_RANGE : len + 20;
  const extraHitRadius = e.projectileSize * 5;

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const other = state.entities[i];
    if (other.team !== Team.Enemy) continue;

    const ex = other.x - e.x;
    const ey = other.y - e.y;
    const proj = ex * nx + ey * ny;
    if (proj < 0 || proj > searchRange) continue;

    const perpX = ex - proj * nx;
    const perpY = ey - proj * ny;
    const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);
    const hitRadius = Math.max(other.hitHalfW, other.hitHalfH) + extraHitRadius;
    if (perpDist > hitRadius) continue;

    applyHitEffects(state, e, other, dmg);
    if (!piercing) break;
  }

  state.laserBeams.push({
    id: state.nextId++,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    time: state.time.time,
    width: e.projectileSize,
    color: e.projectileColor,
  });
}

function activateBuffer(state: GameState, e: EntityState): void {
  for (const ally of state.entities) {
    if (ally.id === e.id || ally.team !== Team.Allied) continue;
    if (ally.chargesRequired <= 0) continue;
    if (ally.buffMultiplier > 0) continue;
    ally.buffedNextAttack = true;
  }
}

function grantCharge(state: GameState, e: EntityState, amount: number): void {
  if (e.chargesRequired <= 0) return;
  e.charge += amount;
  activateAbility(state, e);
}

function activateAbility(state: GameState, e: EntityState): void {
  if (e.chargesRequired <= 0) return;
  while (e.charge >= e.chargesRequired) {
    e.charge -= e.chargesRequired;

    if (e.buffMultiplier > 0) {
      activateBuffer(state, e);
      continue;
    }

    if (e.fireMode === FireMode.Laser) {
      fireLaser(state, e);
      continue;
    }

    if (e.explosionRadius > 0) {
      fireShot(state, e);
      continue;
    }

    if (e.projectileDamage > 0 || e.plasmaStacksApplied > 0) {
      for (let f = 0; f < e.fireCount; f++) {
        fireShot(state, e);
      }
      continue;
    }
  }
}

export function onCorrectKeystroke(state: GameState): void {
  if (state.relicEffects.planetRegenPerKeystroke > 0) {
    state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.planetRegenPerKeystroke);
  }
  for (const e of state.entities) {
    grantCharge(state, e, 1);
  }
}

export function onPerfectWord(state: GameState): void {
  state.perfectWordStreak++;
  if (state.relicEffects.planetRegenPerPerfectWord > 0) {
    state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.planetRegenPerPerfectWord);
  }
  if (state.relicEffects.xpPerPerfectWord > 0) {
    awardXP(state, state.relicEffects.xpPerPerfectWord);
  }
  if (state.relicEffects.bonusChargesPerPerfectWord > 0) {
    for (const e of state.entities) {
      grantCharge(state, e, state.relicEffects.bonusChargesPerPerfectWord);
    }
  }
  if (state.relicEffects.perfectWordSplashDamage > 0) {
    const enemies = state.entities.filter(e => e.team === Team.Enemy);
    if (enemies.length > 0) {
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      dealDamageToEntity(state, null, target, state.relicEffects.perfectWordSplashDamage);
    }
  }
  if (state.relicEffects.streakMilestoneDamage > 0 && state.perfectWordStreak % STREAK_MILESTONE_INTERVAL === 0) {
    for (let i = state.entities.length - 1; i >= 0; i--) {
      if (state.entities[i].team === Team.Enemy) {
        dealDamageToEntity(state, null, state.entities[i], state.relicEffects.streakMilestoneDamage);
      }
    }
  }
  if (state.relicEffects.blizzardChillInterval > 0 && state.relicEffects.blizzardChillDurationSeconds > 0 &&
      state.perfectWordStreak % state.relicEffects.blizzardChillInterval === 0) {
    for (const e of state.entities) {
      if (e.team === Team.Enemy) e.chillDurationSeconds += state.relicEffects.blizzardChillDurationSeconds;
    }
  }
  if (state.relicEffects.chillOnPerfectWordSeconds > 0) {
    let nearest: EntityState | null = null;
    let nearestDistSq = Infinity;
    for (const e of state.entities) {
      if (e.team !== Team.Enemy) continue;
      const distSq = e.x * e.x + e.y * e.y;
      if (distSq < nearestDistSq) { nearestDistSq = distSq; nearest = e; }
    }
    if (nearest) applyChillDuration(state, nearest, state.relicEffects.chillOnPerfectWordSeconds);
  }
}

export function onWordWithError(state: GameState): void {
  state.perfectWordStreak = 0;
}

export function addRelic(state: GameState, relicId: RelicId): void {
  state.relics.push(relicId);
  state.relicEffects = computeRelicEffects(state.relics);
}

const BASE_SPAWN_RATE = 0.6;
const MAX_SPAWN_RATE = 4.0;
const SPAWN_RAMP_TIME = 240;
export const BOSS_WARNING_LEAD_TIME_SECONDS = 4;
const MIN_ENEMIES_ON_SCREEN = 10;
const BOSS_WARNING_ENEMIES_REMAINING = 8;
const ENEMIES_PER_WAVE = 50;
const MIN_ENEMIES_PER_WAVE = 5;
const INITIAL_WAVE_SHIP_TYPE_INDEX = Math.floor(ENEMY_SHIP_TYPES.length / 2);

function getEnemiesInWave(shipTypeIndex: number): number {
  const multiplier = getWaveHealthMultiplier(shipTypeIndex);
  return Math.max(MIN_ENEMIES_PER_WAVE, Math.round(ENEMIES_PER_WAVE / multiplier));
}

function getSpawnRate(elapsed: number): number {
  const t = Math.min(1, elapsed / SPAWN_RAMP_TIME);
  return BASE_SPAWN_RATE + (MAX_SPAWN_RATE - BASE_SPAWN_RATE) * t;
}

function spawnWaveEnemy(state: GameState): void {
  const virtualTier = Math.max(0, state.spawner.currentWave);
  spawnEntity(state, createEnemyConfigForWave(virtualTier, state.spawner.waveShipTypeIndex), Team.Enemy);
  state.spawner.enemiesSpawnedInWave++;
}

export function updateSpawner(state: GameState, dt: number): void {
  if (state.paused) return;

  const spawner = state.spawner;
  const remaining = spawner.enemiesInWave - spawner.enemiesSpawnedInWave;

  if (!spawner.bossWarned && remaining <= BOSS_WARNING_ENEMIES_REMAINING) {
    spawner.bossWarned = true;
    state.onBossApproaching.emit();
  }

  if (remaining <= 0) {
    const bossTier = Math.max(0, spawner.currentWave);
    const completedWaveShipTypeIndex = spawner.waveShipTypeIndex;
    spawner.currentWave++;
    spawnEntity(state, createBossConfigForWave(bossTier, completedWaveShipTypeIndex), Team.Enemy);
    spawner.waveShipTypeIndex = Math.floor(Math.random() * ENEMY_SHIP_TYPES.length);
    spawner.enemiesSpawnedInWave = 0;
    spawner.enemiesInWave = getEnemiesInWave(spawner.waveShipTypeIndex);
    spawner.bossWarned = false;
    return;
  }

  const rate = getSpawnRate(spawner.elapsed);
  spawner.spawnAccumulator += rate * dt;

  while (spawner.spawnAccumulator >= 1 && spawner.enemiesSpawnedInWave < spawner.enemiesInWave) {
    spawner.spawnAccumulator -= 1;
    spawnWaveEnemy(state);
  }

  let enemiesOnScreen = 0;
  for (let i = 0; i < state.entities.length; i++) {
    const e = state.entities[i];
    if (e.team === Team.Enemy && !e.isBoss) enemiesOnScreen++;
  }
  const fillCount = Math.min(
    Math.max(0, MIN_ENEMIES_ON_SCREEN - enemiesOnScreen),
    spawner.enemiesInWave - spawner.enemiesSpawnedInWave
  );
  for (let i = 0; i < fillCount; i++) {
    spawnWaveEnemy(state);
  }
}

export function pauseGame(state: GameState): void {
  state.paused = true;
  state.onPauseStateChanged.emit(true);
}

export function unpauseGame(state: GameState): void {
  state.paused = false;
  state.onPauseStateChanged.emit(false);
}

export function xpForNextLevel(level: number): number {
  return Math.round(5 * Math.pow(level, 1.8));
}

export function awardXP(state: GameState, amount: number): void {
  if (state.pendingChoice) return;
  state.xp += Math.round(amount * state.relicEffects.xpMultiplier);
  const needed = xpForNextLevel(state.level);
  if (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    state.pendingChoice = true;
    pauseGame(state);
    state.onLevelUp.emit();
  }
  state.onXPChanged.emit({ xp: state.xp, level: state.level, xpNeeded: xpForNextLevel(state.level) });
}

export function levelUpEntity(state: GameState, entityId: number, config: FriendlyConfig, newLevel: number): void {
  const entity = state.entityById.get(entityId);
  if (!entity) return;
  const scaled = getScaledConfig(config, newLevel);
  entity.level = newLevel;
  entity.maxHealth = scaled.health;
  entity.health = scaled.health;
  entity.projectileDamage = scaled.projectileDamage;
  entity.laserDamage = scaled.laserDamage;
  entity.chainCount = scaled.chainCount;
  entity.chillDurationSeconds = scaled.chillDurationSeconds;
  entity.buffMultiplier = scaled.buffMultiplier;
  entity.explosionRadius = scaled.explosionRadius;
}
