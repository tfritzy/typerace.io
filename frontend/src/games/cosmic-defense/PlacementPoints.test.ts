import { describe, expect, it } from "vitest";
import {
  FRIENDLY_SLOT_CENTER_EXCLUSION_HALF_HEIGHT,
  SLOT_COUNT,
  generateSlots,
} from "./PlacementPoints";
import { PLANET_Y } from "./state";

describe("friendly placement slots", () => {
  it("keeps slots out of the center phrase lane", () => {
    const slots = generateSlots();
    expect(slots).toHaveLength(SLOT_COUNT);
    for (const slot of slots) {
      expect(Math.abs(slot.y - PLANET_Y)).toBeGreaterThanOrEqual(
        FRIENDLY_SLOT_CENTER_EXCLUSION_HALF_HEIGHT,
      );
    }
  });
});
