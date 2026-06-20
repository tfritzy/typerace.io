import { PLANET_X, PLANET_Y } from "./state";
import type { EntityType } from "./types";

export const SLOT_COUNT = 10;
const ARC_RADIUS = 250;
const ARC_SPAN = Math.PI * 0.85;
const FRIENDLY_SLOT_CENTER_EXCLUSION_HALF_HEIGHT = 120;

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
  const halfSpan = ARC_SPAN / 2;
  const exclusionAngle = Math.asin(
    Math.min(1, FRIENDLY_SLOT_CENTER_EXCLUSION_HALF_HEIGHT / ARC_RADIUS),
  );
  const topCount = Math.ceil(SLOT_COUNT / 2);
  const bottomCount = SLOT_COUNT - topCount;

  const sampleAngles = (
    start: number,
    end: number,
    count: number,
  ): number[] => {
    if (count <= 0) return [];
    if (count === 1) return [(start + end) / 2];
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      out.push(start + ((end - start) * i) / (count - 1));
    }
    return out;
  };

  const angles = [
    ...sampleAngles(-halfSpan, -exclusionAngle, topCount),
    ...sampleAngles(exclusionAngle, halfSpan, bottomCount),
  ];

  const positions = angles.map((angle) => ({
    x: Math.round(PLANET_X + ARC_RADIUS * Math.cos(angle)),
    y: Math.round(PLANET_Y + ARC_RADIUS * Math.sin(angle)),
  }));

  const ordered = positions
    .map((_, index) => index)
    .sort((a, b) => {
      const deltaA = Math.abs(positions[a].y - PLANET_Y);
      const deltaB = Math.abs(positions[b].y - PLANET_Y);
      if (deltaA !== deltaB) return deltaA - deltaB;
      return positions[a].y - positions[b].y;
    });

  return ordered.map((posIdx, slotIdx) => ({
    index: slotIdx,
    x: positions[posIdx].x,
    y: positions[posIdx].y,
    occupant: null,
    entityId: null,
    level: 0,
  }));
}

export { SLOT_HIT_RADIUS, FRIENDLY_SLOT_CENTER_EXCLUSION_HALF_HEIGHT };
