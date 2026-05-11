import { describe, expect, it } from "vitest";
import { ENEMY_CATALOG } from "./enemyConfig";
import {
  createGameState,
  ENEMY_SPAWN_CENTER_EXCLUSION_HALF_HEIGHT,
  PLANET_Y,
  spawnEntity,
} from "./state";
import { Team } from "./types";

describe("enemy spawn positioning", () => {
  it("keeps enemy spawns out of the center typing lane", () => {
    const state = createGameState();
    for (let i = 0; i < 250; i++) {
      spawnEntity(state, ENEMY_CATALOG[0], Team.Enemy);
    }
    for (const enemy of state.entities) {
      expect(Math.abs(enemy.y - PLANET_Y)).toBeGreaterThanOrEqual(
        ENEMY_SPAWN_CENTER_EXCLUSION_HALF_HEIGHT,
      );
    }
  });
});
