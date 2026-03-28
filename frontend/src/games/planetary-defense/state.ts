import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  ShipType, ColorPreset, MeteorType,
  SHIP_TYPE_COUNT, COLOR_PRESET_COUNT, METEOR_TYPE_COUNT,
} from "./types";
import { randInt } from "./utils";
import { createPrefixedId } from "./idGenerator";
import { getLanguageFromSlug } from "../../utils/modes";
import { getRandomWord } from "../../utils/wordLists";

const PLANET_X = CANVAS_WIDTH / 2;
const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;

export interface ShipState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shipType: ShipType;
  colorPreset: ColorPreset;
  hasShield: boolean;
  word: string;
  typedCount: number;
}

export interface MeteorState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  meteorType: MeteorType;
  variant: number;
  word: string;
  typedCount: number;
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
  ships: ShipState[];
  meteors: MeteorState[];
  enemiesKilled: number;
  planetHealth: number;
  maxPlanetHealth: number;
  onPlanetDamaged: GameEvent;
}

export function createGameState(): GameState {
  return {
    ships: [],
    meteors: [],
    enemiesKilled: 0,
    planetHealth: 100,
    maxPlanetHealth: 100,
    onPlanetDamaged: new GameEvent(),
  };
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
  speed: number
): { vx: number; vy: number } {
  const angle = Math.atan2(PLANET_Y - y, PLANET_X - x);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function getLangCode(): string {
  try {
    const slug = localStorage.getItem("typerace_lang_slug");
    return getLanguageFromSlug(slug ?? undefined).htmlLang;
  } catch {
    return "en";
  }
}

export function spawnShip(state: GameState): void {
  const { x, y } = spawnFromEdge();
  const speed = 60 + Math.random() * 80;
  const { vx, vy } = aimAtPlanet(x, y, speed);
  const usedWords = new Set([
    ...state.ships.map((ship) => ship.word),
    ...state.meteors.map((meteor) => meteor.word),
  ]);
  const word = getRandomWord(getLangCode(), usedWords);
  state.ships.push({
    id: createPrefixedId("ship"),
    x,
    y,
    vx,
    vy,
    shipType: randInt(SHIP_TYPE_COUNT),
    colorPreset: randInt(COLOR_PRESET_COUNT),
    hasShield: Math.random() > 0.5,
    word,
    typedCount: 0,
  });
}

export function spawnMeteor(state: GameState): void {
  const { x, y } = spawnFromEdge();
  const speed = 30 + Math.random() * 70;
  const { vx, vy } = aimAtPlanet(x, y, speed);
  const rotDir = Math.random() > 0.5 ? 1 : -1;
  const usedWords = new Set([
    ...state.ships.map((ship) => ship.word),
    ...state.meteors.map((meteor) => meteor.word),
  ]);
  const word = getRandomWord(getLangCode(), usedWords);
  state.meteors.push({
    id: createPrefixedId("meteor"),
    x,
    y,
    vx,
    vy,
    rotation: 0,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
    meteorType: randInt(METEOR_TYPE_COUNT),
    variant: randInt(16),
    word,
    typedCount: 0,
  });
}

function applyTypedCharacter<T extends { word: string; typedCount: number }>(
  state: GameState,
  entities: T[],
  key: string
): void {
  const normalizedKey = key.toLowerCase();
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    const nextChar = entity.word[entity.typedCount];
    if (normalizedKey === nextChar.toLowerCase()) {
      entity.typedCount++;
      if (entity.typedCount >= entity.word.length) {
        destroyEntity(state, entities, i, true);
      }
    } else if (entity.typedCount > 0) {
      entity.typedCount = 0;
    }
  }
}

function destroyEntity<T>(
  state: GameState,
  entities: T[],
  index: number,
  killed: boolean
): void {
  if (killed) {
    state.enemiesKilled++;
  }
  entities.splice(index, 1);
}

export function handleTypedCharacter(state: GameState, key: string): void {
  if (key.length !== 1) return;
  applyTypedCharacter(state, state.ships, key);
  applyTypedCharacter(state, state.meteors, key);
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

  for (let i = state.ships.length - 1; i >= 0; i--) {
    const s = state.ships[i];
    const dx = s.x - PLANET_X;
    const dy = s.y - PLANET_Y;
    if (dx * dx + dy * dy < r2) {
      state.planetHealth = Math.max(0, state.planetHealth - 5);
      destroyEntity(state, state.ships, i, false);
      damaged = true;
    } else if (!isInBounds(s.x, s.y)) {
      destroyEntity(state, state.ships, i, false);
    }
  }

  for (let i = state.meteors.length - 1; i >= 0; i--) {
    const m = state.meteors[i];
    const dx = m.x - PLANET_X;
    const dy = m.y - PLANET_Y;
    if (dx * dx + dy * dy < r2) {
      state.planetHealth = Math.max(0, state.planetHealth - 3);
      destroyEntity(state, state.meteors, i, false);
      damaged = true;
    } else if (!isInBounds(m.x, m.y)) {
      destroyEntity(state, state.meteors, i, false);
    }
  }

  if (damaged) state.onPlanetDamaged.emit();
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

  checkCollisions(state);
}
