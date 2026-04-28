export type RelicId = "stellar_core" | "void_crystal" | "charge_matrix";

export interface RelicEffects {
  damageMultiplier: number;
  enemySpeedMultiplier: number;
  planetRegenPerSecond: number;
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
    description: "The planet regenerates 2 HP per second.",
    sprite: "/futuristic_pixel_icons/Blue Cosmic Ring.png",
    effects: { planetRegenPerSecond: 2 },
  },
];

export const RELIC_MAP: Map<RelicId, RelicDefinition> = new Map(
  RELIC_CATALOG.map((r) => [r.id, r])
);

export function computeRelicEffects(relics: RelicId[]): RelicEffects {
  const result: RelicEffects = { damageMultiplier: 1, enemySpeedMultiplier: 1, planetRegenPerSecond: 0 };
  for (const relicId of relics) {
    const def = RELIC_MAP.get(relicId);
    if (!def) continue;
    if (def.effects.damageMultiplier !== undefined) result.damageMultiplier *= def.effects.damageMultiplier;
    if (def.effects.enemySpeedMultiplier !== undefined) result.enemySpeedMultiplier *= def.effects.enemySpeedMultiplier;
    if (def.effects.planetRegenPerSecond !== undefined) result.planetRegenPerSecond += def.effects.planetRegenPerSecond;
  }
  return result;
}
