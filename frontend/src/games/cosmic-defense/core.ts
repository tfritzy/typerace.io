import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { generateSlots, type PlacementSlot } from "./PlacementPoints";
import { SHIP_BLUEPRINT_MAP, SHIP_BLUEPRINTS } from "./shipBlueprints";
import { type EntityType, type Team } from "./types";
import {
  createGameState,
  levelUpEntity,
  onCorrectKeystroke as onCorrectKeystrokeForState,
  setSpawnerPaused,
  spawnAlliedEntity,
  type EntityState,
  type GameState,
  type TargetingMode,
  updateSpawner,
  updateState,
} from "./state";

const DAMAGE_ROLES = new Set([
  "sniper", "laser", "dual_shot", "pierce_laser", "freeze",
  "plasma", "shooter", "ice_beam", "plasma_single", "chain", "mac_cannon",
]);

export interface CosmicDefenseCoreOptions {
  slots?: PlacementSlot[];
}

export interface ShipChoice {
  entityType: EntityType;
  isUpgrade: boolean;
  currentLevel: number;
  nextLevel: number;
}

export function generateShipChoices(
  slots: PlacementSlot[]
): EntityType[] {
  const existing = new Map(
    slots
      .filter((slot) => slot.occupant)
      .map((slot) => [slot.occupant!, slot])
  );
  const hasEmptySlot = slots.some((slot) => !slot.occupant);

  let pool: EntityType[];
  if (hasEmptySlot) {
    const hasAnyShip = existing.size > 0;
    const basePool = hasAnyShip
      ? SHIP_BLUEPRINTS
      : SHIP_BLUEPRINTS.filter((bp) => DAMAGE_ROLES.has(bp.role));
    pool = basePool.map((bp) => bp.entityType);
  } else {
    pool = [...existing.values()]
      .map((slot) => slot.occupant!)
      .filter((entityType) => entityType !== null);
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(3, shuffled.length));
}

function cloneSlots(slots: PlacementSlot[]): PlacementSlot[] {
  return slots.map((slot) => ({ ...slot }));
}

function addShip(state: GameState, entityType: EntityType, x: number, y: number, level: number): number {
  const config = FRIENDLY_CONFIG_MAP.get(entityType);
  const blueprint = SHIP_BLUEPRINT_MAP.get(entityType);
  if (!config || !blueprint) return -1;
  return spawnAlliedEntity(state, config, blueprint.colorPreset, x, y, level);
}

export class CosmicDefenseCore {
  readonly state: GameState;
  private slots: PlacementSlot[];
  private choices: EntityType[] = [];

  constructor(options: CosmicDefenseCoreOptions = {}) {
    this.state = createGameState();
    this.slots = cloneSlots(options.slots ?? generateSlots());
    this.refreshChoices();
  }

  update(dt: number): void {
    const wasPendingChoice = this.state.pendingChoice;
    updateState(this.state, dt);
    updateSpawner(this.state, dt);
    if (!wasPendingChoice && this.state.pendingChoice) {
      this.refreshChoices();
    }
  }

  onCorrectKeystroke(): void {
    onCorrectKeystrokeForState(this.state);
  }

  setPaused(paused: boolean): void {
    setSpawnerPaused(this.state, paused);
  }

  getSlots(): PlacementSlot[] {
    return cloneSlots(this.slots);
  }

  getChoices(): EntityType[] {
    return [...this.choices];
  }

  getChoiceDetails(): ShipChoice[] {
    const slotsByType = new Map(
      this.slots
        .filter((slot) => slot.occupant)
        .map((slot) => [slot.occupant!, slot])
    );
    return this.choices.map((entityType) => {
      const slot = slotsByType.get(entityType);
      const currentLevel = slot?.level ?? 0;
      return {
        entityType,
        isUpgrade: !!slot,
        currentLevel,
        nextLevel: currentLevel + 1,
      };
    });
  }

  getEntityForSlot(slotIndex: number): EntityState | null {
    const slot = this.slots.find((entry) => entry.index === slotIndex);
    if (!slot?.entityId) return null;
    return this.state.entityById.get(slot.entityId) ?? null;
  }

  setTargetingMode(slotIndex: number, mode: TargetingMode): void {
    const entity = this.getEntityForSlot(slotIndex);
    if (entity) entity.targetingMode = mode;
  }

  selectChoice(entityType: EntityType): boolean {
    if (!this.state.pendingChoice || !this.choices.includes(entityType)) return false;

    const existingSlot = this.slots.find((slot) => slot.occupant === entityType);
    if (existingSlot && existingSlot.entityId !== null) {
      const nextLevel = existingSlot.level + 1;
      const config = FRIENDLY_CONFIG_MAP.get(entityType);
      if (!config) return false;
      levelUpEntity(this.state, existingSlot.entityId, config, nextLevel);
      existingSlot.level = nextLevel;
    } else {
      const emptySlot = this.slots.find((slot) => !slot.occupant);
      if (!emptySlot) return false;
      const entityId = addShip(this.state, entityType, emptySlot.x, emptySlot.y, 1);
      if (entityId < 0) return false;
      emptySlot.occupant = entityType;
      emptySlot.entityId = entityId;
      emptySlot.level = 1;
    }

    this.state.pendingChoice = false;
    this.state.spawner.paused = false;
    this.refreshChoices();
    return true;
  }

  getEntitiesForTeam(team: Team): EntityState[] {
    return this.state.entities.filter((entity) => entity.team === team);
  }

  private refreshChoices(): void {
    if (!this.state.pendingChoice) {
      this.choices = [];
      return;
    }
    this.choices = generateShipChoices(this.slots);
    if (this.choices.length === 0) {
      this.state.pendingChoice = false;
      this.state.spawner.paused = false;
    }
  }
}
