import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SPEED_MIN, SHIP_SPEED_MAX, ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX, SHIP_SPAWN_INTERVAL, ASTEROID_SPAWN_INTERVAL } from "./constants";
import {
  ShipType, EngineType, ColorPreset, MeteorType,
  SHIP_TYPE_COUNT, ENGINE_TYPE_COUNT, COLOR_PRESET_COUNT, METEOR_TYPE_COUNT,
} from "./types";
import { pickEdgeSpawn, randInt } from "./utils";

export interface ShipState {
  id: number;
  x: number;
  y: number;
  vx: number;
  shipType: ShipType;
  colorPreset: ColorPreset;
  engineType: EngineType;
  hasShield: boolean;
}

export interface MeteorState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  meteorType: MeteorType;
  variant: number;
}

export interface GameState {
  ships: ShipState[];
  meteors: MeteorState[];
  shipSpawnTimer: number;
  meteorSpawnTimer: number;
  nextId: number;
}

export function createInitialState(): GameState {
  return {
    ships: [],
    meteors: [],
    shipSpawnTimer: 0,
    meteorSpawnTimer: 0,
    nextId: 1,
  };
}

export function spawnShip(state: GameState): void {
  state.ships.push({
    id: state.nextId++,
    x: -100,
    y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
    vx: SHIP_SPEED_MIN + Math.random() * (SHIP_SPEED_MAX - SHIP_SPEED_MIN),
    shipType: randInt(SHIP_TYPE_COUNT),
    colorPreset: randInt(COLOR_PRESET_COUNT),
    engineType: randInt(ENGINE_TYPE_COUNT),
    hasShield: Math.random() > 0.5,
  });
}

export function spawnMeteor(state: GameState): void {
  const { x, y, angle } = pickEdgeSpawn(CANVAS_WIDTH, CANVAS_HEIGHT);
  const speed =
    ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  state.meteors.push({
    id: state.nextId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    meteorType: randInt(METEOR_TYPE_COUNT),
    variant: randInt(16),
  });
}

export function updateState(state: GameState, dt: number): void {
  state.shipSpawnTimer += dt;
  if (state.shipSpawnTimer >= SHIP_SPAWN_INTERVAL) {
    state.shipSpawnTimer = 0;
    spawnShip(state);
  }

  state.meteorSpawnTimer += dt;
  if (state.meteorSpawnTimer >= ASTEROID_SPAWN_INTERVAL) {
    state.meteorSpawnTimer = 0;
    spawnMeteor(state);
  }

  for (const ship of state.ships) {
    ship.x += ship.vx * dt;
  }

  for (const m of state.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.rotation += m.rotationSpeed * dt;
  }

  const pad = 100;
  state.ships = state.ships.filter((s) => s.x <= CANVAS_WIDTH + 200);
  state.meteors = state.meteors.filter(
    (m) =>
      m.x >= -pad &&
      m.x <= CANVAS_WIDTH + pad &&
      m.y >= -pad &&
      m.y <= CANVAS_HEIGHT + pad
  );
}
