import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { PLANET_X, PLANET_Y } from "./state";
import type { EntityType } from "./types";

export const COL_SPACING = 130;
export const ROW_SPACING = 110;
export const HEX_HALF_W = COL_SPACING / 2;
export const HEX_VERT = (ROW_SPACING * 2) / 3;
export const HEX_HALF_VERT = HEX_VERT / 2;

export function hexPoints(cx: number, cy: number): string {
  return [
    `${cx},${cy - HEX_VERT}`,
    `${cx + HEX_HALF_W},${cy - HEX_HALF_VERT}`,
    `${cx + HEX_HALF_W},${cy + HEX_HALF_VERT}`,
    `${cx},${cy + HEX_VERT}`,
    `${cx - HEX_HALF_W},${cy + HEX_HALF_VERT}`,
    `${cx - HEX_HALF_W},${cy - HEX_HALF_VERT}`,
  ].join(" ");
}
const PLANET_EXCLUSION = 170;
const MAX_X = CANVAS_WIDTH / 2;

export interface PlacementSlot {
  index: number;
  x: number;
  y: number;
  occupant: EntityType | null;
  entityId: number | null;
}

export function generateSlots(): PlacementSlot[] {
  const slots: PlacementSlot[] = [];
  let index = 0;
  const rows = [-3, -2, -1, 0, 1, 2, 3];

  for (const rowOffset of rows) {
    const y = PLANET_Y + rowOffset * ROW_SPACING;
    if (y < 60 || y > CANVAS_HEIGHT - 60) continue;

    const isOddRow = Math.abs(rowOffset) % 2 === 1;
    const startX = isOddRow ? HEX_HALF_W : 0;

    let x = startX + 60;
    while (x <= MAX_X) {
      const dx = x - PLANET_X;
      const dy = y - PLANET_Y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > PLANET_EXCLUSION) {
        slots.push({ index, x, y, occupant: null, entityId: null });
        index++;
      }

      x += COL_SPACING;
    }
  }

  return slots;
}
