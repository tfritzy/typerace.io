import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  ShipType, ColorPreset, MeteorType,
  SHIP_TYPE_COUNT, COLOR_PRESET_COUNT, METEOR_TYPE_COUNT,
} from "./types";
import { randInt } from "./utils";

const PLANET_X = CANVAS_WIDTH / 2;
const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;

export interface ShipState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shipType: ShipType;
  colorPreset: ColorPreset;
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
  nextId: number;
  planetHealth: number;
  maxPlanetHealth: number;
  listeners: Set<() => void>;
}

export function createGameState(): GameState {
  return {
    ships: [],
    meteors: [],
    nextId: 1,
    planetHealth: 100,
    maxPlanetHealth: 100,
    listeners: new Set(),
  };
}

export function subscribe(
  state: GameState,
  listener: () => void
): () => void {
  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
}

function notify(state: GameState): void {
  for (const listener of state.listeners) listener();
}

function spawnFromEdge(): { x: number; y: number } {
  const pad = 60;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0:
      return { x: Math.random() * CANVAS_WIDTH, y: -pad };
    case 1:
      return { x: CANVAS_WIDTH + pad, y: Math.random() * CANVAS_HEIGHT };
    case 2:
      return { x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + pad };
    default:
      return { x: -pad, y: Math.random() * CANVAS_HEIGHT };
  }
}

function aimAtPlanet(
  x: number,
  y: number,
  speed: number,
  spread: number
): { vx: number; vy: number } {
  const angle =
    Math.atan2(PLANET_Y - y, PLANET_X - x) + (Math.random() - 0.5) * spread;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

export function spawnShip(state: GameState): void {
  const { x, y } = spawnFromEdge();
  const speed = 60 + Math.random() * 80;
  const { vx, vy } = aimAtPlanet(x, y, speed, 0.3);
  state.ships.push({
    id: state.nextId++,
    x,
    y,
    vx,
    vy,
    shipType: randInt(SHIP_TYPE_COUNT),
    colorPreset: randInt(COLOR_PRESET_COUNT),
    hasShield: Math.random() > 0.5,
  });
}

export function spawnMeteor(state: GameState): void {
  const { x, y } = spawnFromEdge();
  const speed = 30 + Math.random() * 70;
  const { vx, vy } = aimAtPlanet(x, y, speed, 0.5);
  const rotDir = Math.random() > 0.5 ? 1 : -1;
  state.meteors.push({
    id: state.nextId++,
    x,
    y,
    vx,
    vy,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    meteorType: randInt(METEOR_TYPE_COUNT),
    variant: randInt(16),
  });
}

export function updateState(state: GameState, dt: number): void {
  for (const ship of state.ships) {
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
  }
  for (const m of state.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.rotation += m.rotationSpeed * dt;
  }

  let healthChanged = false;
  const r2 = PLANET_HIT_RADIUS * PLANET_HIT_RADIUS;

  state.ships = state.ships.filter((s) => {
    const dx = s.x - PLANET_X;
    const dy = s.y - PLANET_Y;
    if (dx * dx + dy * dy < r2) {
      state.planetHealth = Math.max(0, state.planetHealth - 5);
      healthChanged = true;
      return false;
    }
    return true;
  });

  state.meteors = state.meteors.filter((m) => {
    const dx = m.x - PLANET_X;
    const dy = m.y - PLANET_Y;
    if (dx * dx + dy * dy < r2) {
      state.planetHealth = Math.max(0, state.planetHealth - 3);
      healthChanged = true;
      return false;
    }
    return true;
  });

  if (healthChanged) notify(state);

  const pad = 200;
  state.ships = state.ships.filter(
    (s) =>
      s.x >= -pad &&
      s.x <= CANVAS_WIDTH + pad &&
      s.y >= -pad &&
      s.y <= CANVAS_HEIGHT + pad
  );
  state.meteors = state.meteors.filter(
    (m) =>
      m.x >= -pad &&
      m.x <= CANVAS_WIDTH + pad &&
      m.y >= -pad &&
      m.y <= CANVAS_HEIGHT + pad
  );
}
