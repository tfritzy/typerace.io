import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { PLANET_X, PLANET_Y } from "./state";
import type { EntityType } from "./types";

const COL_SPACING = 130;
const ROW_SPACING = 110;
const HALF_COL = COL_SPACING / 2;
const PLANET_EXCLUSION = 170;
const MAX_X = CANVAS_WIDTH / 2;

export interface PlacementSlot {
  index: number;
  x: number;
  y: number;
  occupant: EntityType | null;
}

export function generateSlots(): PlacementSlot[] {
  const slots: PlacementSlot[] = [];
  let index = 0;
  const rows = [-2, -1, 0, 1, 2];

  for (const rowOffset of rows) {
    const y = PLANET_Y + rowOffset * ROW_SPACING;
    if (y < 60 || y > CANVAS_HEIGHT - 60) continue;

    const isOddRow = ((rowOffset % 2) + 2) % 2 === 1;
    const startX = isOddRow ? HALF_COL : 0;

    let x = startX + 60;
    while (x <= MAX_X) {
      const dx = x - PLANET_X;
      const dy = y - PLANET_Y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > PLANET_EXCLUSION) {
        slots.push({ index, x, y, occupant: null });
        index++;
      }

      x += COL_SPACING;
    }
  }

  return slots;
}
