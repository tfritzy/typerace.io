import { describe, expect, it } from "vitest";
import { createEnemyConfigForWave } from "./enemyConfig";
import { createGameState, updateSpawner } from "./state";

describe("boss scaling", () => {
  it("uses current wave for boss tier health scaling", () => {
    const state = createGameState();
    state.paused = false;
    const wave = 100;
    state.spawner.elapsed = 3;
    state.spawner.currentWave = wave;
    state.spawner.waveShipTypeIndex = 22;
    state.spawner.enemiesInWave = state.spawner.enemiesSpawnedInWave;

    updateSpawner(state, 0);

    const boss = state.entities.find((entity) => entity.isBoss);
    expect(boss).toBeTruthy();

    const expectedHealth = createEnemyConfigForWave(wave, 22).health * 8;
    expect(boss?.health).toBe(expectedHealth);
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
