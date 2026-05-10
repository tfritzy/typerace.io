import { SHIP_BLUEPRINTS } from "../shipCatalog";
import type { EntityType } from "../types";
import type { PlacementSlot } from "../PlacementPoints";

const CONSISTENT_DAMAGE_ROLES = new Set([
  "sniper",
  "laser",
  "dual_shot",
  "pierce_laser",
  "shooter",
  "chain",
  "mac_cannon",
]);

export function generateChoices(slots: PlacementSlot[]): EntityType[] {
  const existing = new Set(
    slots.filter((s) => s.occupant).map((s) => s.occupant!)
  );
  const hasEmptySlot = slots.some((s) => !s.occupant);

  let pool: EntityType[];
  if (hasEmptySlot) {
    const hasAnyShip = existing.size > 0;
    if (hasAnyShip) {
      pool = SHIP_BLUEPRINTS.map((bp) => bp.entityType);
    } else {
      pool = SHIP_BLUEPRINTS.filter((bp) =>
        CONSISTENT_DAMAGE_ROLES.has(bp.role)
      ).map((bp) => bp.entityType);
    }
  } else {
    pool = [...existing];
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(3, pool.length));
}
