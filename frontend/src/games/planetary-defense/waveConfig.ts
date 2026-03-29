import { ShipType, MeteorType } from "./types";
import { SHIP_HEALTH, METEOR_HEALTH } from "./enemyConfig";

export const WAVE_SPAWN_DURATION = 15;
const MIN_ENEMY_POWER = 10;

interface EnemyEntry {
  kind: "ship" | "meteor";
  shipType?: ShipType;
  meteorType?: MeteorType;
  health: number;
}

const ENEMY_CATALOG: EnemyEntry[] = [
  ...Object.entries(METEOR_HEALTH).map(([type, health]) => ({
    kind: "meteor" as const,
    meteorType: Number(type) as MeteorType,
    health,
  })),
  ...Object.entries(SHIP_HEALTH).map(([type, health]) => ({
    kind: "ship" as const,
    shipType: Number(type) as ShipType,
    health,
  })),
].sort((a, b) => a.health - b.health);

export function calculateWavePower(wave: number): number {
  return Math.round(30 * Math.pow(wave, 1.5));
}

export interface SpawnEntry {
  kind: "ship" | "meteor";
  shipType?: ShipType;
  meteorType?: MeteorType;
  spawnTime: number;
}

export function generateWaveSpawns(wave: number): SpawnEntry[] {
  const totalPower = calculateWavePower(wave);
  const maxSinglePower = Math.max(MIN_ENEMY_POWER, Math.floor(totalPower * 0.4));

  const eligible = ENEMY_CATALOG.filter((e) => e.health <= maxSinglePower);
  if (eligible.length === 0) return [];

  const enemies: Omit<SpawnEntry, "spawnTime">[] = [];
  let remaining = totalPower;

  while (remaining > 0) {
    const affordable = eligible.filter((e) => e.health <= remaining);
    if (affordable.length === 0) break;

    const pick = affordable[Math.floor(Math.random() * affordable.length)];
    enemies.push({
      kind: pick.kind,
      shipType: pick.shipType,
      meteorType: pick.meteorType,
    });
    remaining -= pick.health;
  }

  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }

  const interval =
    enemies.length > 1 ? WAVE_SPAWN_DURATION / (enemies.length - 1) : 0;

  return enemies.map((e, i) => ({
    ...e,
    spawnTime: i * interval,
  }));
}
