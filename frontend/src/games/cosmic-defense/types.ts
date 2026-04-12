export enum ColorPreset {
  Preset1,
  Preset2,
  Preset3,
  Preset4,
}

export const SHIP_ENTITY_TYPES = [
  "Vanguard", "Sentinel", "Corsair", "Falcon", "Scout", "Dart", "Wasp",
  "Phoenix", "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Mite",
  "Titan", "Raptor", "Lance", "Javelin", "Pip", "Raven", "Osprey",
  "Leviathan", "Talon", "Hornet", "Behemoth", "Dreadnought", "Marauder",
  "Eagle", "Pike", "Arrow", "Juggernaut", "Warden", "Specter", "Harrier",
  "Viper", "Flea", "Broadside", "Kestrel", "Finch", "Striker", "Robin",
  "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Piston", "Vulture", "Orb", "Flicker", "Barb", "Sliver",
  "Flagship", "Aegis", "Bolt", "Spur", "Dot", "Rampart", "Clipper",
] as const;

export type EntityType = (typeof SHIP_ENTITY_TYPES)[number];

const shipEntityTypeIndex = new Map<string, number>(
  SHIP_ENTITY_TYPES.map((t, i) => [t, i])
);

export function getShipEntityIndex(type: EntityType): number {
  return shipEntityTypeIndex.get(type) ?? -1;
}
