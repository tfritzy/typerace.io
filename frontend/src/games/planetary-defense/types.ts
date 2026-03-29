export enum ShipType {
  Vanguard,
  Sentinel,
  Corsair,
  Falcon,
  Scout,
  Dart,
  Wasp,
  Phoenix,
  Hawk,
  Sparrow,
  Gnat,
  Stinger,
  Needle,
  Mite,
  Titan,
  Raptor,
  Lance,
  Javelin,
  Pip,
  Raven,
  Osprey,
  Leviathan,
  Talon,
  Hornet,
  Behemoth,
  Dreadnought,
  Marauder,
  Eagle,
  Pike,
  Arrow,
  Juggernaut,
  Warden,
  Specter,
  Harrier,
  Viper,
  Flea,
  Broadside,
  Kestrel,
  Finch,
  Striker,
  Robin,
  Cricket,
  Moth,
  Colossus,
  Cutlass,
  Sabre,
  Mantis,
  Speck,
  Crest,
  Piston,
  Vulture,
  Orb,
  Flicker,
  Barb,
  Sliver,
  Flagship,
  Aegis,
  Bolt,
  Spur,
  Dot,
  Rampart,
  Clipper,
}

export const SHIP_TYPE_COUNT = 62;

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

export enum MeteorType {
  LargeBrown,
  LargeWhite,
  SmallBrown,
  SmallWhite,
}

export const METEOR_TYPE_COUNT = 4;

const METEOR_TYPES = [
  "MeteorSmallBrown",
  "MeteorSmallWhite",
  "MeteorLargeBrown",
  "MeteorLargeWhite",
] as const;

const SHIP_TYPES = [
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

export type EntityType = (typeof METEOR_TYPES)[number] | (typeof SHIP_TYPES)[number];

export const METEOR_ENTITY_TYPES: readonly EntityType[] = METEOR_TYPES;
export const SHIP_ENTITY_TYPES: readonly EntityType[] = SHIP_TYPES;

const SHIP_TYPE_MAP: Record<(typeof SHIP_TYPES)[number], ShipType> = {
  Vanguard: ShipType.Vanguard, Sentinel: ShipType.Sentinel,
  Corsair: ShipType.Corsair, Falcon: ShipType.Falcon,
  Scout: ShipType.Scout, Dart: ShipType.Dart,
  Wasp: ShipType.Wasp, Phoenix: ShipType.Phoenix,
  Hawk: ShipType.Hawk, Sparrow: ShipType.Sparrow,
  Gnat: ShipType.Gnat, Stinger: ShipType.Stinger,
  Needle: ShipType.Needle, Mite: ShipType.Mite,
  Titan: ShipType.Titan, Raptor: ShipType.Raptor,
  Lance: ShipType.Lance, Javelin: ShipType.Javelin,
  Pip: ShipType.Pip, Raven: ShipType.Raven,
  Osprey: ShipType.Osprey, Leviathan: ShipType.Leviathan,
  Talon: ShipType.Talon, Hornet: ShipType.Hornet,
  Behemoth: ShipType.Behemoth, Dreadnought: ShipType.Dreadnought,
  Marauder: ShipType.Marauder, Eagle: ShipType.Eagle,
  Pike: ShipType.Pike, Arrow: ShipType.Arrow,
  Juggernaut: ShipType.Juggernaut, Warden: ShipType.Warden,
  Specter: ShipType.Specter, Harrier: ShipType.Harrier,
  Viper: ShipType.Viper, Flea: ShipType.Flea,
  Broadside: ShipType.Broadside, Kestrel: ShipType.Kestrel,
  Finch: ShipType.Finch, Striker: ShipType.Striker,
  Robin: ShipType.Robin, Cricket: ShipType.Cricket,
  Moth: ShipType.Moth, Colossus: ShipType.Colossus,
  Cutlass: ShipType.Cutlass, Sabre: ShipType.Sabre,
  Mantis: ShipType.Mantis, Speck: ShipType.Speck,
  Crest: ShipType.Crest, Piston: ShipType.Piston,
  Vulture: ShipType.Vulture, Orb: ShipType.Orb,
  Flicker: ShipType.Flicker, Barb: ShipType.Barb,
  Sliver: ShipType.Sliver, Flagship: ShipType.Flagship,
  Aegis: ShipType.Aegis, Bolt: ShipType.Bolt,
  Spur: ShipType.Spur, Dot: ShipType.Dot,
  Rampart: ShipType.Rampart, Clipper: ShipType.Clipper,
};

const METEOR_TYPE_MAP: Record<(typeof METEOR_TYPES)[number], MeteorType> = {
  MeteorSmallBrown: MeteorType.SmallBrown,
  MeteorSmallWhite: MeteorType.SmallWhite,
  MeteorLargeBrown: MeteorType.LargeBrown,
  MeteorLargeWhite: MeteorType.LargeWhite,
};

export function toShipType(t: EntityType): ShipType {
  return SHIP_TYPE_MAP[t as (typeof SHIP_TYPES)[number]];
}

export function toMeteorType(t: EntityType): MeteorType {
  return METEOR_TYPE_MAP[t as (typeof METEOR_TYPES)[number]];
}
