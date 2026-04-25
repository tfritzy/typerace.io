import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset, ProjectileType, ExplosionType, Team, getExplosionType } from "./types";
import { ENEMY_CATALOG, SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, goldForEnemy, getScaledConfig } from "./enemyConfig";
import { getShipRole, type ShipRole } from "./shipCatalog";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLASMA_DAMAGE_PER_TICK = 5;
const LASER_RANGE = 2200;

export enum TargetingMode {
  NearestToShip = 0,
  NearestToPlanet = 1,
  Strongest = 2,
  Weakest = 3,
  LowestHealth = 4,
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
  gold: number;
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
  explosionType: ExplosionType | null;
}

export interface SpawnState {
  elapsed: number;
  spawnAccumulator: number;
  paused: boolean;
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
  killed: boolean;
}

export interface EntityDeathData {
  x: number;
  y: number;
  team: Team;
  entityType: EntityType;
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
  gold: number;
  spawner: SpawnState;
  xp: number;
  level: number;
  pendingChoice: boolean;
  onPlanetDamaged: GameEvent;
  onDamageDealt: GameDataEvent<DamageData>;
  onEnemyEntityDeath: GameDataEvent<EntityDeathData>;
  onLevelUp: GameEvent;
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
    gold: 0,
    spawner: {
      elapsed: 0,
      spawnAccumulator: 0,
      paused: true,
    },
    xp: 0,
    level: 1,
    pendingChoice: true,
    onPlanetDamaged: new GameEvent(),
    onDamageDealt: new GameDataEvent<DamageData>(),
    onEnemyEntityDeath: new GameDataEvent<EntityDeathData>(),
    onLevelUp: new GameEvent(),
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
    gold: 0,
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
    targetingMode: TargetingMode.NearestToShip,
    level: 0,
    freezeStacks: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    fireCount: 1,
    beamWidth: 0,
    explosionRadius: 0,
    hitDelay: 0,
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
  const speed = (30 + Math.random() * 52.5) * 0.75;
  const entity = makeBaseEntity(state, config.entityType, x, y, team, ColorPreset.Preset4);
  entity.health = config.health;
  entity.maxHealth = config.health;
  entity.power = config.power;
  entity.fireRate = config.fireRate;
  entity.projectileDamage = config.projectileDamage;
  entity.projectileType = config.projectileType;
  entity.fireTimer = Math.random() * config.fireRate;
  entity.rotation = Math.PI;
  entity.displayRotation = Math.PI;
  entity.speed = speed;
  entity.vx = -speed;
  entity.gold = goldForEnemy(config);
  entity.range = config.range;
  addEntity(state, entity);
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
        score = -other.maxHealth;
        break;
      case TargetingMode.LowestHealth:
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

function dealDamageToEntity(
  state: GameState,
  attacker: EntityState | null,
  target: EntityState,
  damage: number
): boolean {
  target.health -= damage;
  if (attacker) attacker.damageDealt += damage;

  const killed = target.health <= 0;
  state.onDamageDealt.emit({ amount: damage, x: target.x, y: target.y, killed });

  if (killed) {
    if (attacker) attacker.kills++;
    if (target.team === Team.Enemy) {
      state.gold += target.gold;
      awardXP(state, target.gold);
      state.onEnemyEntityDeath.emit({ x: target.x, y: target.y, team: target.team, entityType: target.entityType });
    }
    const idx = state.entities.indexOf(target);
    if (idx >= 0) removeEntityAt(state, idx);
  }

  return killed;
}

function spawnExplosion(state: GameState, entityType: EntityType, x: number, y: number): void {
  state.explosions.push({ id: state.nextId++, x, y, explosionType: getExplosionType(entityType) ?? null });
}

function performInstantHit(
  state: GameState,
  shooter: EntityState,
  target: { x: number; y: number; entity: EntityState | null },
  damage: number
): void {
  spawnExplosion(state, shooter.entityType, target.x, target.y);

  if (target.entity) {
    dealDamageToEntity(state, shooter, target.entity, damage);
  } else {
    state.planetHealth = Math.max(0, state.planetHealth - damage);
    state.onPlanetDamaged.emit();
  }
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  if (state.spawner.paused) return;

  const prevSecond = Math.floor(state.time.time - dt);
  const curSecond = Math.floor(state.time.time);
  if (curSecond > prevSecond) {
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const e = state.entities[i];
      if (e.team !== Team.Enemy) continue;

      if (e.plasmaStacks > 0) {
        const dmg = e.plasmaStacks * PLASMA_DAMAGE_PER_TICK;
        e.plasmaStacks = Math.max(0, e.plasmaStacks - 1);
        if (dealDamageToEntity(state, null, e, dmg)) continue;
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
          e.fireTimer -= dt;
          if (e.fireTimer <= 0) {
            e.fireTimer += e.fireRate;
            performInstantHit(state, e, target, e.projectileDamage);
          }
        }
      }
    }

    if (!inRange && e.speed > 0 && !isFrozen) {
      e.vx = -e.speed;
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

    const dmg = getBuffedDamage(shooter, shooter.projectileDamage);

    if (shooter.explosionRadius > 0) {
      spawnExplosion(state, shooter.entityType, shot.targetX, shot.targetY);
      const r2 = shooter.explosionRadius * shooter.explosionRadius;
      for (let j = state.entities.length - 1; j >= 0; j--) {
        const other = state.entities[j];
        if (other.team !== Team.Enemy) continue;
        const dx = other.x - shot.targetX;
        const dy = other.y - shot.targetY;
        if (dx * dx + dy * dy > r2) continue;
        if (shooter.plasmaStacksApplied > 0) other.plasmaStacks += shooter.plasmaStacksApplied;
        if (shooter.freezeStacks > 0) other.freezeStacks += shooter.freezeStacks;
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

  const dmg = getBuffedDamage(e, e.laserDamage);
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

    if (e.freezeStacks > 0) other.freezeStacks += e.freezeStacks;

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

  const dmg = getBuffedDamage(e, e.projectileDamage);

  const hitIds = new Set<number>();
  let currentTarget: EntityState | null = target.entity;
  let chainsRemaining = e.chainCount;

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
      if (d < nearestDist) {
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

function activateAbility(state: GameState, e: EntityState): void {
  if (e.chargesRequired <= 0) return;
  while (e.charge >= e.chargesRequired) {
    e.charge -= e.chargesRequired;

    if (e.chargesGranted > 0) {
      for (const ally of state.entities) {
        if (ally.id === e.id || ally.team !== Team.Allied) continue;
        if (ally.chargesRequired <= 0 || ally.chargesGranted > 0) continue;
        ally.charge += e.chargesGranted;
        activateAbility(state, ally);
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
  for (const e of state.entities) {
    if (e.chargesRequired <= 0) continue;
    e.charge++;
    activateAbility(state, e);
  }
}

const TIER_SPREAD = 90;
const TIER_OFFSET = 30;
const BASE_SPAWN_RATE = 0.6;
const MAX_SPAWN_RATE = 4.0;
const SPAWN_RAMP_TIME = 240;

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
  state.xp += amount;
  const needed = xpForNextLevel(state.level);
  if (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    state.pendingChoice = true;
    state.spawner.paused = true;
    state.onLevelUp.emit();
  }
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
