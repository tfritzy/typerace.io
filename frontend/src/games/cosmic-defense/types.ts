export enum ColorPreset {
  Preset1,
  Preset2,
  Preset3,
  Preset4,
}

export enum Team {
  Allied,
  Enemy,
}

export enum DamageType {
  Physical = "physical",
  Laser = "laser",
  Plasma = "plasma",
  Ice = "ice",
}

export enum FireMode {
  Projectile = "projectile",
  Laser = "laser",
}

export enum ExplosionType {
  PlasmaExplosive = 1,
  IceExplosive = 2,
  Explosive = 3,
  MothHit = 4,
  ChainHit = 5,
}

export const SHIP_ENTITY_TYPES = [
  "Vanguard", "Sentinel", "Corsair", "Dynamo", "Scout", "Dart", "Wasp",
  "Inferno", "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Pulse",
  "Titan", "Raptor", "Lance", "Grace", "Pip", "Raven", "Osprey",
  "Leviathan", "Talon", "Hornet", "Bastion", "Dreadnought", "Marauder",
  "Eagle", "Mender", "Tender", "Haven", "Warden", "Prism", "Harrier",
  "Viper", "Flea", "Broadside", "Kestrel", "Flare", "Striker", "Robin",
  "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Buckler",
  "Crest", "Ember", "Vulture", "Nova", "Ward", "Barb", "Spark",
  "Flagship", "Aegis", "Bolt", "Spur", "Dot", "Corona", "Clipper",
] as const;

export type EntityType = (typeof SHIP_ENTITY_TYPES)[number];

const shipEntityTypeIndex = new Map<string, number>(
  SHIP_ENTITY_TYPES.map((t, i) => [t, i])
);

export function getShipEntityIndex(type: EntityType): number {
  return shipEntityTypeIndex.get(type) ?? -1;
}
