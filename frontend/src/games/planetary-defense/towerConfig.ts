export enum TowerType {
  Gun,
  Bleed,
  Plasma,
  Slow,
  Freeze,
  Charge,
}

export interface TowerTypeConfig {
  charsToFire: number;
  projectileSpeed: number;
  damage: number;
  bleedApplicationChance: number;
  plasmaStacks: number;
  slowStacks: number;
  freezeStacks: number;
}

const TOWER_DEFAULTS: TowerTypeConfig = {
  charsToFire: 4,
  projectileSpeed: 800,
  damage: 10,
  bleedApplicationChance: 0,
  plasmaStacks: 0,
  slowStacks: 0,
  freezeStacks: 0,
};

function tower(overrides: Partial<TowerTypeConfig>): TowerTypeConfig {
  return { ...TOWER_DEFAULTS, ...overrides };
}

export const TOWER_CONFIGS: Record<TowerType, TowerTypeConfig> = {
  [TowerType.Gun]: tower({}),
  [TowerType.Bleed]: tower({ charsToFire: 3, bleedApplicationChance: 0.2 }),
  [TowerType.Plasma]: tower({ charsToFire: 5, damage: 5, plasmaStacks: 3 }),
  [TowerType.Slow]: tower({ damage: 5, slowStacks: 3 }),
  [TowerType.Freeze]: tower({ charsToFire: 6, damage: 5, freezeStacks: 2 }),
  [TowerType.Charge]: tower({ charsToFire: 3, damage: 0, projectileSpeed: 0 }),
};

export const TOWER_SLOT_COUNT = 8;
export const TOWER_ORBIT_RADIUS = 140;
