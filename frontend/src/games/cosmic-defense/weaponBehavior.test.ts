import { describe, expect, it } from "vitest";
import {
  createGameState,
  spawnAlliedEntity,
  spawnEntity,
  unpauseGame,
  updateState,
  onCorrectKeystroke,
  PLANET_X,
  PLANET_Y,
  type EntityState,
  type GameState,
} from "./state";
import { ColorPreset, FireMode, Team } from "./types";
import { ENEMY_CATALOG, FRIENDLY_CATALOG } from "./enemyConfig";

function makeEnemy(state: GameState, overrides: Partial<EntityState> = {}): EntityState {
  const expectedId = state.nextId;
  spawnEntity(state, ENEMY_CATALOG[0], Team.Enemy);
  const entity = state.entityById.get(expectedId)!;
  entity.x = PLANET_X + 100;
  entity.y = PLANET_Y;
  entity.vx = 0;
  entity.vy = 0;
  entity.range = 700;
  Object.assign(entity, overrides);
  if ("health" in overrides && !("maxHealth" in overrides)) {
    entity.maxHealth = entity.health;
  }
  return entity;
}

function makeAlly(state: GameState, overrides: Partial<EntityState> = {}): EntityState {
  const id = spawnAlliedEntity(state, FRIENDLY_CATALOG[0], ColorPreset.Preset1, PLANET_X, PLANET_Y, 1);
  const entity = state.entityById.get(id)!;
  Object.assign(entity, overrides);
  return entity;
}

describe("projectile bounce behavior", () => {
  it("waits for projectile impact before chaining", () => {
    const state = createGameState();
    const firstEnemy = makeEnemy(state, { health: 20, x: PLANET_X + 220, y: PLANET_Y });
    const secondEnemy = makeEnemy(state, { health: 20, x: PLANET_X + 300, y: PLANET_Y });
    makeAlly(state, { projectileDamage: 10, chargesRequired: 1, chainCount: 1 });

    onCorrectKeystroke(state);
    unpauseGame(state);
    updateState(state, 0.05);

    expect(firstEnemy.health).toBe(20);
    expect(secondEnemy.health).toBe(20);
    expect(state.projectiles).toHaveLength(1);

    updateState(state, 0.1);

    expect(firstEnemy.health).toBe(10);
    expect(secondEnemy.health).toBe(10);
  });
});

describe("laser timing behavior", () => {
  it("still resolves zero-delay lasers immediately", () => {
    const state = createGameState();
    const firstEnemy = makeEnemy(state, { health: 20, x: PLANET_X + 100, y: PLANET_Y });
    makeAlly(state, { projectileDamage: 0, laserDamage: 10, fireMode: FireMode.Laser, chargesRequired: 1, role: "laser" });

    onCorrectKeystroke(state);

    expect(firstEnemy.health).toBe(10);
  });
});
