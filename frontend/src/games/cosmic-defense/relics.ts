export type RelicId =
  | "stellar_core"
  | "void_crystal"
  | "charge_matrix"
  | "neural_harvester"
  | "overcharge_coil"
  | "inferno_lens"
  | "titan_shell"
  | "entropy_field"
  | "glacial_emitter"
  | "plasma_weave"
  | "jammer_array";

export interface RelicEffects {
  damageMultiplier: number;
  enemySpeedMultiplier: number;
  planetRegenPerKeystroke: number;
  xpMultiplier: number;
  bonusChargesPerKeystroke: number;
  explosionRadiusMultiplier: number;
  planetMaxHealthMultiplier: number;
  spawnRateMultiplier: number;
  freezeStacksBonus: number;
  plasmaStacksBonus: number;
  enemyFireSlowMultiplier: number;
}

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  sprite: string;
  effects: Partial<RelicEffects>;
}

export const RELIC_CATALOG: RelicDefinition[] = [
  {
    id: "stellar_core",
    name: "Stellar Core",
    description: "Allied weapons deal 10% more damage.",
    sprite: "/futuristic_pixel_icons/Blue Core.png",
    effects: { damageMultiplier: 1.1 },
  },
  {
    id: "void_crystal",
    name: "Void Crystal",
    description: "Enemies move 15% slower.",
    sprite: "/futuristic_pixel_icons/Blue Star Crystal.png",
    effects: { enemySpeedMultiplier: 0.85 },
  },
  {
    id: "charge_matrix",
    name: "Charge Matrix",
    description: "The planet regenerates 1 HP per keystroke.",
    sprite: "/futuristic_pixel_icons/Blue Cosmic Ring.png",
    effects: { planetRegenPerKeystroke: 1 },
  },
  {
    id: "neural_harvester",
    name: "Neural Harvester",
    description: "Gems grant 25% more XP.",
    sprite: "/futuristic_pixel_icons/Green Starcrystal.png",
    effects: { xpMultiplier: 1.25 },
  },
  {
    id: "overcharge_coil",
    name: "Overcharge Coil",
    description: "Each correct keystroke grants an extra charge to all ships.",
    sprite: "/futuristic_pixel_icons/Orange Core.png",
    effects: { bonusChargesPerKeystroke: 1 },
  },
  {
    id: "inferno_lens",
    name: "Inferno Lens",
    description: "Explosion radii are 30% larger.",
    sprite: "/futuristic_pixel_icons/Orange Power Orb.png",
    effects: { explosionRadiusMultiplier: 1.3 },
  },
  {
    id: "titan_shell",
    name: "Titan Shell",
    description: "Planet maximum health increased by 25%.",
    sprite: "/futuristic_pixel_icons/Blue Neon Shield.png",
    effects: { planetMaxHealthMultiplier: 1.25 },
  },
  {
    id: "entropy_field",
    name: "Entropy Field",
    description: "Enemies spawn 20% less frequently.",
    sprite: "/futuristic_pixel_icons/Darkpurple Cosmic Ring.png",
    effects: { spawnRateMultiplier: 0.8 },
  },
  {
    id: "glacial_emitter",
    name: "Glacial Emitter",
    description: "All attacks apply 1 additional freeze stack.",
    sprite: "/futuristic_pixel_icons/Turqoise Crystal.png",
    effects: { freezeStacksBonus: 1 },
  },
  {
    id: "plasma_weave",
    name: "Plasma Weave",
    description: "All attacks apply 1 additional plasma stack.",
    sprite: "/futuristic_pixel_icons/Purple Starcrystal.png",
    effects: { plasmaStacksBonus: 1 },
  },
  {
    id: "jammer_array",
    name: "Jammer Array",
    description: "Enemies fire 30% slower.",
    sprite: "/futuristic_pixel_icons/Blue Chip.png",
    effects: { enemyFireSlowMultiplier: 1.3 },
  },
];

export const RELIC_MAP: Map<RelicId, RelicDefinition> = new Map(
  RELIC_CATALOG.map((r) => [r.id, r])
);

export function computeRelicEffects(relics: RelicId[]): RelicEffects {
  const result: RelicEffects = {
    damageMultiplier: 1,
    enemySpeedMultiplier: 1,
    planetRegenPerKeystroke: 0,
    xpMultiplier: 1,
    bonusChargesPerKeystroke: 0,
    explosionRadiusMultiplier: 1,
    planetMaxHealthMultiplier: 1,
    spawnRateMultiplier: 1,
    freezeStacksBonus: 0,
    plasmaStacksBonus: 0,
    enemyFireSlowMultiplier: 1,
  };
  for (const relicId of relics) {
    const def = RELIC_MAP.get(relicId);
    if (!def) continue;
    if (def.effects.damageMultiplier !== undefined) result.damageMultiplier *= def.effects.damageMultiplier;
    if (def.effects.enemySpeedMultiplier !== undefined) result.enemySpeedMultiplier *= def.effects.enemySpeedMultiplier;
    if (def.effects.planetRegenPerKeystroke !== undefined) result.planetRegenPerKeystroke += def.effects.planetRegenPerKeystroke;
    if (def.effects.xpMultiplier !== undefined) result.xpMultiplier *= def.effects.xpMultiplier;
    if (def.effects.bonusChargesPerKeystroke !== undefined) result.bonusChargesPerKeystroke += def.effects.bonusChargesPerKeystroke;
    if (def.effects.explosionRadiusMultiplier !== undefined) result.explosionRadiusMultiplier *= def.effects.explosionRadiusMultiplier;
    if (def.effects.planetMaxHealthMultiplier !== undefined) result.planetMaxHealthMultiplier *= def.effects.planetMaxHealthMultiplier;
    if (def.effects.spawnRateMultiplier !== undefined) result.spawnRateMultiplier *= def.effects.spawnRateMultiplier;
    if (def.effects.freezeStacksBonus !== undefined) result.freezeStacksBonus += def.effects.freezeStacksBonus;
    if (def.effects.plasmaStacksBonus !== undefined) result.plasmaStacksBonus += def.effects.plasmaStacksBonus;
    if (def.effects.enemyFireSlowMultiplier !== undefined) result.enemyFireSlowMultiplier *= def.effects.enemyFireSlowMultiplier;
  }
  return result;
}
