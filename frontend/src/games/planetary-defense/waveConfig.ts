import { ENEMY_CATALOG, type EnemyConfig } from "./enemyConfig";

export const WAVE_SPAWN_DURATION = 15;
const MIN_ENEMY_POWER = 10;

export function calculateWavePower(wave: number): number {
  return Math.round(80 * Math.pow(wave, 1.5));
}

export interface SpawnEntry {
  config: EnemyConfig;
  spawnTime: number;
}

export function generateWaveSpawns(wave: number): SpawnEntry[] {
  const totalPower = calculateWavePower(wave);
  const maxSinglePower = Math.max(MIN_ENEMY_POWER, Math.floor(totalPower * 0.4));

  const eligible = ENEMY_CATALOG.filter((e) => e.power <= maxSinglePower);
  if (eligible.length === 0) return [];

  const enemies: EnemyConfig[] = [];
  let remaining = totalPower;

  while (remaining > 0) {
    const affordable = eligible.filter((e) => e.power <= remaining);
    if (affordable.length === 0) break;

    const pick = affordable[Math.floor(Math.random() * affordable.length)];
    enemies.push(pick);
    remaining -= pick.power;
  }

  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }

  const interval =
    enemies.length > 1 ? WAVE_SPAWN_DURATION / (enemies.length - 1) : 0;

  return enemies.map((config, i) => ({
    config,
    spawnTime: i * interval,
  }));
}
