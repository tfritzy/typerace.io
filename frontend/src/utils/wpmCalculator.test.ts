import { describe, expect, it } from "vitest";
import {
  type CharacterEvent,
  getRawWpmByBucket,
  getWpmByBucket,
  getWpmPerKeystroke,
} from "./wpmCalculator";

const raceStartTimestamp = 0n;

function event(
  seconds: number,
  tag: CharacterEvent["eventType"]["tag"],
): CharacterEvent {
  return {
    timestamp: BigInt(Math.round(seconds * 1_000_000)),
    eventType: { tag },
  };
}

describe("getWpmPerKeystroke", () => {
  it("tracks correct characters through errors and backspaces", () => {
    const history = [
      event(1, "Correct"),
      event(1.1, "Correct"),
      event(1.2, "Incorrect"),
      event(1.3, "Correct"),
      event(1.4, "Backspace"),
      event(1.5, "Backspace"),
      event(1.6, "Correct"),
    ];

    expect(getWpmPerKeystroke(history, raceStartTimestamp)).toHaveLength(7);
  });
});

describe("getWpmByBucket", () => {
  it("interpolates cumulative WPM into evenly spaced buckets", () => {
    const history = [
      event(1, "Correct"),
      event(1.5, "Correct"),
      event(2, "Correct"),
      event(5, "Incorrect"),
    ];

    const wpms = getWpmByBucket(history, raceStartTimestamp, 9);

    expect(wpms).toHaveLength(9);
    expect(wpms[0]).toBe(12);
    expect(wpms[1]).toBe(16);
    expect(wpms[2]).toBe(18);
    expect(wpms[3]).toBe(16.2);
    expect(wpms[4]).toBe(14.4);
    expect(wpms[5]).toBe(12.6);
    expect(wpms[6]).toBe(10.8);
    expect(wpms[7]).toBeCloseTo(9, 1);
    expect(wpms[8]).toBeCloseTo(7.2, 1);
  });

  it("handles a single keystroke", () => {
    expect(
      getWpmByBucket(
        [event(1, "Correct")],
        raceStartTimestamp,
        1,
      ),
    ).toEqual([12]);
  });
});

describe("getRawWpmByBucket", () => {
  it("lightly smooths local speed across neighboring buckets", () => {
    const history = [
      event(1, "Correct"),
      event(2, "Incorrect"),
      event(3, "Backspace"),
      event(4, "Correct"),
    ];

    expect(getRawWpmByBucket(history, raceStartTimestamp, 4)).toEqual([
      12, 8, 8, 6,
    ]);
  });
});
