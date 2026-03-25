import { TurretType, TurretRarity } from "./types";
import type { TurretConfig } from "./types";
import {
  BULLET_DAMAGE, MISSILE_DAMAGE, LASER_DAMAGE, RAILGUN_DAMAGE,
  NUCLEAR_MISSILE_DAMAGE,
} from "./constants";

export const TURRET_CONFIGS: TurretConfig[] = [
  {
    type: TurretType.Bullet,
    name: "Gun Turret",
    rarity: TurretRarity.Common,
    damage: BULLET_DAMAGE,
    color: 0x94a3b8,
    description: "Fires accurate bullets at typed targets.",
    fireRate: "Every word",
    special: "None",
  },
  {
    type: TurretType.Missile,
    name: "Missile Launcher",
    rarity: TurretRarity.Common,
    damage: MISSILE_DAMAGE,
    color: 0xf59e0b,
    description: "Fires explosive missiles with area damage.",
    fireRate: "Every word",
    special: "AoE 35px",
  },
  {
    type: TurretType.Laser,
    name: "Laser Array",
    rarity: TurretRarity.Rare,
    damage: LASER_DAMAGE,
    color: 0x60a5fa,
    description: "Fires instant-hit laser beams with line of sight.",
    fireRate: "Every word",
    special: "Instant hit",
  },
  {
    type: TurretType.Railgun,
    name: "Railgun",
    rarity: TurretRarity.Rare,
    damage: RAILGUN_DAMAGE,
    color: 0xa855f7,
    description: "High-velocity projectile with massive damage.",
    fireRate: "Every word",
    special: "Speed 800",
  },
  {
    type: TurretType.NuclearMissile,
    name: "Nuclear Silo",
    rarity: TurretRarity.Epic,
    damage: NUCLEAR_MISSILE_DAMAGE,
    color: 0xef4444,
    description: "Devastates a massive area with nuclear payload.",
    fireRate: "Every word",
    special: "AoE 100px",
  },
];

const RARITY_WEIGHTS: Record<TurretRarity, number> = {
  [TurretRarity.Common]: 60,
  [TurretRarity.Rare]: 30,
  [TurretRarity.Epic]: 10,
};

export function getConfigForType(type: TurretType): TurretConfig {
  return TURRET_CONFIGS.find(c => c.type === type)!;
}

export function rollTurretOfferings(count: number): TurretConfig[] {
  const offerings: TurretConfig[] = [];
  const totalWeight = TURRET_CONFIGS.reduce((sum, c) => sum + RARITY_WEIGHTS[c.rarity], 0);

  for (let i = 0; i < count; i++) {
    let roll = Math.random() * totalWeight;
    let chosen = TURRET_CONFIGS[0];
    for (const config of TURRET_CONFIGS) {
      roll -= RARITY_WEIGHTS[config.rarity];
      if (roll <= 0) {
        chosen = config;
        break;
      }
    }
    offerings.push(chosen);
  }

  return offerings;
}

export interface ShipType {
  name: string;
  offeringCount: number;
  weight: number;
}

export const SHIP_TYPES: ShipType[] = [
  { name: "Supply Frigate", offeringCount: 3, weight: 100 },
];

export function rollShipTypes(count: number): ShipType[] {
  const ships: ShipType[] = [];
  const totalWeight = SHIP_TYPES.reduce((sum, s) => sum + s.weight, 0);

  for (let i = 0; i < count; i++) {
    let roll = Math.random() * totalWeight;
    let chosen = SHIP_TYPES[0];
    for (const shipType of SHIP_TYPES) {
      roll -= shipType.weight;
      if (roll <= 0) {
        chosen = shipType;
        break;
      }
    }
    ships.push(chosen);
  }

  return ships;
}

export function rarityColor(rarity: TurretRarity): number {
  switch (rarity) {
    case TurretRarity.Common: return 0x9ca3af;
    case TurretRarity.Rare: return 0x3b82f6;
    case TurretRarity.Epic: return 0xa855f7;
  }
}

export function rarityLabel(rarity: TurretRarity): string {
  switch (rarity) {
    case TurretRarity.Common: return "Common";
    case TurretRarity.Rare: return "Rare";
    case TurretRarity.Epic: return "Epic";
  }
}
