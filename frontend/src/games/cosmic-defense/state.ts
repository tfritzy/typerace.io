import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset, type ProjectileType, Team } from "./types";
import { ENEMY_CATALOG, type EnemyConfig } from "./enemyConfig";

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
  firingRange: number;
  fireRate: number;
  projectileSpeed: number;
  projectileType: ProjectileType;
  fireTimer: number;
  rotation: number;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  time: {
    time: number;
    deltaTime: number;
  };
  nextId: number;
  planetHealth: number;
  maxPlanetHealth: number;
  wave: WaveState;
  waveActive: boolean;
  onPlanetDamaged: GameEvent;
  onWaveComplete: GameEvent;
  onWaveActiveChanged: GameEvent;
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
    time: { time: 0, deltaTime: 0 },
    nextId: 1,
    planetHealth: 1000,
    maxPlanetHealth: 1000,
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
    firingRange: config.firingRange,
    fireRate: config.fireRate,
    projectileSpeed: config.projectileSpeed,
    projectileType: config.projectileType,
    fireTimer: Math.random() * config.fireRate,
    rotation: Math.PI,
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

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    if (!isInBounds(e.x, e.y)) {
      state.entities.splice(i, 1);
    }
  }

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    const dx = p.x - PLANET_X;
    const dy = p.y - PLANET_Y;
    if (dx * dx + dy * dy < pr2) {
      state.planetHealth = Math.max(0, state.planetHealth - 10);
      state.projectiles.splice(i, 1);
      damaged = true;
    } else if (!isInBounds(p.x, p.y)) {
      state.projectiles.splice(i, 1);
    }
  }

  if (damaged) state.onPlanetDamaged.emit();
}

function findNearestTarget(
  state: GameState,
  entity: EntityState
): { x: number; y: number } | null {
  const opposingTeam =
    entity.team === Team.Enemy ? Team.Allied : Team.Enemy;

  let bestDist = Infinity;
  let bestTarget: { x: number; y: number } | null = null;

  if (entity.team === Team.Enemy) {
    const dx = entity.x - PLANET_X;
    const dy = entity.y - PLANET_Y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      bestTarget = { x: PLANET_X, y: PLANET_Y };
    }
  }

  for (const other of state.entities) {
    if (other.team !== opposingTeam) continue;
    const dx = entity.x - other.x;
    const dy = entity.y - other.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      bestTarget = { x: other.x, y: other.y };
    }
  }

  return bestTarget;
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  for (const e of state.entities) {
    const target =
      e.firingRange > 0 ? findNearestTarget(state, e) : null;
    let inRange = false;

    if (target) {
      const dx = e.x - target.x;
      const dy = e.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      inRange = dist <= e.firingRange;

      if (inRange) {
        e.rotation = Math.atan2(target.y - e.y, target.x - e.x);
        e.fireTimer -= dt;
        if (e.fireTimer <= 0) {
          e.fireTimer += e.fireRate;

          const angle = Math.atan2(target.y - e.y, target.x - e.x);
          state.projectiles.push({
            id: state.nextId++,
            x: e.x,
            y: e.y,
            vx: Math.cos(angle) * e.projectileSpeed,
            vy: Math.sin(angle) * e.projectileSpeed,
            projectileType: e.projectileType,
          });
        }
      }
    }

    if (!inRange) {
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

const WAVE_SPAWN_DURATION = 15;

export function generateWaveSpawns(wave: number, catalog: EnemyConfig[]): SpawnEntry[] {
  const totalPower = Math.round(80 * Math.pow(wave, 1.5));
  const maxSinglePower = Math.max(10, Math.floor(totalPower * 0.4));

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
