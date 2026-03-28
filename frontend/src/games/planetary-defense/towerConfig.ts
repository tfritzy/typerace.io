export enum TowerType {
  Gun,
}

export interface TowerTypeConfig {
  charsToFire: number;
  projectileSpeed: number;
  damage: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerTypeConfig> = {
  [TowerType.Gun]: {
    charsToFire: 4,
    projectileSpeed: 800,
    damage: 10,
  },
};

export const TOWER_SLOT_COUNT = 8;
export const TOWER_ORBIT_RADIUS = 140;
