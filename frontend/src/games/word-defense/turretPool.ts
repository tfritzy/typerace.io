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
    special: "Speed 400",
  },
  {
    type: TurretType.NuclearMissile,
    name: "Nuclear Silo",
    rarity: TurretRarity.Rare,
    damage: NUCLEAR_MISSILE_DAMAGE,
    color: 0xef4444,
    description: "Devastates a massive area with nuclear payload.",
    fireRate: "Every word",
    special: "AoE 100px",
  },
];

const COMMON_TURRETS = TURRET_CONFIGS.filter(c => c.rarity === TurretRarity.Common);
const RARE_TURRETS = TURRET_CONFIGS.filter(c => c.rarity === TurretRarity.Rare);

export function getConfigForType(type: TurretType): TurretConfig {
  const config = TURRET_CONFIGS.find(c => c.type === type);
  if (!config) {
    return TURRET_CONFIGS[0];
  }
  return config;
}

export function rollTurretOfferings(count: number, isRare: boolean): TurretConfig[] {
  const pool = isRare ? RARE_TURRETS : COMMON_TURRETS;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export interface ShipType {
  name: string;
  offeringCount: number;
  weight: number;
  isRare: boolean;
}

export const SHIP_TYPES: ShipType[] = [
  { name: "Supply Frigate", offeringCount: 2, weight: 75, isRare: false },
  { name: "Rare Trader", offeringCount: 2, weight: 25, isRare: true },
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
    case TurretRarity.Rare: return 0xf59e0b;
  }
}

export function rarityLabel(rarity: TurretRarity): string {
  switch (rarity) {
    case TurretRarity.Common: return "Common";
    case TurretRarity.Rare: return "Rare";
  }
}
