import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_VITAL_MATRIX_BONUS } from "./constants";
import { type EntityType, ColorPreset, ProjectileType, ExplosionType, Team, getExplosionType, DamageType } from "./types";
import { ENEMY_CATALOG, BOSS_CATALOG, SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, getScaledConfig } from "./enemyConfig";
import { getShipRole, type ShipRole } from "./shipCatalog";
import { RELIC_CATALOG, computeRelicEffects, type RelicId, type RelicEffects } from "./relics";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLASMA_DAMAGE_PER_TICK = 1;
const LASER_RANGE = 2200;
const SCORE_PER_XP = 10;
const MAX_CHAIN_JUMP_DISTANCE = 300;
const STREAK_MILESTONE_INTERVAL = 5;
const DEATH_EXPLOSION_RADIUS = 100;

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
  projectileType: ProjectileType;
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
  chargesGranted: number;
  laserDamage: number;
  kills: number;
  damageDealt: number;
  targetingMode: TargetingMode;
  level: number;
  freezeStacks: number;
  chainCount: number;
  buffMultiplier: number;
  buffedNextAttack: boolean;
  fireCount: number;
  beamWidth: number;
  explosionRadius: number;
  hitDelay: number;
  sizeScale: number;
  isBoss: boolean;
  damageType: DamageType;
}

export interface PendingShot {
  fireAt: number;
  shooterId: number;
  targetX: number;
  targetY: number;
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
  paused: boolean;
  nextBossTier: number;
  warnedBossTier: number;
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
}

export interface EntityDeathData {
  x: number;
  y: number;
  team: Team;
  entityType: EntityType;
  xpAmount: number;
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

export interface LaserBeam {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
  width: number;
}

export interface GameState {
  entities: EntityState[];
  entityById: Map<number, EntityState>;
  explosions: ExplosionState[];
  laserBeams: LaserBeam[];
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
  onBossDefeated: GameEvent;
  onRelicDropped: GameDataEvent<RelicId>;
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
    pendingShots: [],
    time: { time: 0, deltaTime: 0 },
    nextId: 1,
    planetHealth: 1000,
    maxPlanetHealth: 1000,
    spawner: {
      elapsed: 0,
      spawnAccumulator: 0,
      paused: true,
      nextBossTier: 0,
      warnedBossTier: -1,
    },
    xp: 0,
    score: 0,
    totalKills: 0,
    planetHealthFromKills: 0,
    level: 1,
    pendingChoice: true,
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
    onBossDefeated: new GameEvent(),
    onRelicDropped: new GameDataEvent<RelicId>(),
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
    projectileType: ProjectileType.Tiny,
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
    chargesGranted: 0,
    laserDamage: 0,
    kills: 0,
    damageDealt: 0,
    targetingMode: TargetingMode.NearestToPlanet,
    level: 0,
    freezeStacks: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    fireCount: 1,
    beamWidth: 0,
    explosionRadius: 0,
    hitDelay: 0,
    sizeScale: 1,
    isBoss: false,
    damageType: DamageType.Physical,
  };
}

function spawnInRightThird(): { x: number; y: number } {
  const pad = 60;
  const xStart = (CANVAS_WIDTH * 2) / 3;
  return {
    x: xStart + Math.random() * (CANVAS_WIDTH - xStart - pad),
    y: pad + Math.random() * (CANVAS_HEIGHT - pad * 2),
  };
}

export function spawnEntity(state: GameState, config: EnemyConfig, team: Team): void {
  const { x, y } = spawnInRightThird();
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
  entity.projectileType = config.projectileType;
  entity.chargesRequired = config.chargesRequired;
  entity.role = getShipRole(config.entityType);
  entity.plasmaStacksApplied = config.plasmaStacks;
  entity.chargesGranted = scaled.chargesGranted;
  entity.laserDamage = scaled.laserDamage;
  entity.level = level;
  entity.freezeStacks = scaled.freezeStacks;
  entity.chainCount = scaled.chainCount;
  entity.buffMultiplier = scaled.buffMultiplier;
  entity.fireCount = config.fireCount;
  entity.beamWidth = config.beamWidth;
  entity.explosionRadius = scaled.explosionRadius;
  entity.hitDelay = config.hitDelay;
  entity.damageType = config.damageType;
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

function applyFreezeStacks(state: GameState, target: EntityState, stacks: number): void {
  if (stacks <= 0) return;
  const wasFrozen = target.freezeStacks > 0;
  target.freezeStacks += stacks;
  if (!wasFrozen && state.relicEffects.frostNovaDamage > 0) {
    dealDamageToEntity(state, null, target, state.relicEffects.frostNovaDamage);
  }
  if (state.relicEffects.plasmaOnFreezeApply > 0) {
    target.plasmaStacks += state.relicEffects.plasmaOnFreezeApply;
  }
}

function dealDamageToEntity(
  state: GameState,
  attacker: EntityState | null,
  target: EntityState,
  damage: number
): boolean {
  let effectiveDamage = damage;
  if (attacker?.team === Team.Allied && target.team === Team.Enemy) {
    const streakMultiplier = Math.min(1.25, 1 + state.perfectWordStreak * state.relicEffects.streakDamageBonus);
    effectiveDamage = Math.round(effectiveDamage * state.relicEffects.damageMultiplier * streakMultiplier);
    if (state.relicEffects.frozenDamageMultiplier > 1 && target.freezeStacks > 0) {
      effectiveDamage = Math.round(effectiveDamage * state.relicEffects.frozenDamageMultiplier);
    }
    if (state.relicEffects.firstStrikeDamageBonus > 0 && target.health === target.maxHealth) {
      effectiveDamage = Math.round(effectiveDamage * (1 + state.relicEffects.firstStrikeDamageBonus));
    }
    if (state.relicEffects.plasmaDamageBonusPerStack > 0 && target.plasmaStacks > 0) {
      effectiveDamage = Math.round(effectiveDamage * (1 + target.plasmaStacks * state.relicEffects.plasmaDamageBonusPerStack));
    }
    if (state.relicEffects.freezeStacksBonus > 0 && attacker.freezeStacks > 0) applyFreezeStacks(state, target, state.relicEffects.freezeStacksBonus);
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
      if (state.relicEffects.chargesOnFrozenKill > 0 && target.freezeStacks > 0) {
        for (const e of state.entities) {
          if (e.team === Team.Allied) grantCharge(state, e, state.relicEffects.chargesOnFrozenKill);
        }
      }
      if (state.relicEffects.deathNovaPlasmaStacks > 0) {
        applyDeathExplosion(state, target, (other) => { other.plasmaStacks += state.relicEffects.deathNovaPlasmaStacks; });
      }
      if (state.relicEffects.frostChainFreezeStacks > 0 && target.freezeStacks > 0) {
        applyDeathExplosion(state, target, (other) => { other.freezeStacks += state.relicEffects.frostChainFreezeStacks; });
      }
      if (state.relicEffects.plasmaDeathSpread > 0 && target.plasmaStacks > 0) {
        applyDeathExplosion(state, target, (other) => { other.plasmaStacks += state.relicEffects.plasmaDeathSpread; });
      }
      if (state.relicEffects.freezeKillSpread > 0 && target.freezeStacks > 0) {
        let nearest: EntityState | null = null;
        let nearestDistSq = Infinity;
        for (const other of state.entities) {
          if (other.team !== Team.Enemy || other.id === target.id || other.freezeStacks > 0) continue;
          const dx = other.x - target.x;
          const dy = other.y - target.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < nearestDistSq) { nearestDistSq = distSq; nearest = other; }
        }
        if (nearest) nearest.freezeStacks += state.relicEffects.freezeKillSpread;
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
      });
      if (target.isBoss) {
        state.onBossDefeated.emit();
        const unowned = RELIC_CATALOG.filter((r) => !state.relics.includes(r.id));
        if (unowned.length > 0) {
          const relicIndex = (state.spawner.nextBossTier - 1) % unowned.length;
          const relicId = unowned[relicIndex].id;
          addRelic(state, relicId);
          state.spawner.paused = true;
          state.onRelicDropped.emit(relicId);
        }
      }
    }
    const idx = state.entities.indexOf(target);
    if (idx >= 0) removeEntityAt(state, idx);
  }

  state.onDamageDealt.emit({ amount: damage, x: target.x, y: target.y });

  return killed;
}

function spawnExplosion(state: GameState, entityType: EntityType, x: number, y: number, explosionRadius = 0): void {
  state.explosions.push({ id: state.nextId++, x, y, explosionType: getExplosionType(entityType), explosionRadius });
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
    if (shooter.team === Team.Enemy && reducedDamage > 0) {
      if (state.relicEffects.chargesOnPlanetDamage > 0) {
        for (const e of state.entities) {
          grantCharge(state, e, state.relicEffects.chargesOnPlanetDamage);
        }
      }
      if (state.relicEffects.planetFreezeOnHit > 0) {
        applyFreezeStacks(state, shooter, state.relicEffects.planetFreezeOnHit);
      }
    }
    state.onPlanetDamaged.emit();
  }
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  if (state.spawner.paused) return;

  const enemySpeedMultiplier = state.relicEffects.enemySpeedMultiplier;

  const prevSecond = Math.floor(state.time.time - dt);
  const curSecond = Math.floor(state.time.time);
  if (curSecond > prevSecond) {
    if (state.relicEffects.planetHealPerSecond > 0) {
      state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.planetHealPerSecond);
    }
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const e = state.entities[i];
      if (e.team !== Team.Enemy) continue;

      if (e.plasmaStacks > 0) {
        if (state.relicEffects.healPerPlasmaTick > 0) {
          state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + state.relicEffects.healPerPlasmaTick);
        }
        const prevStacks = e.plasmaStacks;
        const dmg = e.plasmaStacks * PLASMA_DAMAGE_PER_TICK * state.relicEffects.plasmaDamageMultiplier;
        e.plasmaStacks = Math.max(0, e.plasmaStacks - 1);
        if (dealDamageToEntity(state, null, e, dmg)) continue;
        if (prevStacks > 0 && e.plasmaStacks === 0 && state.relicEffects.plasmaExpiredDamage > 0) {
          if (dealDamageToEntity(state, null, e, state.relicEffects.plasmaExpiredDamage)) continue;
        }
      }

      if (e.freezeStacks > 0) {
        e.freezeStacks = Math.max(0, e.freezeStacks - 1);
      }
    }
  }

  for (const e of state.entities) {
    const isFrozen = e.team === Team.Enemy && e.freezeStacks > 0;
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

        if (e.chargesRequired <= 0 && !isFrozen) {
          e.fireTimer -= dt / state.relicEffects.enemyFireSlowMultiplier;
          if (e.fireTimer <= 0) {
            e.fireTimer += e.fireRate;
            performInstantHit(state, e, target, e.projectileDamage);
          }
        }
      }
    }

    if (!inRange && e.speed > 0 && !isFrozen) {
      const plasmaPenalty = state.relicEffects.plasmaSlow > 0 && e.plasmaStacks > 0 ? (1 - state.relicEffects.plasmaSlow) : 1;
      const effectiveSpeed = e.team === Team.Enemy ? e.speed * enemySpeedMultiplier * plasmaPenalty : e.speed;
      e.vx = -effectiveSpeed;
      e.vy = 0;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rotation = Math.atan2(e.vy, e.vx);
    }
  }

  checkCollisions(state);

  const LASER_BEAM_DURATION = 0.35;
  for (let i = state.laserBeams.length - 1; i >= 0; i--) {
    if (state.time.time - state.laserBeams[i].time > LASER_BEAM_DURATION) {
      state.laserBeams.splice(i, 1);
    }
  }

  for (let i = state.pendingShots.length - 1; i >= 0; i--) {
    const shot = state.pendingShots[i];
    if (state.time.time < shot.fireAt) continue;
    state.pendingShots.splice(i, 1);

    const shooter = state.entityById.get(shot.shooterId);
    if (!shooter) continue;

    const dmg = getBuffedDamage(shooter, getEffectiveProjectileDamage(state, shooter));

    if (shooter.explosionRadius > 0) {
      const effectiveRadius = shooter.team === Team.Allied
        ? shooter.explosionRadius * state.relicEffects.explosionRadiusMultiplier
        : shooter.explosionRadius;
      spawnExplosion(state, shooter.entityType, shot.targetX, shot.targetY, effectiveRadius);
      const r2 = effectiveRadius * effectiveRadius;
      for (let j = state.entities.length - 1; j >= 0; j--) {
        const other = state.entities[j];
        if (other.team !== Team.Enemy) continue;
        const dx = other.x - shot.targetX;
        const dy = other.y - shot.targetY;
        if (dx * dx + dy * dy > r2) continue;
        if (shooter.plasmaStacksApplied > 0) other.plasmaStacks += shooter.plasmaStacksApplied;
        if (shooter.freezeStacks > 0) applyFreezeStacks(state, other, shooter.freezeStacks);
        if (dmg > 0) dealDamageToEntity(state, shooter, other, dmg);
      }
    } else {
      const target = shot.targetEntityId !== null ? state.entityById.get(shot.targetEntityId) : null;
      if (target) {
        if (shooter.plasmaStacksApplied > 0) target.plasmaStacks += shooter.plasmaStacksApplied;
        spawnExplosion(state, shooter.entityType, target.x, target.y);
        dealDamageToEntity(state, shooter, target, dmg);
      }
    }
  }
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

function fireShot(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  state.pendingShots.push({
    fireAt: state.time.time + e.hitDelay,
    shooterId: e.id,
    targetX: target.x,
    targetY: target.y,
    targetEntityId: target.entity?.id ?? null,
  });
}

function fireLaser(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  const dx = target.x - e.x;
  const dy = target.y - e.y;
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

  const laserMult = e.damageType === DamageType.Laser
    ? state.relicEffects.laserDamageMultiplier
    : 1;
  const dmg = getBuffedDamage(e, Math.round(e.laserDamage * laserMult));
  const searchRange = piercing ? LASER_RANGE : len + 20;
  const extraHitRadius = e.beamWidth * 5;

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

    if (e.freezeStacks > 0) applyFreezeStacks(state, other, e.freezeStacks);

    dealDamageToEntity(state, e, other, dmg);
    if (!piercing) break;
  }

  state.laserBeams.push({
    id: state.nextId++,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    time: state.time.time,
    width: e.beamWidth,
  });
}

function fireChainProjectile(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target || !target.entity) return;

  const dmg = getBuffedDamage(e, getEffectiveProjectileDamage(state, e));

  const hitIds = new Set<number>();
  let currentTarget: EntityState | null = target.entity;
  let chainsRemaining = e.chainCount;
  const maxJumpDistSq = MAX_CHAIN_JUMP_DISTANCE * MAX_CHAIN_JUMP_DISTANCE;

  while (currentTarget && chainsRemaining >= 0) {
    hitIds.add(currentTarget.id);
    spawnExplosion(state, e.entityType, currentTarget.x, currentTarget.y);
    dealDamageToEntity(state, e, currentTarget, dmg);

    chainsRemaining--;
    if (chainsRemaining < 0) break;

    let nearest: EntityState | null = null;
    let nearestDist = Infinity;
    for (const other of state.entities) {
      if (other.team !== Team.Enemy || hitIds.has(other.id)) continue;
      const cx = other.x - currentTarget.x;
      const cy = other.y - currentTarget.y;
      const d = cx * cx + cy * cy;
      if (d < nearestDist && d <= maxJumpDistSq) {
        nearestDist = d;
        nearest = other;
      }
    }
    if (!nearest) break;

    currentTarget = nearest;
  }
}

function activateBuffer(state: GameState, e: EntityState): void {
  for (const ally of state.entities) {
    if (ally.id === e.id || ally.team !== Team.Allied) continue;
    if (ally.chargesRequired <= 0) continue;
    if (ally.chargesGranted > 0 || ally.buffMultiplier > 0) continue;
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

    if (e.chargesGranted > 0) {
      for (const ally of state.entities) {
        if (ally.id === e.id || ally.team !== Team.Allied) continue;
        if (ally.chargesRequired <= 0 || ally.chargesGranted > 0) continue;
        grantCharge(state, ally, e.chargesGranted + state.relicEffects.bonusChargesGranted);
      }
      continue;
    }

    if (e.buffMultiplier > 0) {
      activateBuffer(state, e);
      continue;
    }

    if (e.chainCount > 0) {
      fireChainProjectile(state, e);
      continue;
    }

    if (e.laserDamage > 0) {
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
  if (state.relicEffects.blizzardFreezeInterval > 0 && state.relicEffects.blizzardFreezeStacks > 0 &&
      state.perfectWordStreak % state.relicEffects.blizzardFreezeInterval === 0) {
    for (const e of state.entities) {
      if (e.team === Team.Enemy) e.freezeStacks += state.relicEffects.blizzardFreezeStacks;
    }
  }
  if (state.relicEffects.freezeOnPerfectWord > 0) {
    let nearest: EntityState | null = null;
    let nearestDistSq = Infinity;
    for (const e of state.entities) {
      if (e.team !== Team.Enemy) continue;
      const dx = e.x - 0;
      const dy = e.y - 0;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq) { nearestDistSq = distSq; nearest = e; }
    }
    if (nearest) applyFreezeStacks(state, nearest, state.relicEffects.freezeOnPerfectWord);
  }
}

export function onWordWithError(state: GameState): void {
  state.perfectWordStreak = 0;
}

function addRelic(state: GameState, relicId: RelicId): void {
  state.relics.push(relicId);
  const prevEffects = state.relicEffects;
  state.relicEffects = computeRelicEffects(state.relics);
  const healthIncrease = state.relicEffects.maxPlanetHealthBonus - prevEffects.maxPlanetHealthBonus;
  if (healthIncrease > 0) {
    state.maxPlanetHealth += healthIncrease;
    state.planetHealth = Math.min(state.maxPlanetHealth, state.planetHealth + healthIncrease);
  }
}

const TIER_SPREAD = 90;
const TIER_OFFSET = 30;
const BASE_SPAWN_RATE = 0.6;
const MAX_SPAWN_RATE = 4.0;
const SPAWN_RAMP_TIME = 240;
export const BOSS_WARNING_LEAD_TIME_SECONDS = 4;
const BOSS_SPAWN_TIME_OFFSET = TIER_SPREAD / 2;
const BOSS_TIER_COUNT = BOSS_CATALOG.length - 1;

function binomialWeight(t: number, n: number, k: number): number {
  const p = Math.max(0, Math.min(1, t));
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;

  let coeff = 1;
  for (let i = 0; i < k; i++) {
    coeff *= (n - i) / (i + 1);
  }

  return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function getTierWeights(elapsed: number): number[] {
  const tierCount = ENEMY_CATALOG.length;
  const weights: number[] = new Array(tierCount).fill(0);

  for (let i = 0; i < tierCount; i++) {
    const center = TIER_OFFSET + i * TIER_SPREAD;
    const n = 20;
    const t = (elapsed - (center - TIER_SPREAD)) / (TIER_SPREAD * 2);
    const w = binomialWeight(t, n, Math.floor(n / 2));
    weights[i] = Math.max(0, w);
  }

  return weights;
}

function pickEnemyTier(weights: number[]): number {
  let total = 0;
  for (const w of weights) total += w;
  if (total === 0) return 0;

  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function getSpawnRate(elapsed: number): number {
  const t = Math.min(1, elapsed / SPAWN_RAMP_TIME);
  return BASE_SPAWN_RATE + (MAX_SPAWN_RATE - BASE_SPAWN_RATE) * t;
}

export function updateSpawner(state: GameState, dt: number): void {
  if (state.spawner.paused) return;

  state.spawner.elapsed += dt;

  const bossTier = state.spawner.nextBossTier;
  if (bossTier < BOSS_TIER_COUNT) {
    const bossSpawnTime = TIER_OFFSET + bossTier * TIER_SPREAD + BOSS_SPAWN_TIME_OFFSET;
    if (state.spawner.warnedBossTier < bossTier && state.spawner.elapsed >= bossSpawnTime - BOSS_WARNING_LEAD_TIME_SECONDS) {
      state.spawner.warnedBossTier = bossTier;
      state.onBossApproaching.emit();
    }
    if (state.spawner.elapsed >= bossSpawnTime) {
      spawnEntity(state, BOSS_CATALOG[bossTier], Team.Enemy);
      state.spawner.nextBossTier++;
    }
  }

  const rate = getSpawnRate(state.spawner.elapsed);
  state.spawner.spawnAccumulator += rate * dt;

  const weights = getTierWeights(state.spawner.elapsed);

  while (state.spawner.spawnAccumulator >= 1) {
    state.spawner.spawnAccumulator -= 1;
    const tierIndex = pickEnemyTier(weights);
    const config = ENEMY_CATALOG[tierIndex];
    spawnEntity(state, config, Team.Enemy);
  }
}

export function setSpawnerPaused(state: GameState, paused: boolean): void {
  state.spawner.paused = paused;
}

export function xpForNextLevel(level: number): number {
  return 30 + level * 8;
}

export function awardXP(state: GameState, amount: number): void {
  if (state.pendingChoice) return;
  state.xp += Math.round(amount * state.relicEffects.xpMultiplier);
  const needed = xpForNextLevel(state.level);
  if (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    state.pendingChoice = true;
    state.spawner.paused = true;
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
  entity.chargesGranted = scaled.chargesGranted;
  entity.chainCount = scaled.chainCount;
  entity.freezeStacks = scaled.freezeStacks;
  entity.buffMultiplier = scaled.buffMultiplier;
  entity.explosionRadius = scaled.explosionRadius;
}
