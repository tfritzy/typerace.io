import { CosmicDefenseCore } from "../src/games/cosmic-defense/core.ts";
import { SHIP_BLUEPRINTS } from "../src/games/cosmic-defense/shipBlueprints.ts";
import type { EntityType } from "../src/games/cosmic-defense/types.ts";

interface SimulationOptions {
  runs: number;
  dt: number;
  wpm: number;
}

interface ShipStats {
  selectedRuns: number;
  totalFinalLevel: number;
  maxFinalLevel: number;
}

const DEFAULT_OPTIONS: SimulationOptions = {
  runs: 100,
  dt: 0.1,
  wpm: 96,
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseArgs(args: string[]): SimulationOptions {
  const options = { ...DEFAULT_OPTIONS };
  for (const arg of args) {
    const [rawKey, rawValue] = arg.split("=", 2);
    const key = rawKey.replace(/^--/, "");
    if (key === "runs") options.runs = Math.max(1, Math.floor(parseNumber(rawValue, options.runs)));
    if (key === "dt") options.dt = Math.max(0.01, parseNumber(rawValue, options.dt));
    if (key === "wpm") {
      options.wpm = Math.max(0, parseNumber(rawValue, options.wpm));
    }
  }
  return options;
}

function charsPerSecondFromWpm(wpm: number): number {
  return (wpm * 5) / 60;
}

function getCurrentLevels(game: CosmicDefenseCore): Map<EntityType, number> {
  const levels = new Map<EntityType, number>();
  for (const slot of game.getSlots()) {
    if (slot.occupant && slot.level > 0) {
      levels.set(slot.occupant, slot.level);
    }
  }
  return levels;
}

function hasReachedSimulationCap(levels: Map<EntityType, number>): boolean {
  for (const level of levels.values()) {
    if (level >= 100) return true;
  }
  return false;
}

function runSingleSimulation(dt: number, wpm: number): Map<EntityType, number> {
  const game = new CosmicDefenseCore();
  let keystrokeAccumulator = 0;
  const charsPerSecond = charsPerSecondFromWpm(wpm);

  while (game.state.planetHealth > 0) {
    if (game.state.pendingChoice) {
      const choices = game.getChoices();
      if (choices.length === 0) break;
      const choice = choices[Math.floor(Math.random() * choices.length)];
      if (!game.selectChoice(choice)) break;
      const levels = getCurrentLevels(game);
      if (hasReachedSimulationCap(levels)) return levels;
      continue;
    }

    game.update(dt);
    keystrokeAccumulator += charsPerSecond * dt;
    while (keystrokeAccumulator >= 1) {
      game.onCorrectKeystroke();
      keystrokeAccumulator -= 1;
    }
  }

  return getCurrentLevels(game);
}

function formatRow(entityType: EntityType, stats: ShipStats): string {
  const averageLevel = stats.selectedRuns > 0 ? stats.totalFinalLevel / stats.selectedRuns : 0;
  return `${entityType.padEnd(8)} selected_runs=${String(stats.selectedRuns).padStart(4)} avg_final_level=${averageLevel.toFixed(2).padStart(6)} max_final_level=${String(stats.maxFinalLevel).padStart(3)}`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const stats = new Map<EntityType, ShipStats>();

  for (const blueprint of SHIP_BLUEPRINTS) {
    stats.set(blueprint.entityType, {
      selectedRuns: 0,
      totalFinalLevel: 0,
      maxFinalLevel: 0,
    });
  }

  for (let run = 0; run < options.runs; run++) {
    const levels = runSingleSimulation(options.dt, options.wpm);
    for (const [entityType, level] of levels) {
      const entry = stats.get(entityType);
      if (!entry) continue;
      entry.selectedRuns++;
      entry.totalFinalLevel += level;
      entry.maxFinalLevel = Math.max(entry.maxFinalLevel, level);
    }
  }

  console.log(
    `cosmic-defense simulation runs=${options.runs} dt=${options.dt} wpm=${options.wpm} stop_level=100`
  );
  for (const blueprint of SHIP_BLUEPRINTS) {
    const entry = stats.get(blueprint.entityType);
    if (!entry) continue;
    console.log(formatRow(blueprint.entityType, entry));
  }
}

main();
