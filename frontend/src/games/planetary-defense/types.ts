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
  "Titan", "Raptor", "Lance", "Javelin", "Pip", "Raven", "Osprey",
  "Leviathan", "Talon", "Hornet", "Behemoth", "Dreadnought", "Marauder",
  "Eagle", "Pike", "Arrow", "Juggernaut", "Warden", "Specter", "Harrier",
  "Viper", "Flea", "Broadside", "Kestrel", "Finch", "Striker", "Robin",
  "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Piston", "Vulture", "Orb", "Flicker", "Barb", "Sliver",
  "Flagship", "Aegis", "Bolt", "Spur", "Dot", "Rampart", "Clipper",
] as const;

export type EntityType =
  | (typeof METEOR_ENTITY_TYPES)[number]
  | (typeof SHIP_ENTITY_TYPES)[number];
