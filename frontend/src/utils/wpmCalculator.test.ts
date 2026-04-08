import { describe, it, expect } from "vitest";
import {
  CharacterEventType,
  getWpm,
  getRawWpmBySecond,
  getAggWpmBySecond,
  getAccuracy,
  getErrorCountsBySecond,
} from "./wpmCalculator";

const RACE_START = 0n;
const C = CharacterEventType.Correct;
const I = CharacterEventType.Incorrect;
const B = CharacterEventType.Backspace;

function encodeEvent(deciseconds: number, type: CharacterEventType): number[] {
  return [deciseconds & 0xff, (deciseconds >> 8) & 0xff, type];
}

function buildHistory(...events: [number, CharacterEventType][]): Uint8Array {
  return new Uint8Array(events.flatMap(([ds, type]) => encodeEvent(ds, type)));
}

describe("getWpm", () => {
  it("computes words per minute from character count and time", () => {
    expect(getWpm(5, 1)).toBe(60);
    expect(getWpm(50, 10)).toBe(60);
    expect(getWpm(10, 1)).toBe(120);
    expect(getWpm(0, 5)).toBe(0);
    expect(getWpm(10, 0)).toBe(0);
  });
});

describe("steady 60 WPM typist — 42 chars over 8.4s, no errors", () => {
  const history = buildHistory(
    ...Array.from(
      { length: 42 },
      (_, i): [number, CharacterEventType] => [(i + 1) * 2, C]
    )
  );

  it("raw WPM holds steady around 60, no trailing dip", () => {
    const raw = getRawWpmBySecond(history, RACE_START);
    expect(raw).toEqual([56, 57, 57.6, 60, 60, 60, 60, 60]);
  });

  it("aggregate WPM is exactly 60 at every full second", () => {
    const agg = getAggWpmBySecond(history, RACE_START);
    expect(agg).toEqual([0, 60, 60, 60, 60, 60, 60, 60, 60]);
  });

  it("accuracy is 100% with no errors", () => {
    expect(getAccuracy(history, RACE_START)).toBe(100);
  });

  it("error counts are empty", () => {
    expect(getErrorCountsBySecond(history, RACE_START)).toEqual([]);
  });
});

describe("~85 WPM typist — 48 net chars over 6.8s, two corrected typos", () => {
  const history = buildHistory(
    [1, C],  [2, C],  [4, C],  [5, C],  [6, C],  [7, C],  [9, C],
    [10, C], [11, C], [13, I], [14, B], [16, C], [17, C], [18, C], [19, C],
    [21, C], [22, C], [23, C], [25, C], [26, C], [27, C], [29, C],
    [30, C], [31, C], [32, C], [33, C], [35, C], [36, C], [37, C], [38, C], [39, C],
    [40, C], [42, C], [43, I], [44, B], [46, C], [47, C], [49, C],
    [50, C], [51, C], [53, C], [54, C], [55, C], [57, C], [58, C], [59, C],
    [61, C], [62, C], [63, C], [64, C], [66, C], [68, C],
  );

  it("raw WPM reflects per-second variation, partial bucket dropped", () => {
    const raw = getRawWpmBySecond(history, RACE_START);
    expect(raw).toEqual([84, 90, 86.4, 88.8, 90, 92]);
  });

  it("aggregate WPM converges toward ~84", () => {
    const agg = getAggWpmBySecond(history, RACE_START);
    expect(agg).toEqual([0, 96, 78, 84, 90, 84, 84]);
  });

  it("accuracy accounts for incorrect keystrokes and backspaces", () => {
    expect(getAccuracy(history, RACE_START)).toBeCloseTo(92.31, 1);
  });

  it("error counts show one error in second 1 and one in second 4", () => {
    expect(getErrorCountsBySecond(history, RACE_START)).toEqual([0, 1, 0, 0, 1]);
  });
});
