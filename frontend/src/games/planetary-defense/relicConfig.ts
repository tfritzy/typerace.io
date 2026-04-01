export enum RelicType {
  Gun,
  Bleed,
  Plasma,
  Slow,
  Freeze,
}

export interface RelicTypeConfig {
  charsToFire: number;
  projectileSpeed: number;
  damage: number;
  bleedApplicationChance: number;
  plasmaStacks: number;
  slowStacks: number;
  freezeStacks: number;
  chargesNeighbors: boolean;
  chainCount: number;
  explosionRange: number;
  multiShotCount: number;
  damageBuffIndexes: number[];
  damageBuffAll: boolean;
  damageBuffMultiplier: number;
}

const RELIC_DEFAULTS: RelicTypeConfig = {
  charsToFire: 4,
  projectileSpeed: 800,
  damage: 10,
  bleedApplicationChance: 0,
  plasmaStacks: 0,
  slowStacks: 0,
  freezeStacks: 0,
  chargesNeighbors: false,
  chainCount: 0,
  explosionRange: 0,
  multiShotCount: 1,
  damageBuffIndexes: [],
  damageBuffAll: false,
  damageBuffMultiplier: 0,
};

function relic(overrides: Partial<RelicTypeConfig>): RelicTypeConfig {
  return { ...RELIC_DEFAULTS, ...overrides };
}

export const RELIC_CONFIGS: Record<RelicType, RelicTypeConfig> = {
  [RelicType.Gun]: relic({ chainCount: 2 }),
  [RelicType.Bleed]: relic({ charsToFire: 3, bleedApplicationChance: 0.2 }),
  [RelicType.Plasma]: relic({ charsToFire: 5, damage: 5, plasmaStacks: 3 }),
  [RelicType.Slow]: relic({ damage: 5, slowStacks: 3 }),
  [RelicType.Freeze]: relic({ charsToFire: 6, damage: 5, freezeStacks: 2 }),
};

export const RELIC_SLOT_COUNT = 8;
export const RELIC_ORBIT_RADIUS = 140;
