export enum EngineType {
  Engine1Big,
  Engine1Small,
  Engine2Big,
  Engine2Small,
  Engine3Big,
  Engine3Small,
  Engine4Big,
  Engine4Small,
}

export enum ColorPreset {
  Preset1,
  Preset2,
  Preset3,
  Preset4,
}

export const COLOR_PRESET_COUNT = 4;

export const METEOR_ENTITY_TYPES = [
  "MeteorSmallBrown",
  "MeteorSmallWhite",
  "MeteorLargeBrown",
  "MeteorLargeWhite",
] as const;

export const SHIP_ENTITY_TYPES = [
  "Vanguard", "Sentinel", "Corsair", "Falcon", "Scout", "Dart", "Wasp",
  "Phoenix", "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Mite",
  "Titan", "Raptor", "Lance", "Grace", "Pip", "Raven", "Osprey",
  "Leviathan", "Talon", "Hornet", "Bastion", "Dreadnought", "Marauder",
  "Eagle", "Mender", "Tender", "Haven", "Warden", "Specter", "Harrier",
  "Viper", "Flea", "Broadside", "Kestrel", "Flare", "Striker", "Robin",
  "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Beacon", "Vulture", "Nova", "Ward", "Barb", "Spark",
  "Flagship", "Aegis", "Bolt", "Spur", "Dot", "Corona", "Clipper",
] as const;

export type EntityType =
  | (typeof METEOR_ENTITY_TYPES)[number]
  | (typeof SHIP_ENTITY_TYPES)[number];

const shipEntityTypeSet: ReadonlySet<string> = new Set(SHIP_ENTITY_TYPES);
const shipEntityTypeIndex = new Map<string, number>(
  SHIP_ENTITY_TYPES.map((t, i) => [t, i])
);

export function isShipEntityType(type: EntityType): boolean {
  return shipEntityTypeSet.has(type);
}

export function getShipEntityIndex(type: EntityType): number {
  return shipEntityTypeIndex.get(type) ?? -1;
}
