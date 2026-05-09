import { describe, expect, it } from "vitest";
import { createEnemyConfigForVirtualTier, createEnemyConfigForWave } from "./enemyConfig";
import { createGameState, updateSpawner } from "./state";

const TIER_SPREAD_SECONDS = 90;
const TIER_OFFSET_SECONDS = 30;
const TIER_WEIGHT_WINDOW = 8;

function getRepresentativeTierForElapsed(elapsed: number): number {
  const centerTier = Math.max(0, Math.floor((elapsed - TIER_OFFSET_SECONDS) / TIER_SPREAD_SECONDS));
  const startTier = Math.max(0, centerTier - TIER_WEIGHT_WINDOW);
  return startTier + TIER_WEIGHT_WINDOW;
}

describe("boss scaling", () => {
  it("keeps boss health as a flat multiplier of the completed wave profile", () => {
    const state = createGameState();
    state.paused = false;
    const elapsed = 3600;
    state.spawner.elapsed = elapsed;
    state.spawner.currentWave = 100;
    state.spawner.waveShipTypeIndex = 22;
    state.spawner.enemiesInWave = state.spawner.enemiesSpawnedInWave;

    updateSpawner(state, 0);

    const boss = state.entities.find((entity) => entity.isBoss);
    expect(boss).toBeTruthy();

    const expectedTier = getRepresentativeTierForElapsed(elapsed);
    const expectedHealth = createEnemyConfigForWave(expectedTier, 22).health * 8;
    expect(boss?.health).toBe(expectedHealth);
  });

  it("shows why raw wave count for boss tier creates runaway health", () => {
    const waveShipTypeIndex = 22;
    const representativeTier = getRepresentativeTierForElapsed(3600);
    const waveCount = 100;

    const waveScaledBossHealth = createEnemyConfigForWave(representativeTier, waveShipTypeIndex).health * 8;
    const rawWaveCountBossHealth = createEnemyConfigForVirtualTier(waveCount).health * 8;

    expect(rawWaveCountBossHealth).toBeGreaterThan(waveScaledBossHealth * 1_000_000);
  });
});
