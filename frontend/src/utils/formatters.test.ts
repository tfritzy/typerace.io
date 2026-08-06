import { describe, expect, it } from "vitest";
import { getOrdinalPlacement } from "./formatters";

describe("getOrdinalPlacement", () => {
  it("renders an unplaced result as a dash", () => {
    expect(getOrdinalPlacement(-1)).toBe("-");
  });

  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [11, "11th"],
    [22, "22nd"],
  ])("formats %i as %s", (placement, expected) => {
    expect(getOrdinalPlacement(placement)).toBe(expected);
  });
});
