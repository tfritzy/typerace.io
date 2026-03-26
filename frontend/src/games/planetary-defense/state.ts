import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SPEED_MIN, SHIP_SPEED_MAX, ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX, SHIP_SPAWN_INTERVAL, ASTEROID_SPAWN_INTERVAL } from "./constants";
import {
  ShipType, EngineType, ColorPreset, MeteorType,
  SHIP_TYPE_COUNT, ENGINE_TYPE_COUNT, COLOR_PRESET_COUNT, METEOR_TYPE_COUNT,
} from "./types";
import { pickEdgeSpawn } from "../utils";

export interface ShipState {
  id: number;
  x: number;
  y: number;
  vx: number;
  shipType: ShipType;
  colorPreset: ColorPreset;
  engineType: EngineType;
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

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
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

export function spawnShip(state: GameState): ShipState {
  const ship: ShipState = {
    id: state.nextId++,
    x: -100,
    y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
    vx: SHIP_SPEED_MIN + Math.random() * (SHIP_SPEED_MAX - SHIP_SPEED_MIN),
    shipType: randInt(SHIP_TYPE_COUNT),
    colorPreset: randInt(COLOR_PRESET_COUNT),
    engineType: randInt(ENGINE_TYPE_COUNT),
  };
  state.ships.push(ship);
  return ship;
}

export function spawnMeteor(
  state: GameState,
  meteorVariantCounts: Record<MeteorType, number>
): MeteorState {
  const meteorType: MeteorType = randInt(METEOR_TYPE_COUNT);
  const { x, y, angle } = pickEdgeSpawn(CANVAS_WIDTH, CANVAS_HEIGHT);
  const speed =
    ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  const meteor: MeteorState = {
    id: state.nextId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    meteorType,
    variant: randInt(meteorVariantCounts[meteorType] || 1),
  };
  state.meteors.push(meteor);
  return meteor;
}

export function spawnMeteorAt(
  state: GameState,
  meteorVariantCounts: Record<MeteorType, number>,
  canvasX: number,
  canvasY: number
): MeteorState {
  const meteorType: MeteorType = randInt(METEOR_TYPE_COUNT);
  const speed =
    ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);
  const angle = Math.random() * Math.PI * 2;
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  const meteor: MeteorState = {
    id: state.nextId++,
    x: canvasX,
    y: canvasY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    meteorType,
    variant: randInt(meteorVariantCounts[meteorType] || 1),
  };
  state.meteors.push(meteor);
  return meteor;
}

export interface UpdateResult {
  newShip: ShipState | null;
  newMeteor: MeteorState | null;
  removedShipIds: number[];
  removedMeteorIds: number[];
}

export function updateState(
  state: GameState,
  dt: number,
  meteorVariantCounts: Record<MeteorType, number>
): UpdateResult {
  const result: UpdateResult = {
    newShip: null,
    newMeteor: null,
    removedShipIds: [],
    removedMeteorIds: [],
  };

  state.shipSpawnTimer += dt;
  if (state.shipSpawnTimer >= SHIP_SPAWN_INTERVAL) {
    state.shipSpawnTimer = 0;
    result.newShip = spawnShip(state);
  }

  state.meteorSpawnTimer += dt;
  if (state.meteorSpawnTimer >= ASTEROID_SPAWN_INTERVAL) {
    state.meteorSpawnTimer = 0;
    result.newMeteor = spawnMeteor(state, meteorVariantCounts);
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
  state.ships = state.ships.filter((s) => {
    if (s.x > CANVAS_WIDTH + 200) {
      result.removedShipIds.push(s.id);
      return false;
    }
    return true;
  });

  state.meteors = state.meteors.filter((m) => {
    const oob =
      m.x < -pad ||
      m.x > CANVAS_WIDTH + pad ||
      m.y < -pad ||
      m.y > CANVAS_HEIGHT + pad;
    if (oob) {
      result.removedMeteorIds.push(m.id);
      return false;
    }
    return true;
  });

  return result;
}
