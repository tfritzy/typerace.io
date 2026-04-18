import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset, ProjectileType, Team } from "./types";
import { ENEMY_CATALOG, SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, goldForEnemy } from "./enemyConfig";
import { getShipRole, type ShipRole } from "./shipCatalog";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;
const PROJECTILE_SPEED = 300 * 2;
const NEARBY_RANGE = 200;
const PLASMA_DPS_PER_STACK = 5;
const LASER_RANGE = 1200;

export enum TargetingMode {
  NearestToShip = 0,
  NearestToPlanet = 1,
  Strongest = 2,
  Weakest = 3,
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
  projectileSpeed: number;
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
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  team: Team;
  projectileType: ProjectileType;
  plasmaStacks: number;
  sourceId: number;
}

export interface ExplosionState {
  id: number;
  x: number;
  y: number;
  projectileType: ProjectileType;
}

export enum WavePhase {
  Idle,
  Spawning,
  Clearing,
}

export interface WaveState {
  wave: number;
  phase: WavePhase;
  spawnQueue: SpawnEntry[];
  spawnIndex: number;
  waveTimer: number;
}

export interface SpawnEntry {
  config: EnemyConfig;
  spawnTime: number;
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
}

export interface GameState {
  entities: EntityState[];
  projectiles: ProjectileState[];
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
  wave: WaveState;
  waveActive: boolean;
  onPlanetDamaged: GameEvent;
  onWaveComplete: GameEvent;
  onWaveActiveChanged: GameEvent;
  onGoldChanged: GameEvent;
  onDamageDealt: GameDataEvent<DamageData>;
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
    projectiles: [],
    explosions: [],
    laserBeams: [],
    time: { time: 0, deltaTime: 0 },
    nextId: 1,
    planetHealth: 1000,
    maxPlanetHealth: 1000,
    gold: 15,
    wave: {
      wave: 0,
      phase: WavePhase.Idle,
      spawnQueue: [],
      spawnIndex: 0,
      waveTimer: 0,
    },
    waveActive: false,
    onPlanetDamaged: new GameEvent(),
    onWaveComplete: new GameEvent(),
    onWaveActiveChanged: new GameEvent(),
    onGoldChanged: new GameEvent(),
    onDamageDealt: new GameDataEvent<DamageData>(),
  };

  gameState = state;
  for (const cb of stateCreatedListeners) cb();
  stateCreatedListeners.length = 0;
  return state;
}

function spawnFromRight(): { x: number; y: number } {
  const pad = 120;
  return {
    x: CANVAS_WIDTH + pad,
    y: pad + Math.random() * (CANVAS_HEIGHT - pad * 2),
  };
}

export function spawnEntity(state: GameState, config: EnemyConfig, team: Team): void {
  const { x, y } = spawnFromRight();
  const speed = 30 + Math.random() * 52.5;
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
    projectileSpeed: PROJECTILE_SPEED,
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
  };

  state.entities.push(entity);
}

export function spawnAlliedEntity(
  state: GameState,
  config: FriendlyConfig,
  colorPreset: ColorPreset,
  x: number,
  y: number
): number {
  const hitbox = SHIP_HITBOX_MAP[config.entityType];

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx: 0,
    vy: 0,
    health: config.health,
    maxHealth: config.health,
    power: 0,
    colorPreset,
    team: Team.Allied,
    fireRate: 0,
    projectileSpeed: PROJECTILE_SPEED,
    projectileDamage: config.projectileDamage,
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
    healAmount: config.healAmount,
    shieldAmount: config.shieldAmount,
    plasmaStacksApplied: config.plasmaStacks,
    chargesGranted: config.chargesGranted,
    laserDamage: config.laserDamage,
    kills: 0,
    damageDealt: 0,
    totalHealed: 0,
    totalShielded: 0,
    targetingMode: TargetingMode.NearestToShip,
  };

  state.entities.push(entity);
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
  const pr2 = PLANET_HIT_RADIUS * PLANET_HIT_RADIUS;
  let damaged = false;
  let goldGained = false;

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (e.team === Team.Enemy && !isInBounds(e.x, e.y)) {
      state.entities.splice(i, 1);
    }
  }

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    let hit = false;

    if (p.team === Team.Enemy) {
      const dx = p.x - PLANET_X;
      const dy = p.y - PLANET_Y;
      if (dx * dx + dy * dy < pr2) {
        state.planetHealth = Math.max(0, state.planetHealth - p.damage);
        hit = true;
        damaged = true;
        if (p.projectileType !== ProjectileType.Tiny) {
          state.explosions.push({
            id: state.nextId++,
            x: p.x,
            y: p.y,
            projectileType: p.projectileType,
          });
        }
      }
    }

    if (!hit) {
      const opposingTeam = p.team === Team.Enemy ? Team.Allied : Team.Enemy;
      for (let j = state.entities.length - 1; j >= 0; j--) {
        const e = state.entities[j];
        if (e.team !== opposingTeam) continue;
        const dx = Math.abs(p.x - e.x);
        const dy = Math.abs(p.y - e.y);
        if (dx < e.hitHalfW && dy < e.hitHalfH) {
          if (p.plasmaStacks > 0) {
            e.plasmaStacks += p.plasmaStacks;
          }

          let dmg = p.damage;
          if (e.shield > 0) {
            const absorbed = Math.min(e.shield, dmg);
            e.shield -= absorbed;
            dmg -= absorbed;
          }
          e.health -= dmg;

          const source = state.entities.find((s) => s.id === p.sourceId);
          if (source) {
            source.damageDealt += p.damage;
          }

          const killed = e.health <= 0;
          state.onDamageDealt.emit({ amount: p.damage, x: e.x, y: e.y, killed });
          if (killed) {
            if (source) source.kills++;
            state.gold += e.gold;
            goldGained = true;
            state.entities.splice(j, 1);
          }
          hit = true;
          if (p.projectileType !== ProjectileType.Tiny) {
            state.explosions.push({
              id: state.nextId++,
              x: p.x,
              y: p.y,
              projectileType: p.projectileType,
            });
          }
          break;
        }
      }
    }

    if (hit || !isInBounds(p.x, p.y)) {
      state.projectiles.splice(i, 1);
    }
  }

  if (damaged) state.onPlanetDamaged.emit();
  if (goldGained) state.onGoldChanged.emit();
}

const _targetResult = { x: 0, y: 0, vx: 0, vy: 0 };

function findNearestTarget(
  state: GameState,
  entity: EntityState
): { x: number; y: number; vx: number; vy: number } | null {
  const opposingTeam =
    entity.team === Team.Enemy ? Team.Allied : Team.Enemy;

  let bestDist = Infinity;
  let found = false;

  if (entity.team === Team.Enemy) {
    const dx = entity.x - PLANET_X;
    const dy = entity.y - PLANET_Y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      _targetResult.x = PLANET_X;
      _targetResult.y = PLANET_Y;
      _targetResult.vx = 0;
      _targetResult.vy = 0;
      found = true;
    }
  }

  const mode = entity.team === Team.Allied ? entity.targetingMode : TargetingMode.NearestToShip;

  if (mode === TargetingMode.NearestToPlanet) {
    let bestPlanetDist = Infinity;
    for (const other of state.entities) {
      if (other.team !== opposingTeam) continue;
      const dx = other.x - PLANET_X;
      const dy = other.y - PLANET_Y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestPlanetDist) {
        bestPlanetDist = d2;
        _targetResult.x = other.x;
        _targetResult.y = other.y;
        _targetResult.vx = other.vx;
        _targetResult.vy = other.vy;
        found = true;
      }
    }
  } else if (mode === TargetingMode.Strongest) {
    let bestHealth = -Infinity;
    for (const other of state.entities) {
      if (other.team !== opposingTeam) continue;
      if (other.health > bestHealth) {
        bestHealth = other.health;
        _targetResult.x = other.x;
        _targetResult.y = other.y;
        _targetResult.vx = other.vx;
        _targetResult.vy = other.vy;
        found = true;
      }
    }
  } else if (mode === TargetingMode.Weakest) {
    let bestHealth = Infinity;
    for (const other of state.entities) {
      if (other.team !== opposingTeam) continue;
      if (other.health < bestHealth) {
        bestHealth = other.health;
        _targetResult.x = other.x;
        _targetResult.y = other.y;
        _targetResult.vx = other.vx;
        _targetResult.vy = other.vy;
        found = true;
      }
    }
  } else {
    for (const other of state.entities) {
      if (other.team !== opposingTeam) continue;
      const dx = entity.x - other.x;
      const dy = entity.y - other.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        _targetResult.x = other.x;
        _targetResult.y = other.y;
        _targetResult.vx = other.vx;
        _targetResult.vy = other.vy;
        found = true;
      }
    }
  }

  return found ? _targetResult : null;
}

function computeLeadAngle(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  tvx: number,
  tvy: number,
  projectileSpeed: number
): number {
  const dx = tx - sx;
  const dy = ty - sy;
  const a = tvx * tvx + tvy * tvy - projectileSpeed * projectileSpeed;
  const b = 2 * (dx * tvx + dy * tvy);
  const c = dx * dx + dy * dy;

  let t = 0;
  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) > 1e-6) {
      t = -c / b;
    }
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const sqrtDisc = Math.sqrt(disc);
      const t1 = (-b - sqrtDisc) / (2 * a);
      const t2 = (-b + sqrtDisc) / (2 * a);
      if (t1 > 0) t = t1;
      else if (t2 > 0) t = t2;
    }
  }

  if (t <= 0) {
    return Math.atan2(dy, dx);
  }

  return Math.atan2(dy + tvy * t, dx + tvx * t);
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  for (const e of state.entities) {
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
          e.fireTimer -= dt;
          if (e.fireTimer <= 0) {
            e.fireTimer += e.fireRate;

            const angle = computeLeadAngle(
              e.x, e.y,
              target.x, target.y,
              target.vx, target.vy,
              e.projectileSpeed
            );
            state.projectiles.push({
              id: state.nextId++,
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * e.projectileSpeed,
              vy: Math.sin(angle) * e.projectileSpeed,
              damage: e.projectileDamage,
              team: e.team,
              projectileType: e.projectileType,
              plasmaStacks: 0,
              sourceId: e.id,
            });
          }
        }
      } else if (e.speed > 0) {
        e.vx = -e.speed;
        e.vy = 0;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.rotation = Math.atan2(e.vy, e.vx);
      }
    } else if (e.speed > 0) {
      e.vx = -e.speed;
      e.vy = 0;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rotation = Math.atan2(e.vy, e.vx);
    }
  }

  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
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
          state.onGoldChanged.emit();
        }
        state.entities.splice(i, 1);
      }
    }
  }

  checkCollisions(state);

  const LASER_BEAM_DURATION = 0.15;
  for (let i = state.laserBeams.length - 1; i >= 0; i--) {
    if (state.time.time - state.laserBeams[i].time > LASER_BEAM_DURATION) {
      state.laserBeams.splice(i, 1);
    }
  }
}

function fireProjectile(state: GameState, e: EntityState, plasmaStacks: number): void {
  const target = findNearestTarget(state, e);
  if (!target) return;

  const angle = computeLeadAngle(
    e.x, e.y,
    target.x, target.y,
    target.vx, target.vy,
    e.projectileSpeed
  );

  state.projectiles.push({
    id: state.nextId++,
    x: e.x,
    y: e.y,
    vx: Math.cos(angle) * e.projectileSpeed,
    vy: Math.sin(angle) * e.projectileSpeed,
    damage: e.projectileDamage,
    team: e.team,
    projectileType: e.projectileType,
    plasmaStacks,
    sourceId: e.id,
  });
}

function findNearbyAllies(state: GameState, e: EntityState): EntityState[] {
  const r2 = NEARBY_RANGE * NEARBY_RANGE;
  const allies: EntityState[] = [];
  for (const other of state.entities) {
    if (other.id === e.id || other.team !== Team.Allied) continue;
    const dx = e.x - other.x;
    const dy = e.y - other.y;
    if (dx * dx + dy * dy <= r2) {
      allies.push(other);
    }
  }
  return allies;
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

  const endX = e.x + nx * LASER_RANGE;
  const endY = e.y + ny * LASER_RANGE;

  let goldGained = false;
  for (let i = state.entities.length - 1; i >= 0; i--) {
    const other = state.entities[i];
    if (other.team !== Team.Enemy) continue;

    const ex = other.x - e.x;
    const ey = other.y - e.y;
    const proj = ex * nx + ey * ny;
    if (proj < 0 || proj > LASER_RANGE) continue;

    const perpX = ex - proj * nx;
    const perpY = ey - proj * ny;
    const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);

    const hitRadius = Math.max(other.hitHalfW, other.hitHalfH);
    if (perpDist > hitRadius) continue;

    let dmg = e.laserDamage;
    if (other.shield > 0) {
      const absorbed = Math.min(other.shield, dmg);
      other.shield -= absorbed;
      dmg -= absorbed;
    }
    other.health -= dmg;
    e.damageDealt += e.laserDamage;

    const killed = other.health <= 0;
    state.onDamageDealt.emit({ amount: e.laserDamage, x: other.x, y: other.y, killed });
    if (killed) {
      e.kills++;
      state.gold += other.gold;
      goldGained = true;
      state.entities.splice(i, 1);
    }
  }

  if (goldGained) state.onGoldChanged.emit();

  state.laserBeams.push({
    id: state.nextId++,
    x1: e.x,
    y1: e.y,
    x2: endX,
    y2: endY,
    time: state.time.time,
  });
}

function activateAbility(state: GameState, e: EntityState): void {
  if (e.charge < e.chargesRequired) return;
  e.charge = 0;

  if (e.healAmount > 0) {
    const allies = findNearbyAllies(state, e);
    for (const ally of allies) {
      const healed = Math.min(ally.maxHealth - ally.health, e.healAmount);
      ally.health += healed;
      e.totalHealed += healed;
    }
    return;
  }

  if (e.shieldAmount > 0) {
    const allies = findNearbyAllies(state, e);
    for (const ally of allies) {
      ally.shield += e.shieldAmount;
      e.totalShielded += e.shieldAmount;
    }
    return;
  }

  if (e.chargesGranted > 0) {
    const allies = findNearbyAllies(state, e);
    for (const ally of allies) {
      if (ally.chargesRequired <= 0) continue;
      if (ally.chargesGranted > 0) continue;
      ally.charge = Math.min(ally.chargesRequired, ally.charge + e.chargesGranted);
      activateAbility(state, ally);
    }
    return;
  }

  if (e.laserDamage > 0) {
    fireLaser(state, e);
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

const WAVE_SPAWN_DURATION = 15;

export function generateWaveSpawns(wave: number, catalog: EnemyConfig[]): SpawnEntry[] {
  const totalPower = Math.round(80 * Math.pow(wave, 1.5));
  const minCatalogPower = catalog.length > 0 ? Math.min(...catalog.map(e => e.power)) : 10;
  const maxSinglePower = Math.max(minCatalogPower, Math.floor(totalPower * 0.4));

  const eligible = catalog.filter((e) => e.power <= maxSinglePower);
  if (eligible.length === 0) return [];

  const cutoffPower = Math.max(eligible[0].power, Math.floor(totalPower * 0.05));
  const enemies: EnemyConfig[] = [];
  let remaining = totalPower;

  while (remaining >= cutoffPower) {
    const affordable = eligible.filter((e) => e.power <= remaining);
    if (affordable.length === 0) break;

    const pick = affordable[Math.floor(Math.random() * affordable.length)];
    enemies.push(pick);
    remaining -= pick.power;
  }

  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }

  const interval =
    enemies.length > 1 ? WAVE_SPAWN_DURATION / (enemies.length - 1) : 0;

  return enemies.map((config, i) => ({
    config,
    spawnTime: i * interval,
  }));
}

export function startNextWave(state: GameState): void {
  state.wave.wave++;
  state.wave.spawnQueue = generateWaveSpawns(state.wave.wave, ENEMY_CATALOG);
  state.wave.spawnIndex = 0;
  state.wave.waveTimer = 0;
  state.wave.phase = WavePhase.Spawning;
}

export function completeWave(state: GameState): void {
  const bonus = 10 + state.wave.wave * 5;
  state.gold += bonus;
  state.projectiles.length = 0;
  state.wave.phase = WavePhase.Idle;
  state.onWaveComplete.emit();
  state.onGoldChanged.emit();
}
