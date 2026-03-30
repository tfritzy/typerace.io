import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  type EntityType, ColorPreset,
  COLOR_PRESET_COUNT, SHIP_ENTITY_TYPES,
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
  entityType: EntityType;
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
  bleedStacks: number;
  bleedTimer: number;
  plasmaStacks: number;
  slowStacks: number;
  freezeStacks: number;
  colorPreset?: ColorPreset;
  hasShield?: boolean;
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
  bleedApplicationChance: number;
  plasmaStacks: number;
  slowStacks: number;
  freezeStacks: number;
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

export interface GameState {
  entities: EntityState[];
  towerSlots: TowerSlot[];
  projectiles: ProjectileState[];
  time: {
    time: number;
    deltaTime: number;
  };
  nextId: number;
  enemiesKilled: number;
  planetHealth: number;
  maxPlanetHealth: number;
  wave: WaveState;
  onPlanetDamaged: GameEvent;
  onTowerFired: GameEvent;
  onWaveComplete: GameEvent;
  onDamageDealt: GameDataEvent<DamageData>;
}

function createTowerSlots(): TowerSlot[] {
  const slots: TowerSlot[] = [];
  for (let i = 0; i < TOWER_SLOT_COUNT; i++) {
    const angle = (i * 2 * Math.PI) / TOWER_SLOT_COUNT - Math.PI / 2;
    let tower: TowerState | null = null;
    if (i % 2 === 0) {
      tower = { type: TowerType.Gun, level: 1, charge: 0 };
    } else if (i === 1) {
      tower = { type: TowerType.Plasma, level: 1, charge: 0 };
    } else if (i === 3) {
      tower = { type: TowerType.Slow, level: 1, charge: 0 };
    }
    slots.push({ angle, tower });
  }
  return slots;
}

export function createGameState(): GameState {
  return {
    entities: [],
    towerSlots: createTowerSlots(),
    projectiles: [],
    time: {
      time: 0,
      deltaTime: 0,
    },
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
    onDamageDealt: new GameDataEvent<DamageData>(),
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
  const isShip = SHIP_ENTITY_TYPES.includes(config.entityType);

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx,
    vy,
    rotation: 0,
    rotationSpeed: isShip ? 0 : (0.5 + Math.random() * 1.5) * rotDir,
    word,
    typedCount: 0,
    health: config.health,
    power: config.power,
    bleedStacks: 0,
    bleedTimer: 0,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 0,
  };

  if (isShip) {
    entity.colorPreset = randInt(COLOR_PRESET_COUNT);
    entity.hasShield = Math.random() > 0.5;
  } else {
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
    bleedApplicationChance: config.bleedApplicationChance,
    plasmaStacks: config.plasmaStacks,
    slowStacks: config.slowStacks,
    freezeStacks: config.freezeStacks,
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
  state.time.deltaTime = dt;
  const timeBefore = state.time.time;
  state.time.time += state.time.deltaTime;

  for (const e of state.entities) {
    let speedMult = 1;
    if (e.freezeStacks > 0) {
      speedMult = 0;
    } else if (e.slowStacks > 0) {
      speedMult = 0.5;
    }
    e.x += e.vx * state.time.deltaTime * speedMult;
    e.y += e.vy * state.time.deltaTime * speedMult;
    e.rotation += e.rotationSpeed * state.time.deltaTime;
  }
  applyBleedDamage(state, timeBefore, state.time.time);
  applyPlasmaDamage(state, timeBefore, state.time.time);
  applySlowDecay(state, timeBefore, state.time.time);
  applyFreezeDecay(state, timeBefore, state.time.time);
  for (const p of state.projectiles) {
    p.x += p.vx * state.time.deltaTime;
    p.y += p.vy * state.time.deltaTime;
  }

  checkCollisions(state);
  checkProjectileCollisions(state);
  resolveEntityDeaths(state);
}

const PROJECTILE_HIT_RADIUS = 20;
const BLEED_DURATION_SECONDS = 3;

const TICK_RATE = 2;

function applyBleedDamage(
  state: GameState,
  timeBefore: number,
  timeAfter: number
): void {
  const previousTick = Math.floor(timeBefore * TICK_RATE);

  for (const entity of state.entities) {
    if (entity.bleedStacks <= 0) continue;

    const cappedTimeAfter = Math.min(timeAfter, entity.bleedTimer);
    const bleedTicks = Math.max(
      0,
      Math.floor(cappedTimeAfter * TICK_RATE) - previousTick
    );
    if (bleedTicks > 0) {
      entity.health -= bleedTicks * entity.bleedStacks;
    }
    if (entity.bleedTimer <= timeAfter) {
      entity.bleedStacks = 0;
    }
  }
}

function applyPlasmaDamage(
  state: GameState,
  timeBefore: number,
  timeAfter: number
): void {
  const previousTick = Math.floor(timeBefore * TICK_RATE);
  const ticks = Math.max(0, Math.floor(timeAfter * TICK_RATE) - previousTick);
  if (ticks <= 0) return;

  for (const entity of state.entities) {
    if (entity.plasmaStacks <= 0) continue;

    const actualTicks = Math.min(ticks, entity.plasmaStacks);
    entity.health -= actualTicks;
    entity.plasmaStacks -= actualTicks;
  }
}

function applySlowDecay(
  state: GameState,
  timeBefore: number,
  timeAfter: number
): void {
  const previousTick = Math.floor(timeBefore * TICK_RATE);
  const ticks = Math.max(0, Math.floor(timeAfter * TICK_RATE) - previousTick);
  if (ticks <= 0) return;

  for (const entity of state.entities) {
    if (entity.slowStacks <= 0) continue;

    entity.slowStacks = Math.max(0, entity.slowStacks - ticks);
  }
}

function applyFreezeDecay(
  state: GameState,
  timeBefore: number,
  timeAfter: number
): void {
  const previousTick = Math.floor(timeBefore * TICK_RATE);
  const ticks = Math.max(0, Math.floor(timeAfter * TICK_RATE) - previousTick);
  if (ticks <= 0) return;

  for (const entity of state.entities) {
    if (entity.freezeStacks <= 0) continue;

    entity.freezeStacks = Math.max(0, entity.freezeStacks - ticks);
  }
}

function resolveEntityDeaths(state: GameState): void {
  for (let i = state.entities.length - 1; i >= 0; i--) {
    if (state.entities[i].health <= 0) {
      destroyEntity(state, i, true);
    }
  }
}

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
      if (e.health <= 0) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      if (dx * dx + dy * dy < hitR2) {
        e.health -= p.damage;
        if (
          p.bleedApplicationChance > 0 &&
          Math.random() < p.bleedApplicationChance
        ) {
          e.bleedStacks++;
          e.bleedTimer = state.time.time + BLEED_DURATION_SECONDS;
        }
        if (p.plasmaStacks > 0) {
          e.plasmaStacks += p.plasmaStacks;
        }
        if (p.slowStacks > 0) {
          e.slowStacks += p.slowStacks;
        }
        if (p.freezeStacks > 0) {
          e.freezeStacks += p.freezeStacks;
        }
        const killed = e.health <= 0;
        state.onDamageDealt.emit({ amount: p.damage, x: e.x, y: e.y, killed });
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
