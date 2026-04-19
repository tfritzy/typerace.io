import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { type EnemyConfig, ENEMY_CATALOG } from "./enemyConfig";
import type { SpawnEntry } from "./state";

const SPACING = 90;
const PHASE_GAP = 4;
const FORMATION_STAGGER = 0.12;
const BASE_SPEED = 45;

interface Position {
  dx: number;
  dy: number;
}

type FormationGenerator = (count: number) => Position[];

interface FormationType {
  generate: FormationGenerator;
  minSize: number;
  maxSize: number;
}

function generateChevron(count: number): Position[] {
  const positions: Position[] = [{ dx: 0, dy: 0 }];
  let layer = 1;
  while (positions.length < count) {
    positions.push({ dx: layer, dy: -layer });
    if (positions.length < count) positions.push({ dx: layer, dy: layer });
    layer++;
  }
  return positions;
}

function generateLine(count: number): Position[] {
  const positions: Position[] = [];
  const half = (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    positions.push({ dx: 0, dy: i - half });
  }
  return positions;
}

function generateWall(count: number): Position[] {
  let bestCols = count;
  let bestRows = 1;
  for (let rows = 2; rows <= Math.ceil(Math.sqrt(count)); rows++) {
    const cols = Math.ceil(count / rows);
    if (Math.abs(rows - cols) < Math.abs(bestRows - bestCols)) {
      bestRows = rows;
      bestCols = cols;
    }
  }

  const positions: Position[] = [];
  const colOff = (bestCols - 1) / 2;
  for (let r = 0; r < bestRows && positions.length < count; r++) {
    for (let c = 0; c < bestCols && positions.length < count; c++) {
      positions.push({ dx: r, dy: c - colOff });
    }
  }
  return positions;
}

function generateEchelon(count: number): Position[] {
  const positions: Position[] = [];
  const half = (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    positions.push({ dx: i, dy: half - i });
  }
  return positions;
}

function generateArrow(count: number): Position[] {
  const positions: Position[] = [{ dx: 0, dy: 0 }];
  let layer = 1;
  while (positions.length < count) {
    for (let i = -layer; i <= layer && positions.length < count; i++) {
      positions.push({ dx: layer, dy: i });
    }
    layer++;
  }
  return positions;
}

function generateColumn(count: number): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    positions.push({ dx: i, dy: 0 });
  }
  return positions;
}

function generateCross(count: number): Position[] {
  const positions: Position[] = [{ dx: 0, dy: 0 }];
  let arm = 1;
  while (positions.length < count) {
    if (positions.length < count) positions.push({ dx: arm, dy: 0 });
    if (positions.length < count) positions.push({ dx: 0, dy: arm });
    if (positions.length < count) positions.push({ dx: 0, dy: -arm });
    if (positions.length < count) positions.push({ dx: -arm, dy: 0 });
    arm++;
  }
  return positions;
}

function generateDiamond(count: number): Position[] {
  const positions: Position[] = [{ dx: 0, dy: 0 }];
  let layer = 1;
  while (positions.length < count) {
    for (let i = 0; i <= layer && positions.length < count; i++) {
      const dx = i;
      const dy = layer - i;
      positions.push({ dx, dy });
      if (dy !== 0 && positions.length < count) positions.push({ dx, dy: -dy });
      if (dx !== 0 && positions.length < count) positions.push({ dx: -dx, dy });
      if (dx !== 0 && dy !== 0 && positions.length < count) positions.push({ dx: -dx, dy: -dy });
    }
    layer++;
  }
  return positions;
}

function shiftPositions(positions: Position[]): Position[] {
  const minDx = Math.min(...positions.map((p) => p.dx));
  if (minDx < 0) {
    return positions.map((p) => ({ dx: p.dx - minDx, dy: p.dy }));
  }
  return positions;
}

const FORMATION_TYPES: FormationType[] = [
  { generate: generateChevron, minSize: 3, maxSize: 20 },
  { generate: generateLine, minSize: 3, maxSize: 12 },
  { generate: generateWall, minSize: 4, maxSize: 20 },
  { generate: generateEchelon, minSize: 3, maxSize: 10 },
  { generate: generateArrow, minSize: 4, maxSize: 16 },
  { generate: generateColumn, minSize: 3, maxSize: 8 },
  { generate: generateCross, minSize: 5, maxSize: 13 },
  { generate: generateDiamond, minSize: 5, maxSize: 13 },
];

function pickShipForPhase(
  budget: number,
  catalog: EnemyConfig[]
): { config: EnemyConfig; maxCount: number } | null {
  const options: { config: EnemyConfig; maxCount: number; weight: number }[] =
    [];

  for (const config of catalog) {
    const maxCount = Math.floor(budget / config.power);
    if (maxCount < 2) continue;
    options.push({ config, maxCount, weight: maxCount * maxCount });
  }

  if (options.length === 0) {
    for (const config of catalog) {
      if (config.power <= budget) {
        return { config, maxCount: 1 };
      }
    }
    return null;
  }

  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return { config: option.config, maxCount: option.maxCount };
  }
  return options[options.length - 1];
}

function pickFormation(
  maxCount: number,
  excludeIndices: Set<number>
): { formation: Position[]; index: number } {
  const candidates: { positions: Position[]; index: number; weight: number }[] =
    [];

  for (let i = 0; i < FORMATION_TYPES.length; i++) {
    if (excludeIndices.has(i)) continue;
    const ft = FORMATION_TYPES[i];
    const count = Math.min(maxCount, ft.maxSize);
    if (count < ft.minSize) continue;
    candidates.push({
      positions: shiftPositions(ft.generate(count)),
      index: i,
      weight: count,
    });
  }

  if (candidates.length === 0) {
    for (let i = 0; i < FORMATION_TYPES.length; i++) {
      const ft = FORMATION_TYPES[i];
      const count = Math.min(maxCount, ft.maxSize);
      if (count < ft.minSize) continue;
      candidates.push({
        positions: shiftPositions(ft.generate(count)),
        index: i,
        weight: count,
      });
    }
  }

  if (candidates.length === 0) {
    return {
      formation: [{ dx: 0, dy: 0 }],
      index: -1,
    };
  }

  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) return { formation: c.positions, index: c.index };
  }
  const last = candidates[candidates.length - 1];
  return { formation: last.positions, index: last.index };
}

export function generateWaveSpawns(wave: number): SpawnEntry[] {
  const catalog = ENEMY_CATALOG;
  const totalBudget = Math.round(100 * Math.pow(wave, 1.5));
  const minPower = Math.min(...catalog.map((c) => c.power));

  const phaseSplits = [0.3, 0.35, 0.35];
  const entries: SpawnEntry[] = [];
  let timeOffset = 0;
  let accumulated = 0;
  const usedFormations = new Set<number>();
  const speed = BASE_SPEED + wave * 0.5;

  for (let p = 0; p < 3; p++) {
    const phaseBudget =
      Math.round(totalBudget * phaseSplits[p]) + accumulated;
    accumulated = 0;

    if (phaseBudget < minPower) {
      accumulated += phaseBudget;
      continue;
    }

    const pick = pickShipForPhase(phaseBudget, catalog);
    if (!pick) {
      accumulated += phaseBudget;
      continue;
    }

    const affordableCount = Math.floor(phaseBudget / pick.config.power);
    const { formation, index } = pickFormation(
      affordableCount,
      usedFormations
    );
    if (index >= 0) usedFormations.add(index);

    const formationCount = formation.length;
    const maxDy = Math.max(...formation.map((pos) => Math.abs(pos.dy)));
    const verticalSpread = maxDy * SPACING;
    const pad = 120;
    const minY = pad + verticalSpread;
    const maxY = CANVAS_HEIGHT - pad - verticalSpread;
    const centerY =
      minY >= maxY ? CANVAS_HEIGHT / 2 : minY + Math.random() * (maxY - minY);
    const baseX = CANVAS_WIDTH + pad;

    for (let i = 0; i < formationCount; i++) {
      const pos = formation[i];
      entries.push({
        config: pick.config,
        spawnTime: timeOffset + i * FORMATION_STAGGER,
        x: baseX + pos.dx * SPACING,
        y: centerY + pos.dy * SPACING,
        speed,
      });
    }

    timeOffset += formationCount * FORMATION_STAGGER + PHASE_GAP;
  }

  return entries;
}
