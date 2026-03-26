import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SPEED_MIN, SHIP_SPEED_MAX, ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX, SHIP_SPAWN_INTERVAL, ASTEROID_SPAWN_INTERVAL } from "./constants";
import { ENGINE_ALIASES, COLOR_PRESET_ALIASES, ASTEROID_ALIASES } from "./manifest";

export interface ShipState {
  id: number;
  x: number;
  y: number;
  vx: number;
  shipFrame: string;
  colormapFrame: string;
  presetAlias: string;
  engineAlias: string;
}

export interface AsteroidState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  asteroidAlias: string;
  textureIndex: number;
}

export interface GameState {
  ships: ShipState[];
  asteroids: AsteroidState[];
  shipSpawnTimer: number;
  asteroidSpawnTimer: number;
  nextId: number;
  planetFrame: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickEdgeSpawn(): { x: number; y: number; angle: number } {
  const edge = Math.floor(Math.random() * 4);
  const pad = 40;

  switch (edge) {
    case 0:
      return {
        x: -pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: -Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    case 1:
      return {
        x: CANVAS_WIDTH + pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: Math.PI - Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    case 2:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: -pad,
        angle: Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    default:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: CANVAS_HEIGHT + pad,
        angle: -(Math.PI / 4 + (Math.random() * Math.PI) / 2),
      };
  }
}

export function createInitialState(
  planetFrames: string[]
): GameState {
  return {
    ships: [],
    asteroids: [],
    shipSpawnTimer: 0,
    asteroidSpawnTimer: 0,
    nextId: 1,
    planetFrame: pickRandom(planetFrames),
  };
}

export function spawnShip(
  state: GameState,
  shipFrameNames: string[]
): ShipState {
  const frameName = pickRandom(shipFrameNames);
  const ship: ShipState = {
    id: state.nextId++,
    x: -100,
    y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
    vx: SHIP_SPEED_MIN + Math.random() * (SHIP_SPEED_MAX - SHIP_SPEED_MIN),
    shipFrame: frameName,
    colormapFrame: `cm-${frameName.replace("ship-", "")}`,
    presetAlias: pickRandom(COLOR_PRESET_ALIASES),
    engineAlias: pickRandom(ENGINE_ALIASES),
  };
  state.ships.push(ship);
  return ship;
}

export function spawnAsteroid(
  state: GameState,
  asteroidTextureCounts: Record<string, number>
): AsteroidState {
  const alias = pickRandom(ASTEROID_ALIASES);
  const { x, y, angle } = pickEdgeSpawn();
  const speed =
    ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  const asteroid: AsteroidState = {
    id: state.nextId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    asteroidAlias: alias,
    textureIndex: Math.floor(Math.random() * (asteroidTextureCounts[alias] || 1)),
  };
  state.asteroids.push(asteroid);
  return asteroid;
}

export interface UpdateResult {
  newShip: ShipState | null;
  newAsteroid: AsteroidState | null;
  removedShipIds: number[];
  removedAsteroidIds: number[];
}

export function updateState(
  state: GameState,
  dt: number,
  shipFrameNames: string[],
  asteroidTextureCounts: Record<string, number>
): UpdateResult {
  const result: UpdateResult = {
    newShip: null,
    newAsteroid: null,
    removedShipIds: [],
    removedAsteroidIds: [],
  };

  state.shipSpawnTimer += dt;
  if (state.shipSpawnTimer >= SHIP_SPAWN_INTERVAL) {
    state.shipSpawnTimer = 0;
    result.newShip = spawnShip(state, shipFrameNames);
  }

  state.asteroidSpawnTimer += dt;
  if (state.asteroidSpawnTimer >= ASTEROID_SPAWN_INTERVAL) {
    state.asteroidSpawnTimer = 0;
    result.newAsteroid = spawnAsteroid(state, asteroidTextureCounts);
  }

  for (const ship of state.ships) {
    ship.x += ship.vx * dt;
  }

  const pad = 100;
  for (const a of state.asteroids) {
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.rotation += a.rotationSpeed * dt;
  }

  state.ships = state.ships.filter((s) => {
    if (s.x > CANVAS_WIDTH + 200) {
      result.removedShipIds.push(s.id);
      return false;
    }
    return true;
  });

  state.asteroids = state.asteroids.filter((a) => {
    const oob =
      a.x < -pad ||
      a.x > CANVAS_WIDTH + pad ||
      a.y < -pad ||
      a.y > CANVAS_HEIGHT + pad;
    if (oob) {
      result.removedAsteroidIds.push(a.id);
      return false;
    }
    return true;
  });

  return result;
}
