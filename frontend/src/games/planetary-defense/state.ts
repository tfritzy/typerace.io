import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  ShipType, ColorPreset, MeteorType,
  COLOR_PRESET_COUNT,
} from "./types";
import { randInt } from "./utils";
import { getLanguageFromSlug } from "../../utils/modes";
import { getRandomWord } from "../../utils/wordLists";
import {
  TowerType,
  TOWER_CONFIGS,
  TOWER_SLOT_COUNT,
  TOWER_ORBIT_RADIUS,
} from "./towerConfig";
import { type EnemyConfig } from "./enemyConfig";
import { generateWaveSpawns, type SpawnEntry } from "./waveConfig";

export const PLANET_X = CANVAS_WIDTH / 2;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;

export function getTowerPosition(slot: TowerSlot): { x: number; y: number } {
  return {
    x: PLANET_X + Math.cos(slot.angle) * TOWER_ORBIT_RADIUS,
    y: PLANET_Y + Math.sin(slot.angle) * TOWER_ORBIT_RADIUS,
  };
}

export interface EntityState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  word: string;
  typedCount: number;
  health: number;
  power: number;
  shipType?: ShipType;
  colorPreset?: ColorPreset;
  hasShield?: boolean;
  meteorType?: MeteorType;
  variant?: number;
}

export interface TowerState {
  type: TowerType;
  level: number;
  charge: number;
}

export interface TowerSlot {
  angle: number;
  tower: TowerState | null;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
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
  towerSlots: TowerSlot[];
  projectiles: ProjectileState[];
  nextId: number;
  enemiesKilled: number;
  planetHealth: number;
  maxPlanetHealth: number;
  wave: WaveState;
  onPlanetDamaged: GameEvent;
  onTowerFired: GameEvent;
  onWaveComplete: GameEvent;
}

function createTowerSlots(): TowerSlot[] {
  const slots: TowerSlot[] = [];
  for (let i = 0; i < TOWER_SLOT_COUNT; i++) {
    const angle = (i * 2 * Math.PI) / TOWER_SLOT_COUNT - Math.PI / 2;
    const tower =
      i % 2 === 0
        ? { type: TowerType.Gun, level: 1, charge: 0 }
        : null;
    slots.push({ angle, tower });
  }
  return slots;
}

export function createGameState(): GameState {
  return {
    entities: [],
    towerSlots: createTowerSlots(),
    projectiles: [],
    nextId: 1,
    enemiesKilled: 0,
    planetHealth: 100,
    maxPlanetHealth: 100,
    wave: {
      wave: 0,
      phase: WavePhase.Idle,
      spawnQueue: [],
      spawnIndex: 0,
      waveTimer: 0,
    },
    onPlanetDamaged: new GameEvent(),
    onTowerFired: new GameEvent(),
    onWaveComplete: new GameEvent(),
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

export function spawnEntity(state: GameState, config: EnemyConfig): void {
  const { x, y } = spawnFromEdge();
  const speed = 20 + Math.random() * 35;
  const { vx, vy } = aimAtPlanet(x, y, speed);
  const usedWords = new Set(state.entities.map((e) => e.word));
  const word = getRandomWord(getLangCode(), usedWords);
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  const entity: EntityState = {
    id: state.nextId++,
    x,
    y,
    vx,
    vy,
    rotation: 0,
    rotationSpeed: config.meteorType != null ? (0.5 + Math.random() * 1.5) * rotDir : 0,
    word,
    typedCount: 0,
    health: config.health,
    power: config.power,
  };

  if (config.shipType != null) {
    entity.shipType = config.shipType;
    entity.colorPreset = randInt(COLOR_PRESET_COUNT);
    entity.hasShield = Math.random() > 0.5;
  }

  if (config.meteorType != null) {
    entity.meteorType = config.meteorType;
    entity.variant = randInt(16);
  }

  state.entities.push(entity);
}

function applyTypedCharacter(
  entities: EntityState[],
  key: string
): void {
  const normalizedKey = key.toLowerCase();
  for (const entity of entities) {
    if (entity.typedCount >= entity.word.length) continue;
    const nextChar = entity.word[entity.typedCount];
    if (normalizedKey === nextChar.toLowerCase()) {
      entity.typedCount++;
    } else if (entity.typedCount > 0) {
      entity.typedCount = 0;
    }
  }
}

function rerollCompletedWords(state: GameState): void {
  const usedWords = new Set(state.entities.map((e) => e.word));
  const langCode = getLangCode();
  for (const entity of state.entities) {
    if (entity.typedCount >= entity.word.length) {
      entity.word = getRandomWord(langCode, usedWords);
      usedWords.add(entity.word);
      entity.typedCount = 0;
    }
  }
}

function destroyEntity(
  state: GameState,
  index: number,
  killed: boolean
): void {
  if (killed) {
    state.enemiesKilled++;
  }
  state.entities.splice(index, 1);
}

export function handleTypedCharacter(state: GameState, key: string): void {
  if (key.length !== 1) return;
  applyTypedCharacter(state.entities, key);
  rerollCompletedWords(state);
  chargeTowers(state);
}

const SECTOR_HALF = Math.PI / 4;

function isInSector(slot: TowerSlot, ex: number, ey: number): boolean {
  const enemyAngle = Math.atan2(ey - PLANET_Y, ex - PLANET_X);
  let diff = enemyAngle - slot.angle;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  return Math.abs(diff) <= SECTOR_HALF;
}

function findTypedTargetInSector(
  state: GameState,
  slot: TowerSlot
): { x: number; y: number } | null {
  for (const entity of state.entities) {
    if (entity.typedCount > 0 && isInSector(slot, entity.x, entity.y)) return entity;
  }
  return null;
}

function chargeTowers(state: GameState): void {
  for (const slot of state.towerSlots) {
    if (!slot.tower) continue;
    const target = findTypedTargetInSector(state, slot);
    if (!target) continue;

    const config = TOWER_CONFIGS[slot.tower.type];
    slot.tower.charge++;
    if (slot.tower.charge >= config.charsToFire) {
      slot.tower.charge = 0;
      fireTower(state, slot, target);
    }
  }
}

function fireTower(
  state: GameState,
  slot: TowerSlot,
  target: { x: number; y: number }
): void {
  const { x: towerX, y: towerY } = getTowerPosition(slot);

  const config = TOWER_CONFIGS[slot.tower!.type];
  const dx = target.x - towerX;
  const dy = target.y - towerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  state.projectiles.push({
    id: state.nextId++,
    x: towerX,
    y: towerY,
    vx: (dx / dist) * config.projectileSpeed,
    vy: (dy / dist) * config.projectileSpeed,
    damage: config.damage,
  });

  state.onTowerFired.emit();
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
      destroyEntity(state, i, false);
      damaged = true;
    } else if (!isInBounds(e.x, e.y)) {
      destroyEntity(state, i, false);
    }
  }

  if (damaged) state.onPlanetDamaged.emit();
}

export function updateState(state: GameState, dt: number): void {
  for (const e of state.entities) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.rotation += e.rotationSpeed * dt;
  }
  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  checkCollisions(state);
  checkProjectileCollisions(state);
}

const PROJECTILE_HIT_RADIUS = 20;

function checkProjectileCollisions(state: GameState): void {
  const hitR2 = PROJECTILE_HIT_RADIUS * PROJECTILE_HIT_RADIUS;

  for (let pi = state.projectiles.length - 1; pi >= 0; pi--) {
    const p = state.projectiles[pi];

    if (!isInBounds(p.x, p.y)) {
      state.projectiles.splice(pi, 1);
      continue;
    }

    let hit = false;

    for (let ei = state.entities.length - 1; ei >= 0; ei--) {
      const e = state.entities[ei];
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      if (dx * dx + dy * dy < hitR2) {
        e.health -= p.damage;
        if (e.health <= 0) {
          destroyEntity(state, ei, true);
        }
        hit = true;
        break;
      }
    }

    if (hit) {
      state.projectiles.splice(pi, 1);
    }
  }
}

export function startNextWave(state: GameState): void {
  state.wave.wave++;
  state.wave.spawnQueue = generateWaveSpawns(state.wave.wave);
  state.wave.spawnIndex = 0;
  state.wave.waveTimer = 0;
  state.wave.phase = WavePhase.Spawning;
}
