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

export enum ProjectileType {
  Tiny = 0,
  Projectile1 = 1,
  Projectile2 = 2,
  Projectile3 = 3,
  Projectile4 = 4,
  Projectile5 = 5,
  Projectile6 = 6,
}

export enum ExplosionType {
  PlasmaExplosive = 1,
  IceExplosive = 2,
  Explosive = 3,
  MothHit = 4,
}

export const ENTITY_EXPLOSION_TYPES: Partial<Record<EntityType, ExplosionType>> = {
  Dart: ExplosionType.PlasmaExplosive,
  Flare: ExplosionType.IceExplosive,
  Hawk: ExplosionType.Explosive,
  Moth: ExplosionType.MothHit,
};

export function getExplosionType(entityType: EntityType): ExplosionType {
  return ENTITY_EXPLOSION_TYPES[entityType] ?? ExplosionType.MothHit;
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
