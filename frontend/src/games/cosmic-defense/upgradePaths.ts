import type { EntityType } from "./types";

export const UPGRADE_PATHS: EntityType[][] = [
  ["Moth", "Needle", "Clipper", "Warden"],
  ["Pip", "Osprey", "Raven", "Marauder"],
  ["Mender", "Tender", "Grace", "Haven"],
  ["Spark", "Ward", "Aegis", "Phoenix"],
  ["Speck", "Beacon", "Corona", "Bastion"],
  ["Mite", "Flare", "Bolt", "Colossus"],
  ["Specter", "Nova", "Sabre", "Leviathan"],
];

export const TIER_UPGRADE_COSTS = [15, 80, 400, 2000];

const shipTierMap = new Map<
  EntityType,
  { pathIndex: number; tierIndex: number }
>();
for (let p = 0; p < UPGRADE_PATHS.length; p++) {
  for (let t = 0; t < UPGRADE_PATHS[p].length; t++) {
    shipTierMap.set(UPGRADE_PATHS[p][t], { pathIndex: p, tierIndex: t });
  }
}

export function getShipTier(entityType: EntityType): number {
  return (shipTierMap.get(entityType)?.tierIndex ?? 0) + 1;
}

export function getNextUpgrade(entityType: EntityType): EntityType | null {
  const info = shipTierMap.get(entityType);
  if (!info) return null;
  const path = UPGRADE_PATHS[info.pathIndex];
  if (info.tierIndex >= path.length - 1) return null;
  return path[info.tierIndex + 1];
}

export function getUpgradeCost(entityType: EntityType): number {
  const nextType = getNextUpgrade(entityType);
  if (!nextType) return 0;
  const info = shipTierMap.get(nextType);
  if (!info) return 0;
  return TIER_UPGRADE_COSTS[info.tierIndex];
}

export function getAllUpgradeShipTypes(): EntityType[] {
  return UPGRADE_PATHS.flat();
}
