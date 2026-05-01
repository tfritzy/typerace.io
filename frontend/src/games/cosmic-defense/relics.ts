export type RelicId =
  | "stellar_core"
  | "void_crystal"
  | "charge_matrix"
  | "neural_harvester"
  | "overcharge_coil"
  | "inferno_lens"
  | "nanite_swarm"
  | "aegis_barrier"
  | "glacial_emitter"
  | "plasma_weave"
  | "jammer_array"
  | "surge_catalyst"
  | "flow_state";

export interface RelicEffects {
  damageMultiplier: number;
  enemySpeedMultiplier: number;
  planetRegenPerKeystroke: number;
  xpMultiplier: number;
  bonusChargesPerPerfectWord: number;
  explosionRadiusMultiplier: number;
  planetHealPerSecond: number;
  planetDamageReduction: number;
  freezeStacksBonus: number;
  plasmaStacksBonus: number;
  enemyFireSlowMultiplier: number;
  planetRegenPerPerfectWord: number;
  streakDamageBonus: number;
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
    description: "Gems grant 10% more XP.",
    sprite: "/futuristic_pixel_icons/Green Starcrystal.png",
    effects: { xpMultiplier: 1.10 },
  },
  {
    id: "overcharge_coil",
    name: "Overcharge Coil",
    description: "Completing a word with no errors grants all ships an extra charge.",
    sprite: "/futuristic_pixel_icons/Orange Core.png",
    effects: { bonusChargesPerPerfectWord: 1 },
  },
  {
    id: "inferno_lens",
    name: "Inferno Lens",
    description: "Explosion radii are 30% larger.",
    sprite: "/futuristic_pixel_icons/Orange Power Orb.png",
    effects: { explosionRadiusMultiplier: 1.3 },
  },
  {
    id: "nanite_swarm",
    name: "Nanite Swarm",
    description: "The planet passively regenerates 2 HP per second.",
    sprite: "/futuristic_pixel_icons/Green Core.png",
    effects: { planetHealPerSecond: 2 },
  },
  {
    id: "aegis_barrier",
    name: "Aegis Barrier",
    description: "The planet takes 25% less damage from enemies.",
    sprite: "/futuristic_pixel_icons/Amber Neon Shield.png",
    effects: { planetDamageReduction: 0.75 },
  },
  {
    id: "glacial_emitter",
    name: "Glacial Emitter",
    description: "Freezing attacks slow enemies for 1 additional second.",
    sprite: "/futuristic_pixel_icons/Turqoise Crystal.png",
    effects: { freezeStacksBonus: 1 },
  },
  {
    id: "plasma_weave",
    name: "Plasma Weave",
    description: "Burning attacks apply 1 additional second of plasma.",
    sprite: "/futuristic_pixel_icons/Purple Starcrystal.png",
    effects: { plasmaStacksBonus: 1 },
  },
  {
    id: "jammer_array",
    name: "Jammer Array",
    description: "Enemies fire 25% slower.",
    sprite: "/futuristic_pixel_icons/Blue Chip.png",
    effects: { enemyFireSlowMultiplier: 1.25 },
  },
  {
    id: "surge_catalyst",
    name: "Surge Catalyst",
    description: "Completing a word with no errors restores 20 HP to the planet.",
    sprite: "/futuristic_pixel_icons/Pink Crystal.png",
    effects: { planetRegenPerPerfectWord: 20 },
  },
  {
    id: "flow_state",
    name: "Flow State",
    description: "For each perfect word in your streak, allied weapons deal 3% more damage.",
    sprite: "/futuristic_pixel_icons/Orange Star Shards.png",
    effects: { streakDamageBonus: 0.03 },
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
    bonusChargesPerPerfectWord: 0,
    explosionRadiusMultiplier: 1,
    planetHealPerSecond: 0,
    planetDamageReduction: 1,
    freezeStacksBonus: 0,
    plasmaStacksBonus: 0,
    enemyFireSlowMultiplier: 1,
    planetRegenPerPerfectWord: 0,
    streakDamageBonus: 0,
  };
  for (const relicId of relics) {
    const def = RELIC_MAP.get(relicId);
    if (!def) continue;
    if (def.effects.damageMultiplier !== undefined) result.damageMultiplier *= def.effects.damageMultiplier;
    if (def.effects.enemySpeedMultiplier !== undefined) result.enemySpeedMultiplier *= def.effects.enemySpeedMultiplier;
    if (def.effects.planetRegenPerKeystroke !== undefined) result.planetRegenPerKeystroke += def.effects.planetRegenPerKeystroke;
    if (def.effects.xpMultiplier !== undefined) result.xpMultiplier *= def.effects.xpMultiplier;
    if (def.effects.bonusChargesPerPerfectWord !== undefined) result.bonusChargesPerPerfectWord += def.effects.bonusChargesPerPerfectWord;
    if (def.effects.explosionRadiusMultiplier !== undefined) result.explosionRadiusMultiplier *= def.effects.explosionRadiusMultiplier;
    if (def.effects.planetHealPerSecond !== undefined) result.planetHealPerSecond += def.effects.planetHealPerSecond;
    if (def.effects.planetDamageReduction !== undefined) result.planetDamageReduction *= def.effects.planetDamageReduction;
    if (def.effects.freezeStacksBonus !== undefined) result.freezeStacksBonus += def.effects.freezeStacksBonus;
    if (def.effects.plasmaStacksBonus !== undefined) result.plasmaStacksBonus += def.effects.plasmaStacksBonus;
    if (def.effects.enemyFireSlowMultiplier !== undefined) result.enemyFireSlowMultiplier *= def.effects.enemyFireSlowMultiplier;
    if (def.effects.planetRegenPerPerfectWord !== undefined) result.planetRegenPerPerfectWord += def.effects.planetRegenPerPerfectWord;
    if (def.effects.streakDamageBonus !== undefined) result.streakDamageBonus += def.effects.streakDamageBonus;
  }
  return result;
}
