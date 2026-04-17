import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset, ProjectileType, Team } from "./types";
import { ENEMY_CATALOG, SHIP_HITBOX_MAP, type EnemyConfig, type FriendlyConfig, goldForEnemy } from "./enemyConfig";

export const PLANET_X = 200;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;

export interface EntityState {
  id: number;
  entityType: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
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

export interface GameState {
  entities: EntityState[];
  projectiles: ProjectileState[];
  explosions: ExplosionState[];
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
    power: config.power,
    colorPreset: ColorPreset.Preset4,
    team,
    fireRate: config.fireRate,
    projectileSpeed: config.projectileSpeed,
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
  };

  state.entities.push(entity);
}

export function spawnAlliedEntity(
  state: GameState,
  config: FriendlyConfig,
  colorPreset: ColorPreset,
  x: number,
  y: number
): void {
  const hitbox = SHIP_HITBOX_MAP[config.entityType];

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx: 0,
    vy: 0,
    health: config.health,
    power: 0,
    colorPreset,
    team: Team.Allied,
    fireRate: 0,
    projectileSpeed: config.projectileSpeed,
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
  };

  state.entities.push(entity);
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
          e.health -= p.damage;
          if (e.health <= 0) {
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
            });
          }
        }
      } else if (e.speed > 0) {
        e.vx = -e.speed;
        e.vy = 0;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.rotation = Math.atan2(dy, dx);
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

  checkCollisions(state);
}

function tryFireEntity(state: GameState, e: EntityState): void {
  if (e.charge < e.chargesRequired) return;

  const target = findNearestTarget(state, e);
  if (!target) return;

  e.charge = 0;

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
  });
}

export function onCorrectKeystroke(state: GameState): void {
  for (const e of state.entities) {
    if (e.chargesRequired <= 0) continue;
    e.charge++;
    tryFireEntity(state, e);
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
  state.wave.phase = WavePhase.Idle;
  state.onWaveComplete.emit();
  state.onGoldChanged.emit();
}
