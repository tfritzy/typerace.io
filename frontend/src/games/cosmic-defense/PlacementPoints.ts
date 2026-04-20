import { PLANET_X, PLANET_Y } from "./state";
import type { EntityType } from "./types";

export const SLOT_COUNT = 10;
const ARC_RADIUS = 250;
const ARC_SPAN = Math.PI * 0.85;

const SLOT_HIT_RADIUS = 22;

export interface PlacementSlot {
  index: number;
  x: number;
  y: number;
  occupant: EntityType | null;
  entityId: number | null;
  level: number;
}

export function generateSlots(): PlacementSlot[] {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const angle = -ARC_SPAN / 2 + (ARC_SPAN * i) / (SLOT_COUNT - 1);
    positions.push({
      x: Math.round(PLANET_X + ARC_RADIUS * Math.cos(angle)),
      y: Math.round(PLANET_Y + ARC_RADIUS * Math.sin(angle)),
    });
  }

  const midIndex = Math.floor(SLOT_COUNT / 2);
  const ordered: number[] = [midIndex];
  for (let offset = 1; ordered.length < SLOT_COUNT; offset++) {
    if (midIndex - offset >= 0) ordered.push(midIndex - offset);
    if (midIndex + offset < SLOT_COUNT) ordered.push(midIndex + offset);
  }

  return ordered.map((posIdx, slotIdx) => ({
    index: slotIdx,
    x: positions[posIdx].x,
    y: positions[posIdx].y,
    occupant: null,
    entityId: null,
    level: 0,
  }));
}

export { SLOT_HIT_RADIUS };
