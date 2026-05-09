import { describe, expect, it } from "vitest";
import { createEnemyConfigForVirtualTier, createEnemyConfigForWave } from "./enemyConfig";
import { createGameState, updateSpawner } from "./state";

describe("boss scaling", () => {
  it("keeps boss health as a flat multiplier of the completed wave profile", () => {
    const state = createGameState();
    state.paused = false;
    state.spawner.elapsed = 3600;
    state.spawner.currentWave = 100;
    state.spawner.waveShipTypeIndex = 22;
    state.spawner.enemiesInWave = state.spawner.enemiesSpawnedInWave;

    updateSpawner(state, 0);

    const boss = state.entities.find((entity) => entity.isBoss);
    expect(boss).toBeTruthy();

    const expectedTier = 39;
    const expectedHealth = createEnemyConfigForWave(expectedTier, 22).health * 8;
    expect(boss?.health).toBe(expectedHealth);
  });

  it("shows why raw wave count for boss tier creates runaway health", () => {
    const waveShipTypeIndex = 22;
    const representativeTier = 39;
    const waveCount = 100;

    const waveScaledBossHealth = createEnemyConfigForWave(representativeTier, waveShipTypeIndex).health * 8;
    const rawWaveCountBossHealth = createEnemyConfigForVirtualTier(waveCount).health * 8;

    expect(rawWaveCountBossHealth).toBeGreaterThan(waveScaledBossHealth * 1_000_000);
  });
});
