import { type EntityType, ColorPreset, ProjectileType } from "./types";

export const GRID_CELL = 24;

export interface ShipBlueprint {
  entityType: EntityType;
  name: string;
  cost: number;
  health: number;
  colorPreset: ColorPreset;
  firingRange: number;
  fireRate: number;
  projectileSpeed: number;
  projectileType: ProjectileType;
  occupancy: boolean[][];
}

export const SHIP_BLUEPRINTS: ShipBlueprint[] = [
  {
    entityType: "Clipper",
    name: "Clipper",
    cost: 50,
    health: 5800,
    colorPreset: ColorPreset.Preset1,
    firingRange: 400,
    fireRate: 1.5,
    projectileSpeed: 200,
    projectileType: ProjectileType.Projectile1,
    occupancy: [
      [false, true, false],
      [true, true, true],
    ],
  },
  {
    entityType: "Sentinel",
    name: "Sentinel",
    cost: 150,
    health: 34000,
    colorPreset: ColorPreset.Preset1,
    firingRange: 550,
    fireRate: 1.2,
    projectileSpeed: 260,
    projectileType: ProjectileType.Projectile3,
    occupancy: [
      [false, true, false],
      [true, true, true],
      [true, true, true],
      [false, true, false],
    ],
  },
  {
    entityType: "Phoenix",
    name: "Phoenix",
    cost: 300,
    health: 59000,
    colorPreset: ColorPreset.Preset1,
    firingRange: 650,
    fireRate: 1.0,
    projectileSpeed: 300,
    projectileType: ProjectileType.Projectile4,
    occupancy: [
      [false, true, false],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    entityType: "Aegis",
    name: "Aegis",
    cost: 500,
    health: 77000,
    colorPreset: ColorPreset.Preset1,
    firingRange: 750,
    fireRate: 0.8,
    projectileSpeed: 340,
    projectileType: ProjectileType.Projectile5,
    occupancy: [
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ],
  },
];
