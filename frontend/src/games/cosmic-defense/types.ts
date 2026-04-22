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
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
  Tier4 = 4,
  Tier5 = 5,
  Tier6 = 6,
  PlasmaExplosive = 7,
}

export const PROJECTILE_EXPLOSION_TYPES: Record<ProjectileType, ExplosionType> = {
  [ProjectileType.Tiny]: ExplosionType.Tier1,
  [ProjectileType.Projectile1]: ExplosionType.Tier1,
  [ProjectileType.Projectile2]: ExplosionType.Tier2,
  [ProjectileType.Projectile3]: ExplosionType.Tier3,
  [ProjectileType.Projectile4]: ExplosionType.Tier4,
  [ProjectileType.Projectile5]: ExplosionType.Tier5,
  [ProjectileType.Projectile6]: ExplosionType.Tier6,
};

export const ENTITY_EXPLOSION_TYPES: Partial<Record<EntityType, ExplosionType>> = {
  Dart: ExplosionType.PlasmaExplosive,
};

export function getExplosionType(entityType: EntityType, projectileType: ProjectileType): ExplosionType {
  return ENTITY_EXPLOSION_TYPES[entityType] ?? PROJECTILE_EXPLOSION_TYPES[projectileType];
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
