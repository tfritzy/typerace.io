export enum TowerType {
  Gun,
  Bleed,
}

export interface TowerTypeConfig {
  charsToFire: number;
  projectileSpeed: number;
  damage: number;
  bleedApplicationChance: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerTypeConfig> = {
  [TowerType.Gun]: {
    charsToFire: 4,
    projectileSpeed: 800,
    damage: 10,
    bleedApplicationChance: 0,
  },
  [TowerType.Bleed]: {
    charsToFire: 3,
    projectileSpeed: 800,
    damage: 10,
    bleedApplicationChance: 0.2,
  },
};

export const TOWER_SLOT_COUNT = 8;
export const TOWER_ORBIT_RADIUS = 140;
