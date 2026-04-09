import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  type EntityType, ColorPreset,
  isShipEntityType,
} from "./types";
import { randInt } from "./utils";
import { getLanguageFromSlug } from "../../utils/modes";
import { getRandomWord } from "../../utils/wordLists";
import {
  RelicType,
  RELIC_CONFIGS,
  RELIC_SLOT_COUNT,
  RELIC_ORBIT_RADIUS,
  type RelicTypeConfig,
} from "./relicConfig";
import { type EnemyConfig } from "./enemyConfig";
import { generateWaveSpawns, type SpawnEntry } from "./waveConfig";
import {
  type Item, GemType,
  TOPAZ_TIERS, RUBY_TIERS, EMERALD_TIERS, SAPPHIRE_TIERS, AMETHYST_TIERS, DIAMOND_TIERS,
} from "./itemConfig";

const DROP_SPEED = 20;
const DROP_CHANCE = 0.5;

export const PLANET_X = CANVAS_WIDTH / 2;
export const PLANET_Y = CANVAS_HEIGHT / 2;
const PLANET_HIT_RADIUS = 100;

export function getRelicPosition(slot: RelicSlot): { x: number; y: number } {
  return {
    x: PLANET_X + Math.cos(slot.angle) * RELIC_ORBIT_RADIUS,
    y: PLANET_Y + Math.sin(slot.angle) * RELIC_ORBIT_RADIUS,
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

export interface RelicState {
  type: RelicType;
  item: Item;
  level: number;
  charge: number;
  remainingShots: number;
  nextShotTime: number;
}

export interface RelicSlot {
  angle: number;
  relic: RelicState | null;
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
  chainCount: number;
  explosionRange: number;
}

export interface DropState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  word: string;
  typedCount: number;
  item: Item;
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

export interface MerchantShipState {
  id: number;
  x: number;
  y: number;
  entityType: EntityType;
  items: Item[];
}

export interface GameState {
  entities: EntityState[];
  relicSlots: RelicSlot[];
  projectiles: ProjectileState[];
  drops: DropState[];
  merchants: MerchantShipState[];
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
  onRelicFired: GameEvent;
  onWaveComplete: GameEvent;
  onDamageDealt: GameDataEvent<DamageData>;
}

function createRelicSlots(): RelicSlot[] {
  const slots: RelicSlot[] = [];
  const startingRelics: (RelicType | null)[] = [
    RelicType.SteelBattleaxe,
    RelicType.EmbercrestBlade,
    RelicType.RavenplumeEdge,
    RelicType.GildedPlumeblade,
    RelicType.CloudveilLongsword,
    null,
    RelicType.DarkwoodHatchet,
    null,
  ];
  for (let i = 0; i < RELIC_SLOT_COUNT; i++) {
    const angle = (i * 2 * Math.PI) / RELIC_SLOT_COUNT - Math.PI / 2;
    let relic: RelicState | null = null;
    const relicType = startingRelics[i] ?? null;
    if (relicType !== null) {
      relic = { type: relicType, item: { type: relicType, amount: 1 }, level: 1, charge: 0, remainingShots: 0, nextShotTime: 0 };
    }
    slots.push({ angle, relic });
  }
  return slots;
}

const MERCHANT_RELICS: RelicType[] = [
  RelicType.RubyguardGreatsword,
  RelicType.SunfireScimitar,
  RelicType.GlacialCrusader,
  RelicType.SporesparkGlaive,
  RelicType.AzureCrescent,
  RelicType.RosevineRapier,
  RelicType.CrystalbreakSaber,
  RelicType.CinderstoneBlade,
  RelicType.CrimsonCleaver,
  RelicType.TigerstripeFalchion,
  RelicType.DawnfireCutlass,
  RelicType.JadecrossBroadsword,
  RelicType.ChainlinkEstoc,
  RelicType.PermafrostGreatsword,
  RelicType.MistralSabre,
  RelicType.TidecallerBlade,
  RelicType.SolarisEdge,
  RelicType.InfernalRavager,
  RelicType.ObsidianReaver,
  RelicType.RubyflareGreataxe,
  RelicType.GildedWaraxe,
  RelicType.CopperheadCleaver,
  RelicType.BonecrestAxe,
  RelicType.DuskforgeHalberd,
  RelicType.RosegoldBroadaxe,
  RelicType.FrostbiteCleaver,
  RelicType.BloodmoonReaver,
  RelicType.TidebreakAxe,
];

function generateShopItems(count: number): Item[] {
  const pool = [...MERCHANT_RELICS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, count);
  return selected.map((relicType) => ({
    type: relicType,
    amount: 1,
    price: 10 + Math.floor(Math.random() * 40) * 5,
  }));
}

export function createEntityState(
  id: number,
  entityType: EntityType,
  x: number,
  y: number,
  overrides?: Partial<EntityState>
): EntityState {
  return {
    id,
    entityType,
    x,
    y,
    vx: 0,
    vy: 0,
    rotation: 0,
    rotationSpeed: 0,
    health: 1,
    power: 0,
    bleedStacks: 0,
    bleedTimer: 0,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 0,
    ...overrides,
  };
}

export function createGameState(): GameState {
  const state: GameState = {
    entities: [],
    relicSlots: createRelicSlots(),
    projectiles: [],
    drops: [],
    merchants: [],
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
    onRelicFired: new GameEvent(),
    onWaveComplete: new GameEvent(),
    onDamageDealt: new GameDataEvent<DamageData>(),
  };

  state.merchants.push({
    id: state.nextId++,
    x: CANVAS_WIDTH - 250,
    y: CANVAS_HEIGHT / 2,
    entityType: "Clipper",
    items: generateShopItems(6),
  });

  return state;
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
  const rotDir = Math.random() > 0.5 ? 1 : -1;
  const isShip = isShipEntityType(config.entityType);

  const entity: EntityState = {
    id: state.nextId++,
    entityType: config.entityType,
    x,
    y,
    vx,
    vy,
    rotation: 0,
    rotationSpeed: isShip ? 0 : (0.5 + Math.random() * 1.5) * rotDir,
    health: config.health,
    power: config.power,
    bleedStacks: 0,
    bleedTimer: 0,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 0,
  };

  if (isShip) {
    entity.colorPreset = ColorPreset.Preset4;
    entity.hasShield = Math.random() > 0.5;
  } else {
    entity.variant = randInt(16);
  }

  state.entities.push(entity);
}

function applyTypedCharacterToDrops(drops: DropState[], key: string): void {
  for (const drop of drops) {
    if (drop.typedCount >= drop.word.length) continue;
    const nextChar = drop.word[drop.typedCount];
    if (key === nextChar.toLowerCase()) {
      drop.typedCount++;
    } else if (drop.typedCount > 0) {
      drop.typedCount = 0;
    }
  }
}

function collectCompletedDrops(state: GameState): Item[] {
  const collected: Item[] = [];
  for (let i = state.drops.length - 1; i >= 0; i--) {
    const drop = state.drops[i];
    if (drop.typedCount >= drop.word.length) {
      collected.push(drop.item);
      state.drops.splice(i, 1);
    }
  }
  return collected;
}

function destroyEntity(
  state: GameState,
  index: number,
  killed: boolean
): void {
  const entity = state.entities[index];
  if (killed) {
    state.enemiesKilled++;
    spawnDrops(state, entity);
  }
  state.entities.splice(index, 1);
}

function calculateGoldDrop(power: number): number {
  return Math.ceil(power / 10);
}

function rollGemDrop(power: number): GemType | null {
  const gemChance = Math.min(0.5, 0.05 + power / 10000);
  if (Math.random() >= gemChance) return null;

  const families: GemType[][] = [TOPAZ_TIERS];
  if (power >= 50) families.push(SAPPHIRE_TIERS);
  if (power >= 100) families.push(RUBY_TIERS);
  if (power >= 250) families.push(AMETHYST_TIERS);
  if (power >= 500) families.push(EMERALD_TIERS);
  if (power >= 1000) families.push(DIAMOND_TIERS);
  const family = families[Math.floor(Math.random() * families.length)];

  let quality: number;
  if (power >= 10000) quality = 3;
  else if (power >= 1000) quality = 2;
  else if (power >= 50) quality = 1;
  else quality = 0;

  return family[quality];
}

function spawnDrops(state: GameState, entity: EntityState): void {
  if (Math.random() < DROP_CHANCE) return;

  const gemType = rollGemDrop(entity.power);
  if (gemType !== null) {
    spawnDrop(state, entity.x, entity.y, { type: gemType, amount: 1 });
  } else {
    const goldAmount = calculateGoldDrop(entity.power);
    spawnDrop(state, entity.x, entity.y, { type: "Gold", amount: goldAmount });
  }
}

function spawnDrop(
  state: GameState,
  x: number,
  y: number,
  item: Item
): void {
  const angle = Math.random() * Math.PI * 2;
  const speed = DROP_SPEED * (0.5 + Math.random() * 0.5);
  const usedWords = new Set(
    state.drops.map((d) => d.word)
  );
  const word = getRandomWord(getLangCode(), usedWords);

  state.drops.push({
    id: state.nextId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    word,
    typedCount: 0,
    item,
  });
}

export function handleTypedCharacter(state: GameState, key: string): Item[] {
  if (key.length !== 1) return [];
  const normalizedKey = key.toLowerCase();
  applyTypedCharacterToDrops(state.drops, normalizedKey);
  return collectCompletedDrops(state);
}

export function onCorrectKeystroke(state: GameState): void {
  chargeRelics(state);
}

function findNearestEnemy(
  state: GameState
): { x: number; y: number } | null {
  let closest: EntityState | null = null;
  let closestDist = Infinity;
  for (const entity of state.entities) {
    const dx = entity.x - PLANET_X;
    const dy = entity.y - PLANET_Y;
    const dist = dx * dx + dy * dy;
    if (dist < closestDist) {
      closestDist = dist;
      closest = entity;
    }
  }
  return closest;
}

function getNeighborSlots(
  state: GameState,
  slotIndex: number
): number[] {
  const count = state.relicSlots.length;
  return [
    (slotIndex - 1 + count) % count,
    (slotIndex + 1) % count,
  ];
}

function getDamageBuffMultiplier(state: GameState, slotIndex: number): number {
  const count = state.relicSlots.length;
  let multiplier = 1;
  for (let j = 0; j < count; j++) {
    const slot = state.relicSlots[j];
    if (!slot.relic) continue;
    const config: RelicTypeConfig = RELIC_CONFIGS[slot.relic.type];
    if (config.damageBuffMultiplier === 0) continue;
    if (config.damageBuffAll && j !== slotIndex) {
      multiplier += config.damageBuffMultiplier;
      continue;
    }
    for (const offset of config.damageBuffIndexes) {
      const buffedSlot = ((j + offset) % count + count) % count;
      if (buffedSlot === slotIndex) {
        multiplier += config.damageBuffMultiplier;
        break;
      }
    }
  }
  return multiplier;
}

function tryFireSlot(
  state: GameState,
  slot: RelicSlot,
  slotIndex: number
): void {
  const config = RELIC_CONFIGS[slot.relic!.type];
  if (slot.relic!.charge < config.charsToFire) return;

  slot.relic!.charge = 0;
  const target = findNearestEnemy(state);
  if (target) {
    fireRelic(state, slot, slotIndex, target);
  }
  if (config.chargesNeighbors) {
    chargeNeighbors(state, slotIndex);
  }
}

function chargeRelics(state: GameState): void {
  if (state.entities.length === 0) return;
  for (let i = 0; i < state.relicSlots.length; i++) {
    const slot = state.relicSlots[i];
    if (!slot.relic) continue;

    slot.relic.charge++;
    tryFireSlot(state, slot, i);
  }
}

function chargeNeighbors(state: GameState, slotIndex: number): void {
  for (const ni of getNeighborSlots(state, slotIndex)) {
    const neighbor = state.relicSlots[ni];
    if (!neighbor.relic) continue;

    neighbor.relic.charge++;
    tryFireSlot(state, neighbor, ni);
  }
}

function spawnProjectile(
  state: GameState,
  slot: RelicSlot,
  slotIndex: number,
  target: { x: number; y: number }
): boolean {
  const { x: relicX, y: relicY } = getRelicPosition(slot);
  const config = RELIC_CONFIGS[slot.relic!.type];
  const dx = target.x - relicX;
  const dy = target.y - relicY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return false;

  const buffMultiplier = getDamageBuffMultiplier(state, slotIndex);

  state.projectiles.push({
    id: state.nextId++,
    x: relicX,
    y: relicY,
    vx: (dx / dist) * config.projectileSpeed,
    vy: (dy / dist) * config.projectileSpeed,
    damage: Math.round(config.damage * buffMultiplier),
    bleedApplicationChance: config.bleedApplicationChance,
    plasmaStacks: config.plasmaStacks,
    slowStacks: config.slowStacks,
    freezeStacks: config.freezeStacks,
    chainCount: config.chainCount,
    explosionRange: config.explosionRange,
  });

  state.onRelicFired.emit();
  return true;
}

function fireRelic(
  state: GameState,
  slot: RelicSlot,
  slotIndex: number,
  target: { x: number; y: number }
): void {
  if (!spawnProjectile(state, slot, slotIndex, target)) return;

  const config = RELIC_CONFIGS[slot.relic!.type];
  if (config.multiShotCount > 1) {
    slot.relic!.remainingShots = config.multiShotCount - 1;
    slot.relic!.nextShotTime = state.time.time + MULTI_SHOT_DELAY;
  }
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

function processPendingShots(state: GameState): void {
  for (let i = 0; i < state.relicSlots.length; i++) {
    const slot = state.relicSlots[i];
    if (!slot.relic || slot.relic.remainingShots <= 0) continue;
    if (state.time.time < slot.relic.nextShotTime) continue;

    slot.relic.remainingShots--;
    if (slot.relic.remainingShots > 0) {
      slot.relic.nextShotTime = state.time.time + MULTI_SHOT_DELAY;
    }

    const target = findNearestEnemy(state);
    if (!target) continue;

    spawnProjectile(state, slot, i, target);
  }
}

export function updateState(state: GameState, dt: number): void {
  state.time.deltaTime = dt;
  const timeBefore = state.time.time;
  state.time.time += state.time.deltaTime;

  processPendingShots(state);

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

  for (const d of state.drops) {
    d.x += d.vx * state.time.deltaTime;
    d.y += d.vy * state.time.deltaTime;
  }

  for (let i = state.drops.length - 1; i >= 0; i--) {
    if (!isInBounds(state.drops[i].x, state.drops[i].y)) {
      state.drops.splice(i, 1);
    }
  }

  checkCollisions(state);
  checkProjectileCollisions(state);
  resolveEntityDeaths(state);
}

const PROJECTILE_HIT_RADIUS = 20;
const BLEED_DURATION_SECONDS = 3;
export const CHAIN_JUMP_RANGE = 150;
const MULTI_SHOT_DELAY = 0.1;

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

function applyProjectileEffects(
  state: GameState,
  p: ProjectileState,
  e: EntityState
): void {
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
}

function findChainTarget(
  entities: EntityState[],
  fromX: number,
  fromY: number,
  hitIds: Set<number>
): EntityState | null {
  const rangeR2 = CHAIN_JUMP_RANGE * CHAIN_JUMP_RANGE;
  let closest: EntityState | null = null;
  let closestDist = Infinity;
  for (const e of entities) {
    if (e.health <= 0) continue;
    if (hitIds.has(e.id)) continue;
    const dx = fromX - e.x;
    const dy = fromY - e.y;
    const dist2 = dx * dx + dy * dy;
    if (dist2 < rangeR2 && dist2 < closestDist) {
      closestDist = dist2;
      closest = e;
    }
  }
  return closest;
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
        applyProjectileEffects(state, p, e);
        hit = true;

        if (p.explosionRange > 0) {
          const explosionR2 = p.explosionRange * p.explosionRange;
          for (const other of state.entities) {
            if (other === e || other.health <= 0) continue;
            const edx = e.x - other.x;
            const edy = e.y - other.y;
            if (edx * edx + edy * edy < explosionR2) {
              applyProjectileEffects(state, p, other);
            }
          }
        }

        if (p.chainCount > 0) {
          const hitIds = new Set<number>([e.id]);
          let prevX = e.x;
          let prevY = e.y;
          for (let c = 0; c < p.chainCount; c++) {
            const next = findChainTarget(state.entities, prevX, prevY, hitIds);
            if (!next) break;
            applyProjectileEffects(state, p, next);
            hitIds.add(next.id);
            prevX = next.x;
            prevY = next.y;
          }
        }

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
