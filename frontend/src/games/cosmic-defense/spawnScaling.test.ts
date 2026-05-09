import { describe, expect, it } from "vitest";
import { createEnemyConfigForWave } from "./enemyConfig";
import { createGameState, updateSpawner } from "./state";
import { Team } from "./types";

describe("boss scaling", () => {
  it("keeps bosses in the same order of magnitude as the wave they spawn from", () => {
    const wave = 42;
    const shipType = 10;
    const state = createGameState();
    state.paused = false;
    state.spawner.elapsed = 1;
    state.spawner.currentWave = wave;
    state.spawner.waveShipTypeIndex = shipType;
    state.spawner.enemiesInWave = 1;
    state.spawner.enemiesSpawnedInWave = 0;
    state.spawner.spawnAccumulator = 1;

    updateSpawner(state, 0);

    const waveEnemy = state.entities.find((entity) => entity.team === Team.Enemy && !entity.isBoss);
    expect(waveEnemy).toBeTruthy();
    expect(waveEnemy?.health).toBe(createEnemyConfigForWave(wave, shipType).health);

    state.spawner.enemiesInWave = state.spawner.enemiesSpawnedInWave;
    updateSpawner(state, 0);

    const boss = state.entities.find((entity) => entity.isBoss);
    expect(boss).toBeTruthy();
    expect(waveEnemy?.health).toBeGreaterThan(0);
    expect(boss?.health).toBeGreaterThan(0);
    const waveEnemyHealth = waveEnemy?.health ?? 0;
    const bossHealth = boss?.health ?? 0;
    expect(bossHealth).toBe(waveEnemyHealth * 8);
  });

  it("keeps boss health independent from elapsed time for the same wave", () => {
    const wave = 120;
    const shipType = 22;

    const earlyState = createGameState();
    earlyState.paused = false;
    earlyState.spawner.elapsed = 1;
    earlyState.spawner.currentWave = wave;
    earlyState.spawner.waveShipTypeIndex = shipType;
    earlyState.spawner.enemiesInWave = earlyState.spawner.enemiesSpawnedInWave;

    const lateState = createGameState();
    lateState.paused = false;
    lateState.spawner.elapsed = 10_000;
    lateState.spawner.currentWave = wave;
    lateState.spawner.waveShipTypeIndex = shipType;
    lateState.spawner.enemiesInWave = lateState.spawner.enemiesSpawnedInWave;

    updateSpawner(earlyState, 0);
    updateSpawner(lateState, 0);

    const earlyBoss = earlyState.entities.find((entity) => entity.isBoss);
    const lateBoss = lateState.entities.find((entity) => entity.isBoss);

    const expectedHealth = createEnemyConfigForWave(wave, shipType).health * 8;
    expect(earlyBoss?.health).toBe(expectedHealth);
    expect(lateBoss?.health).toBe(expectedHealth);
  });
});
