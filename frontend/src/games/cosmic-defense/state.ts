import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EntityType, ColorPreset } from "./types";
import type { EnemyConfig } from "./enemyConfig";

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
    time: { time: 0, deltaTime: 0 },
    nextId: 1,
    planetHealth: 100,
    maxPlanetHealth: 100,
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
  const pad = 60;
  return {
    x: CANVAS_WIDTH + pad,
    y: pad + Math.random() * (CANVAS_HEIGHT - pad * 2),
  };
}

function aimAtPlanet(
  x: number,
  y: number,
  speed: number
): { vx: number; vy: number } {
  const angle = Math.atan2(PLANET_Y - y, PLANET_X - x);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

export function spawnEntity(state: GameState, config: EnemyConfig): void {
  const { x, y } = spawnFromRight();
  const speed = 20 + Math.random() * 35;
  const { vx, vy } = aimAtPlanet(x, y, speed);

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx,
    vy,
    health: config.health,
    power: config.power,
    colorPreset: ColorPreset.Preset4,
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
  const r2 = PLANET_HIT_RADIUS * PLANET_HIT_RADIUS;
  let damaged = false;

  for (let i = state.entities.length - 1; i >= 0; i--) {
    const e = state.entities[i];
    const dx = e.x - PLANET_X;
    const dy = e.y - PLANET_Y;
    if (dx * dx + dy * dy < r2) {
      state.planetHealth = Math.max(0, state.planetHealth - 3);
      state.entities.splice(i, 1);
      damaged = true;
    } else if (!isInBounds(e.x, e.y)) {
      state.entities.splice(i, 1);
    }
  }

  if (damaged) state.onPlanetDamaged.emit();
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  state.time.time += dt;

  for (const e of state.entities) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;
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

const ENEMY_CATALOG: EnemyConfig[] = [
  { entityType: "Dot", health: 50, power: 50 },
  { entityType: "Speck", health: 60, power: 60 },
  { entityType: "Pip", health: 70, power: 70 },
  { entityType: "Mite", health: 80, power: 80 },
  { entityType: "Gnat", health: 90, power: 90 },
  { entityType: "Flea", health: 100, power: 100 },
  { entityType: "Flicker", health: 110, power: 110 },
  { entityType: "Needle", health: 130, power: 130 },
  { entityType: "Barb", health: 150, power: 150 },
  { entityType: "Spur", health: 170, power: 170 },
  { entityType: "Bolt", health: 190, power: 190 },
  { entityType: "Sliver", health: 225, power: 225 },
  { entityType: "Cricket", health: 250, power: 250 },
  { entityType: "Moth", health: 300, power: 300 },
  { entityType: "Robin", health: 325, power: 325 },
  { entityType: "Finch", health: 375, power: 375 },
  { entityType: "Sparrow", health: 450, power: 450 },
  { entityType: "Wasp", health: 500, power: 500 },
  { entityType: "Hornet", health: 575, power: 575 },
  { entityType: "Stinger", health: 650, power: 650 },
  { entityType: "Dart", health: 750, power: 750 },
  { entityType: "Arrow", health: 875, power: 875 },
  { entityType: "Scout", health: 1000, power: 1000 },
];
