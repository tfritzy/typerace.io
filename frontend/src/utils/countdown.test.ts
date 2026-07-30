import { describe, expect, it } from "vitest";
import { getCountdownStep } from "./countdown";

describe("getCountdownStep", () => {
  it.each([
    [4_000, 4, 1_000],
    [3_001, 4, 1],
    [3_000, 3, 1_000],
    [2_001, 3, 1],
    [2_000, 2, 1_000],
    [1_001, 2, 1],
    [1_000, 1, 1_000],
    [1, 1, 1],
  ])(
    "shows %i at %ims remaining and advances after %ims",
    (remainingMs, count, delayMs) => {
      expect(getCountdownStep(remainingMs)).toEqual({
        count,
        delayMs,
        complete: false,
      });
    },
  );

  it("skips any partial initial number", () => {
    expect(getCountdownStep(3_800, true)).toEqual({
      count: null,
      delayMs: 800,
      complete: false,
    });
    expect(getCountdownStep(3_801, true)).toEqual({
      count: null,
      delayMs: 801,
      complete: false,
    });
    const almostWholeSecond = getCountdownStep(3_999.99, true);
    expect(almostWholeSecond).toMatchObject({
      count: null,
      complete: false,
    });
    expect(almostWholeSecond.delayMs).toBeCloseTo(999.99);
  });

  it("shows an initial number only on a whole-second boundary", () => {
    expect(getCountdownStep(4_000, true)).toEqual({
      count: 4,
      delayMs: 1_000,
      complete: false,
    });
    expect(getCountdownStep(1_000, true)).toEqual({
      count: 1,
      delayMs: 1_000,
      complete: false,
    });
  });

  it.each([0, -1, -1_000])("is complete at %ims", (remainingMs) => {
    expect(getCountdownStep(remainingMs)).toEqual({
      count: null,
      delayMs: 0,
      complete: true,
    });
  });
});
