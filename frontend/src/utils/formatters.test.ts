import { describe, expect, it } from "vitest";
import { formatShareTime, getOrdinalPlacement } from "./formatters";

describe("formatShareTime", () => {
  it.each([
    [0, "00:00.00"],
    [1.009, "00:01.00"],
    [4.709, "00:04.70"],
    [59.999, "00:59.99"],
    [60, "01:00.00"],
    [74.039, "01:14.03"],
    [3_661.5, "61:01.50"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatShareTime(seconds)).toBe(expected);
  });
});

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
