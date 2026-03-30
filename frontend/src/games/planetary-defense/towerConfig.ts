export enum TowerType {
  Gun,
  Bleed,
  Plasma,
  Slow,
  Freeze,
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

export const TOWER_CONFIGS: Record<TowerType, TowerTypeConfig> = {
  [TowerType.Gun]: {
    charsToFire: 4,
    projectileSpeed: 800,
    damage: 10,
    bleedApplicationChance: 0,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 0,
  },
  [TowerType.Bleed]: {
    charsToFire: 3,
    projectileSpeed: 800,
    damage: 10,
    bleedApplicationChance: 0.2,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 0,
  },
  [TowerType.Plasma]: {
    charsToFire: 5,
    projectileSpeed: 800,
    damage: 5,
    bleedApplicationChance: 0,
    plasmaStacks: 3,
    slowStacks: 0,
    freezeStacks: 0,
  },
  [TowerType.Slow]: {
    charsToFire: 4,
    projectileSpeed: 800,
    damage: 5,
    bleedApplicationChance: 0,
    plasmaStacks: 0,
    slowStacks: 3,
    freezeStacks: 0,
  },
  [TowerType.Freeze]: {
    charsToFire: 6,
    projectileSpeed: 800,
    damage: 5,
    bleedApplicationChance: 0,
    plasmaStacks: 0,
    slowStacks: 0,
    freezeStacks: 2,
  },
};

export const TOWER_SLOT_COUNT = 8;
export const TOWER_ORBIT_RADIUS = 140;
