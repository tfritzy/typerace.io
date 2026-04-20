import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset, ProjectileType, Team } from "./types";
import { ENEMY_CATALOG, SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, goldForEnemy, getScaledConfig } from "./enemyConfig";
import { getShipRole, type ShipRole } from "./shipCatalog";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLASMA_DPS_PER_STACK = 5;
const LASER_RANGE = 2200;
const FREEZE_SLOW_FACTOR = 0;
const FREEZE_DECAY_RATE = 1;
const MAC_CANNON_RANGE = 2200;
const MAC_CANNON_RADIUS = 30;

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
  shield: number;
  plasmaStacks: number;
  healAmount: number;
  shieldAmount: number;
  plasmaStacksApplied: number;
  chargesGranted: number;
  laserDamage: number;
  kills: number;
  damageDealt: number;
  totalHealed: number;
  totalShielded: number;
  targetingMode: TargetingMode;
  level: number;
  freezeStacks: number;
  freezeTimer: number;
  chainCount: number;
  buffMultiplier: number;
  buffedNextAttack: boolean;
  macCannonDamage: number;
  dualShot: boolean;
}

export interface ExplosionState {
  id: number;
  x: number;
  y: number;
  projectileType: ProjectileType;
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

function spawnFromRight(): { x: number; y: number } {
  const pad = 60;
  return {
    x: CANVAS_WIDTH + 20,
    y: pad + Math.random() * (CANVAS_HEIGHT - pad * 2),
  };
}

export function spawnEntity(state: GameState, config: EnemyConfig, team: Team): void {
  const { x, y } = spawnFromRight();
  const speed = (30 + Math.random() * 52.5) * 0.75;
  const hitbox = SHIP_HITBOX_MAP[config.entityType];

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx: -speed,
    vy: 0,
    health: config.health,
    maxHealth: config.health,
    power: config.power,
    colorPreset: ColorPreset.Preset4,
    team,
    fireRate: config.fireRate,
    projectileDamage: config.projectileDamage,
    projectileType: config.projectileType,
    fireTimer: Math.random() * config.fireRate,
    rotation: Math.PI,
    displayRotation: Math.PI,
    speed,
    chargesRequired: 0,
    charge: 0,
    gold: goldForEnemy(config),
    range: config.range,
    hitHalfW: hitbox.hitWidth / 2,
    hitHalfH: hitbox.hitHeight / 2,
    role: null,
    shield: 0,
    plasmaStacks: 0,
    healAmount: 0,
    shieldAmount: 0,
    plasmaStacksApplied: 0,
    chargesGranted: 0,
    laserDamage: 0,
    kills: 0,
    damageDealt: 0,
    totalHealed: 0,
    totalShielded: 0,
    targetingMode: TargetingMode.NearestToShip,
    level: 0,
    freezeStacks: 0,
    freezeTimer: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    macCannonDamage: 0,
    dualShot: false,
  };

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
  const hitbox = SHIP_HITBOX_MAP[config.entityType];

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx: 0,
    vy: 0,
    health: scaled.health,
    maxHealth: scaled.health,
    power: 0,
    colorPreset,
    team: Team.Allied,
    fireRate: 0,
    projectileDamage: scaled.projectileDamage,
    projectileType: config.projectileType,
    fireTimer: 0,
    rotation: 0,
    displayRotation: 0,
    speed: 0,
    chargesRequired: config.chargesRequired,
    charge: 0,
    gold: 0,
    range: 0,
    hitHalfW: hitbox.hitWidth / 2,
    hitHalfH: hitbox.hitHeight / 2,
    role: getShipRole(config.entityType),
    shield: 0,
    plasmaStacks: 0,
    healAmount: scaled.healAmount,
    shieldAmount: scaled.shieldAmount,
    plasmaStacksApplied: config.plasmaStacks,
    chargesGranted: scaled.chargesGranted,
    laserDamage: scaled.laserDamage,
    kills: 0,
    damageDealt: 0,
    totalHealed: 0,
    totalShielded: 0,
    targetingMode: TargetingMode.NearestToShip,
    level,
    freezeStacks: scaled.freezeStacks,
    freezeTimer: 0,
    chainCount: scaled.chainCount,
    buffMultiplier: scaled.buffMultiplier,
    buffedNextAttack: false,
    macCannonDamage: scaled.macCannonDamage,
    dualShot: config.dualShot,
  };

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

function flareType(pt: ProjectileType): ProjectileType {
  return pt === ProjectileType.Tiny ? ProjectileType.Projectile1 : pt;
}

function performInstantHit(
  state: GameState,
  shooter: EntityState,
  target: { x: number; y: number; entity: EntityState | null },
  damage: number,
  plasmaStacks: number
): void {
  const ft = flareType(shooter.projectileType);

  state.explosions.push({
    id: state.nextId++,
    x: shooter.x,
    y: shooter.y,
    projectileType: ft,
  });

  if (target.entity) {
    if (plasmaStacks > 0) target.entity.plasmaStacks += plasmaStacks;

    let dmg = damage;
    if (target.entity.shield > 0) {
      const absorbed = Math.min(target.entity.shield, dmg);
      target.entity.shield -= absorbed;
      dmg -= absorbed;
    }
    target.entity.health -= dmg;
    shooter.damageDealt += damage;

    const killed = target.entity.health <= 0;
    state.onDamageDealt.emit({ amount: damage, x: target.entity.x, y: target.entity.y, killed });

    state.explosions.push({
      id: state.nextId++,
      x: target.entity.x,
      y: target.entity.y,
      projectileType: ft,
    });

    if (killed) {
      shooter.kills++;
      if (target.entity.team === Team.Enemy) {
        state.gold += target.entity.gold;
        awardXP(state, target.entity.gold);
      }
      const idx = state.entities.indexOf(target.entity);
      if (idx >= 0) removeEntityAt(state, idx);
    }
  } else {
    state.planetHealth = Math.max(0, state.planetHealth - damage);
    state.onPlanetDamaged.emit();

    state.explosions.push({
      id: state.nextId++,
      x: target.x,
      y: target.y,
      projectileType: ft,
    });
  }
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  if (state.spawner.paused) return;

  for (const e of state.entities) {
    if (e.freezeTimer > 0) {
      e.freezeTimer = Math.max(0, e.freezeTimer - dt * FREEZE_DECAY_RATE);
    }

    const freezeSlow = e.freezeTimer > 0 ? FREEZE_SLOW_FACTOR : 1;
    const target = findNearestTarget(state, e);

    if (target) {
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inRange = e.range <= 0 || dist <= e.range;

      if (inRange) {
        if (e.speed > 0) {
          e.vx = 0;
          e.vy = 0;
        }
        e.rotation = Math.atan2(dy, dx);

        if (e.chargesRequired <= 0) {
          e.fireTimer -= dt * freezeSlow;
          if (e.fireTimer <= 0) {
            e.fireTimer += e.fireRate;
            performInstantHit(state, e, target, e.projectileDamage, 0);
          }
        }
      } else if (e.speed > 0) {
        const effectiveSpeed = e.speed * freezeSlow;
        e.vx = -effectiveSpeed;
        e.vy = 0;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.rotation = Math.atan2(e.vy, e.vx);
      }
    } else if (e.speed > 0) {
      const effectiveSpeed = e.speed * freezeSlow;
      e.vx = -effectiveSpeed;
      e.vy = 0;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rotation = Math.atan2(e.vy, e.vx);
    }
  }

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (e.plasmaStacks > 0) {
      const plasmaDamage = e.plasmaStacks * PLASMA_DPS_PER_STACK * dt;
      e.health -= plasmaDamage;
      if (e.health <= 0) {
        state.onDamageDealt.emit({ amount: plasmaDamage, x: e.x, y: e.y, killed: true });
        if (e.team === Team.Enemy) {
          state.gold += e.gold;
          awardXP(state, e.gold);
        }
        removeEntityAt(state, i);
      }
    }
  }

  checkCollisions(state);

  const LASER_BEAM_DURATION = 0.35;
  for (let i = state.laserBeams.length - 1; i >= 0; i--) {
    if (state.time.time - state.laserBeams[i].time > LASER_BEAM_DURATION) {
      state.laserBeams.splice(i, 1);
    }
  }
}

function fireProjectile(state: GameState, e: EntityState, plasmaStacks: number): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  if (plasmaStacks > 0 && target.entity) {
    fireExplosiveProjectile(state, e, target, plasmaStacks, 0);
  } else {
    let dmg = e.projectileDamage;
    if (e.buffedNextAttack) {
      dmg = Math.round(dmg * 2);
      e.buffedNextAttack = false;
    }
    performInstantHit(state, e, target, dmg, 0);
  }
}

const EXPLOSION_RADIUS = 120;

function fireExplosiveProjectile(
  state: GameState,
  shooter: EntityState,
  target: { x: number; y: number; entity: EntityState | null },
  plasmaStacks: number,
  freezeStacks: number
): void {
  const ft = flareType(shooter.projectileType);

  state.explosions.push({
    id: state.nextId++,
    x: shooter.x,
    y: shooter.y,
    projectileType: ft,
  });

  state.explosions.push({
    id: state.nextId++,
    x: target.x,
    y: target.y,
    projectileType: ft,
  });

  const r2 = EXPLOSION_RADIUS * EXPLOSION_RADIUS;
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const other = state.entities[i];
    if (other.team !== Team.Enemy) continue;
    const dx = other.x - target.x;
    const dy = other.y - target.y;
    if (dx * dx + dy * dy > r2) continue;

    if (plasmaStacks > 0) other.plasmaStacks += plasmaStacks;
    if (freezeStacks > 0) other.freezeTimer = Math.max(other.freezeTimer, freezeStacks);

    let dmg = shooter.projectileDamage;
    if (shooter.buffedNextAttack) {
      dmg = Math.round(dmg * 2);
    }
    if (other.shield > 0) {
      const absorbed = Math.min(other.shield, dmg);
      other.shield -= absorbed;
      dmg -= absorbed;
    }
    other.health -= dmg;
    shooter.damageDealt += shooter.projectileDamage;

    const killed = other.health <= 0;
    state.onDamageDealt.emit({ amount: shooter.projectileDamage, x: other.x, y: other.y, killed });

    if (killed) {
      shooter.kills++;
      state.gold += other.gold;
      awardXP(state, other.gold);
      removeEntityAt(state, i);
    }
  }
  shooter.buffedNextAttack = false;
}

function fireLaser(state: GameState, e: EntityState, piercing: boolean): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;

  const muzzleOffset = 12;
  const startX = e.x + nx * muzzleOffset;
  const startY = e.y + ny * muzzleOffset;

  const beamLen = piercing ? LASER_RANGE : len;
  const endX = e.x + nx * beamLen;
  const endY = e.y + ny * beamLen;

  let dmg = e.laserDamage;
  if (e.buffedNextAttack) {
    dmg = Math.round(dmg * 2);
    e.buffedNextAttack = false;
  }

  const searchRange = piercing ? LASER_RANGE : len + 20;
  let hitCount = 0;
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

    const hitRadius = Math.max(other.hitHalfW, other.hitHalfH);
    if (perpDist > hitRadius) continue;

    if (e.freezeStacks > 0) other.freezeTimer = Math.max(other.freezeTimer, e.freezeStacks);

    let actualDmg = dmg;
    if (other.shield > 0) {
      const absorbed = Math.min(other.shield, actualDmg);
      other.shield -= absorbed;
      actualDmg -= absorbed;
    }
    other.health -= actualDmg;
    e.damageDealt += dmg;

    const killed = other.health <= 0;
    state.onDamageDealt.emit({ amount: dmg, x: other.x, y: other.y, killed });
    if (killed) {
      e.kills++;
      state.gold += other.gold;
      awardXP(state, other.gold);
      removeEntityAt(state, i);
    }

    hitCount++;
    if (!piercing && hitCount >= 1) break;
  }

  state.laserBeams.push({
    id: state.nextId++,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    time: state.time.time,
    width: 2,
  });
}

function fireMacCannon(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;

  const muzzleOffset = 12;
  const startX = e.x + nx * muzzleOffset;
  const startY = e.y + ny * muzzleOffset;
  const endX = e.x + nx * MAC_CANNON_RANGE;
  const endY = e.y + ny * MAC_CANNON_RANGE;

  let dmg = e.macCannonDamage;
  if (e.buffedNextAttack) {
    dmg = Math.round(dmg * 2);
    e.buffedNextAttack = false;
  }

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const other = state.entities[i];
    if (other.team !== Team.Enemy) continue;

    const ex = other.x - e.x;
    const ey = other.y - e.y;
    const proj = ex * nx + ey * ny;
    if (proj < 0 || proj > MAC_CANNON_RANGE) continue;

    const perpX = ex - proj * nx;
    const perpY = ey - proj * ny;
    const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);

    const hitRadius = Math.max(other.hitHalfW, other.hitHalfH) + MAC_CANNON_RADIUS;
    if (perpDist > hitRadius) continue;

    let actualDmg = dmg;
    if (other.shield > 0) {
      const absorbed = Math.min(other.shield, actualDmg);
      other.shield -= absorbed;
      actualDmg -= absorbed;
    }
    other.health -= actualDmg;
    e.damageDealt += dmg;

    const killed = other.health <= 0;
    state.onDamageDealt.emit({ amount: dmg, x: other.x, y: other.y, killed });
    if (killed) {
      e.kills++;
      state.gold += other.gold;
      awardXP(state, other.gold);
      removeEntityAt(state, i);
    }
  }

  state.laserBeams.push({
    id: state.nextId++,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    time: state.time.time,
    width: 6,
  });
}

function fireChainProjectile(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target || !target.entity) return;

  let dmg = e.projectileDamage;
  if (e.buffedNextAttack) {
    dmg = Math.round(dmg * 2);
    e.buffedNextAttack = false;
  }

  const ft = flareType(e.projectileType);
  state.explosions.push({
    id: state.nextId++,
    x: e.x,
    y: e.y,
    projectileType: ft,
  });

  const hitIds = new Set<number>();
  let currentTarget = target.entity;
  let chainsRemaining = e.chainCount;

  while (currentTarget && chainsRemaining >= 0) {
    hitIds.add(currentTarget.id);

    if (currentTarget.shield > 0) {
      const absorbed = Math.min(currentTarget.shield, dmg);
      currentTarget.shield -= absorbed;
      currentTarget.health -= (dmg - absorbed);
    } else {
      currentTarget.health -= dmg;
    }
    e.damageDealt += dmg;

    state.explosions.push({
      id: state.nextId++,
      x: currentTarget.x,
      y: currentTarget.y,
      projectileType: ft,
    });

    const killed = currentTarget.health <= 0;
    state.onDamageDealt.emit({ amount: dmg, x: currentTarget.x, y: currentTarget.y, killed });
    if (killed) {
      e.kills++;
      state.gold += currentTarget.gold;
      awardXP(state, currentTarget.gold);
      const idx = state.entities.indexOf(currentTarget);
      if (idx >= 0) removeEntityAt(state, idx);
    }

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

function fireDualShot(state: GameState, e: EntityState): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  let dmg = e.projectileDamage;
  if (e.buffedNextAttack) {
    dmg = Math.round(dmg * 2);
    e.buffedNextAttack = false;
  }

  performInstantHit(state, e, target, dmg, 0);
  performInstantHit(state, e, target, dmg, 0);
}

function activateAbility(state: GameState, e: EntityState): void {
  if (e.charge < e.chargesRequired) return;
  e.charge = 0;

  if (e.chargesGranted > 0) {
    for (const ally of state.entities) {
      if (ally.id === e.id || ally.team !== Team.Allied) continue;
      if (ally.chargesRequired <= 0) continue;
      if (ally.chargesGranted > 0) continue;
      ally.charge = Math.min(ally.chargesRequired, ally.charge + e.chargesGranted);
      activateAbility(state, ally);
    }
    return;
  }

  if (e.buffMultiplier > 0) {
    activateBuffer(state, e);
    return;
  }

  if (e.macCannonDamage > 0) {
    fireMacCannon(state, e);
    return;
  }

  if (e.chainCount > 0) {
    fireChainProjectile(state, e);
    return;
  }

  if (e.laserDamage > 0) {
    fireLaser(state, e, e.role !== "laser");
    return;
  }

  if (e.freezeStacks > 0 && e.projectileDamage > 0) {
    const target = findNearestTarget(state, e);
    if (target) {
      fireExplosiveProjectile(state, e, target, 0, e.freezeStacks);
    }
    return;
  }

  if (e.dualShot) {
    fireDualShot(state, e);
    return;
  }

  if (e.projectileDamage > 0 || e.plasmaStacksApplied > 0) {
    fireProjectile(state, e, e.plasmaStacksApplied);
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
  entity.healAmount = scaled.healAmount;
  entity.shieldAmount = scaled.shieldAmount;
  entity.laserDamage = scaled.laserDamage;
  entity.macCannonDamage = scaled.macCannonDamage;
  entity.chargesGranted = scaled.chargesGranted;
  entity.chainCount = scaled.chainCount;
  entity.freezeStacks = scaled.freezeStacks;
  entity.buffMultiplier = scaled.buffMultiplier;
}
