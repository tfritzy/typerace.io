import { describe, expect, it } from "vitest";
import { createBossConfigForWave, createEnemyConfigForWave, ENEMY_SHIP_TYPES } from "./enemyConfig";
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
    for (let shipTypeIndex = 0; shipTypeIndex < ENEMY_SHIP_TYPES.length; shipTypeIndex++) {
      const enemyConfig = createEnemyConfigForWave(0, shipTypeIndex);
      const bossConfig = createBossConfigForWave(0, shipTypeIndex);
      for (let i = 0; i < 12; i++) {
        spawnEntity(state, enemyConfig, Team.Enemy);
        spawnEntity(state, bossConfig, Team.Enemy);
      }
    }
    for (const enemy of state.entities) {
      expect(Math.abs(enemy.y - PLANET_Y)).toBeGreaterThanOrEqual(
        ENEMY_SPAWN_CENTER_EXCLUSION_HALF_HEIGHT + enemy.hitHalfH,
      );
    }
  });
});
