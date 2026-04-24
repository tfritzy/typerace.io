import { CosmicDefenseCore } from "../src/games/cosmic-defense/core.ts";
import { SHIP_BLUEPRINTS } from "../src/games/cosmic-defense/shipBlueprints.ts";
import type { EntityType } from "../src/games/cosmic-defense/types.ts";

interface SimulationOptions {
  runs: number;
  dt: number;
  keystrokesPerSecond: number;
  seed: number;
}

interface ShipStats {
  selectedRuns: number;
  totalFinalLevel: number;
  maxFinalLevel: number;
}

const DEFAULT_OPTIONS: SimulationOptions = {
  runs: 100,
  dt: 0.1,
  keystrokesPerSecond: 8,
  seed: 1337,
};

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
    if (key === "keystrokes-per-second") {
      options.keystrokesPerSecond = Math.max(0, parseNumber(rawValue, options.keystrokesPerSecond));
    }
    if (key === "seed") options.seed = Math.floor(parseNumber(rawValue, options.seed));
  }
  return options;
}

function runSingleSimulation(random: () => number, dt: number, keystrokesPerSecond: number): Map<EntityType, number> {
  const game = new CosmicDefenseCore({ random, maxLevel: 100 });
  let keystrokeAccumulator = 0;

  while (game.state.planetHealth > 0) {
    if (game.state.pendingChoice) {
      const choices = game.getChoices();
      if (choices.length === 0) break;
      const choice = choices[Math.floor(random() * choices.length)];
      if (!game.selectChoice(choice)) break;
      if (game.state.level >= game.state.maxLevel && !game.state.pendingChoice) break;
      continue;
    }

    game.update(dt);
    keystrokeAccumulator += keystrokesPerSecond * dt;
    while (keystrokeAccumulator >= 1) {
      game.onCorrectKeystroke();
      keystrokeAccumulator -= 1;
    }

    if (game.state.level >= game.state.maxLevel && !game.state.pendingChoice) break;
  }

  const levels = new Map<EntityType, number>();
  for (const slot of game.getSlots()) {
    if (slot.occupant && slot.level > 0) {
      levels.set(slot.occupant, slot.level);
    }
  }
  return levels;
}

function formatRow(entityType: EntityType, stats: ShipStats): string {
  const averageLevel = stats.selectedRuns > 0 ? stats.totalFinalLevel / stats.selectedRuns : 0;
  return `${entityType.padEnd(8)} selected_runs=${String(stats.selectedRuns).padStart(4)} avg_final_level=${averageLevel.toFixed(2).padStart(6)} max_final_level=${String(stats.maxFinalLevel).padStart(3)}`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const masterRandom = createSeededRandom(options.seed);
  const stats = new Map<EntityType, ShipStats>();

  for (const blueprint of SHIP_BLUEPRINTS) {
    stats.set(blueprint.entityType, {
      selectedRuns: 0,
      totalFinalLevel: 0,
      maxFinalLevel: 0,
    });
  }

  for (let run = 0; run < options.runs; run++) {
    const runSeed = Math.floor(masterRandom() * 0xFFFFFFFF) >>> 0;
    const levels = runSingleSimulation(
      createSeededRandom(runSeed),
      options.dt,
      options.keystrokesPerSecond
    );
    for (const [entityType, level] of levels) {
      const entry = stats.get(entityType);
      if (!entry) continue;
      entry.selectedRuns++;
      entry.totalFinalLevel += level;
      entry.maxFinalLevel = Math.max(entry.maxFinalLevel, level);
    }
  }

  console.log(
    `cosmic-defense simulation runs=${options.runs} seed=${options.seed} dt=${options.dt} keystrokes_per_second=${options.keystrokesPerSecond} max_level=100`
  );
  for (const blueprint of SHIP_BLUEPRINTS) {
    const entry = stats.get(blueprint.entityType);
    if (!entry) continue;
    console.log(formatRow(blueprint.entityType, entry));
  }
}

main();
