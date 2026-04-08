import { describe, it, expect } from "vitest";
import {
  CharacterEventType,
  decodeCharacterHistory,
  getWpm,
  getRawWpmBySecond,
  getAggWpmBySecond,
  getAccuracy,
  getErrorCountsBySecond,
} from "./wpmCalculator";

const RACE_START = 0n;

function encodeEvent(deciseconds: number, type: CharacterEventType): number[] {
  return [deciseconds & 0xff, (deciseconds >> 8) & 0xff, type];
}

function buildHistory(...events: number[][]): Uint8Array {
  return new Uint8Array(events.flat());
}

function steadyTypingHistory(
  charsPerSecond: number,
  durationSeconds: number
): Uint8Array {
  const interval = 1 / charsPerSecond;
  const events: number[][] = [];
  for (let t = interval; t <= durationSeconds; t += interval) {
    const ds = Math.round(t * 10);
    events.push(encodeEvent(ds, CharacterEventType.Correct));
  }
  return buildHistory(...events);
}

describe("decodeCharacterHistory", () => {
  it("decodes correct, incorrect, and backspace events", () => {
    const history = buildHistory(
      encodeEvent(10, CharacterEventType.Correct),
      encodeEvent(20, CharacterEventType.Incorrect),
      encodeEvent(30, CharacterEventType.Backspace)
    );
    const events = decodeCharacterHistory(history, RACE_START);

    expect(events).toHaveLength(3);
    expect(events[0].eventType.tag).toBe("Correct");
    expect(events[1].eventType.tag).toBe("Incorrect");
    expect(events[2].eventType.tag).toBe("Backspace");
  });

  it("computes timestamps from deciseconds", () => {
    const history = buildHistory(encodeEvent(15, CharacterEventType.Correct));
    const events = decodeCharacterHistory(history, 1000n);

    expect(events[0].timestamp).toBe(1000n + 15n * 100_000n);
  });

  it("returns empty array for empty input", () => {
    expect(decodeCharacterHistory(new Uint8Array(), RACE_START)).toEqual([]);
  });

  it("ignores trailing bytes that don't form a complete event", () => {
    const history = new Uint8Array([10, 0, 0, 99, 99]);
    const events = decodeCharacterHistory(history, RACE_START);
    expect(events).toHaveLength(1);
  });
});

describe("getWpm", () => {
  it("returns 0 for zero time", () => {
    expect(getWpm(10, 0)).toBe(0);
  });

  it("returns 0 for negative time", () => {
    expect(getWpm(10, -1)).toBe(0);
  });

  it("computes 60 WPM for 5 chars in 1 second", () => {
    expect(getWpm(5, 1)).toBe(60);
  });

  it("computes 120 WPM for 10 chars in 1 second", () => {
    expect(getWpm(10, 1)).toBe(120);
  });

  it("computes correctly over longer periods", () => {
    expect(getWpm(50, 10)).toBe(60);
  });
});

describe("getRawWpmBySecond", () => {
  it("returns empty array for empty history", () => {
    expect(getRawWpmBySecond(new Uint8Array(), RACE_START)).toEqual([]);
  });

  it("returns empty array for backspace-only history", () => {
    const history = buildHistory(
      encodeEvent(5, CharacterEventType.Backspace),
      encodeEvent(15, CharacterEventType.Backspace)
    );
    expect(getRawWpmBySecond(history, RACE_START)).toEqual([]);
  });

  it("produces consistent values for steady typing", () => {
    const history = steadyTypingHistory(5, 5.0);
    const result = getRawWpmBySecond(history, RACE_START);

    for (const wpm of result) {
      expect(wpm).toBeGreaterThan(0);
    }

    const maxDrift = Math.max(...result) - Math.min(...result);
    expect(maxDrift).toBeLessThan(20);
  });

  it("does not trail off at the end for a partial last second", () => {
    const history = steadyTypingHistory(5, 7.3);
    const result = getRawWpmBySecond(history, RACE_START);

    const lastThree = result.slice(-3);
    const firstThree = result.slice(0, 3);
    const avgEnd = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    const avgStart = firstThree.reduce((a, b) => a + b, 0) / firstThree.length;

    expect(avgEnd).toBeGreaterThan(avgStart * 0.7);
  });

  it("drops the incomplete last-second bucket", () => {
    const history = buildHistory(
      ...Array.from({ length: 5 }, (_, i) =>
        encodeEvent(i * 2, CharacterEventType.Correct)
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        encodeEvent(10 + i * 2, CharacterEventType.Correct)
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        encodeEvent(20 + i * 2, CharacterEventType.Correct)
      )
    );

    const result = getRawWpmBySecond(history, RACE_START);
    expect(result.length).toBe(2);
  });

  it("keeps single bucket for short races", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(3, CharacterEventType.Correct),
      encodeEvent(5, CharacterEventType.Correct)
    );
    const result = getRawWpmBySecond(history, RACE_START);
    expect(result.length).toBe(1);
    expect(result[0]).toBeGreaterThan(0);
  });

  it("ignores backspace events in character counts", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct),
      encodeEvent(3, CharacterEventType.Backspace),
      encodeEvent(4, CharacterEventType.Correct),
      encodeEvent(5, CharacterEventType.Correct),
      encodeEvent(6, CharacterEventType.Correct)
    );
    const result = getRawWpmBySecond(history, RACE_START);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(getWpm(5, 1));
  });

  it("applies smoothing across second boundaries", () => {
    const events: number[][] = [];
    for (let s = 0; s < 5; s++) {
      for (let c = 0; c < 10; c++) {
        events.push(encodeEvent(s * 10 + c, CharacterEventType.Correct));
      }
    }
    const history = buildHistory(...events);
    const result = getRawWpmBySecond(history, RACE_START);

    expect(result[0]).toBe(result[1]);
    expect(result[1]).toBe(result[2]);
  });
});

describe("getAggWpmBySecond", () => {
  it("returns empty array for empty history", () => {
    expect(getAggWpmBySecond(new Uint8Array(), RACE_START)).toEqual([]);
  });

  it("returns zero for second 0", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct),
      encodeEvent(15, CharacterEventType.Correct)
    );
    const result = getAggWpmBySecond(history, RACE_START);
    expect(result[0]).toBe(0);
  });

  it("accumulates characters over time", () => {
    const history = steadyTypingHistory(5, 4.0);
    const result = getAggWpmBySecond(history, RACE_START);

    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(0);
    }
  });

  it("converges toward true WPM for steady typing", () => {
    const history = steadyTypingHistory(5, 10.0);
    const result = getAggWpmBySecond(history, RACE_START);

    const lastValue = result[result.length - 1];
    expect(lastValue).toBeGreaterThan(50);
    expect(lastValue).toBeLessThan(70);
  });

  it("accounts for backspaces by reducing net progress", () => {
    const withBackspaces = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct),
      encodeEvent(3, CharacterEventType.Correct),
      encodeEvent(4, CharacterEventType.Backspace),
      encodeEvent(15, CharacterEventType.Correct)
    );
    const withoutBackspaces = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct),
      encodeEvent(15, CharacterEventType.Correct)
    );

    const resultWith = getAggWpmBySecond(withBackspaces, RACE_START);
    const resultWithout = getAggWpmBySecond(withoutBackspaces, RACE_START);

    expect(resultWith).toEqual(resultWithout);
  });

  it("returns empty array for all-backspace history", () => {
    const history = buildHistory(
      encodeEvent(5, CharacterEventType.Backspace),
      encodeEvent(10, CharacterEventType.Backspace)
    );
    expect(getAggWpmBySecond(history, RACE_START)).toEqual([]);
  });
});

describe("getAccuracy", () => {
  it("returns 0 for empty history", () => {
    expect(getAccuracy(new Uint8Array(), RACE_START)).toBe(0);
  });

  it("returns 100 for all correct", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct),
      encodeEvent(3, CharacterEventType.Correct)
    );
    expect(getAccuracy(history, RACE_START)).toBe(100);
  });

  it("counts incorrect and backspace as total keystrokes", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Incorrect),
      encodeEvent(3, CharacterEventType.Backspace),
      encodeEvent(4, CharacterEventType.Correct)
    );
    expect(getAccuracy(history, RACE_START)).toBe(50);
  });

  it("returns 0 when all keystrokes are errors", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Incorrect),
      encodeEvent(2, CharacterEventType.Backspace)
    );
    expect(getAccuracy(history, RACE_START)).toBe(0);
  });
});

describe("getErrorCountsBySecond", () => {
  it("returns empty array for empty history", () => {
    expect(getErrorCountsBySecond(new Uint8Array(), RACE_START)).toEqual([]);
  });

  it("returns empty array when there are no errors", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Correct)
    );
    expect(getErrorCountsBySecond(history, RACE_START)).toEqual([]);
  });

  it("counts errors per second bucket", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Incorrect),
      encodeEvent(3, CharacterEventType.Incorrect),
      encodeEvent(15, CharacterEventType.Incorrect)
    );
    const result = getErrorCountsBySecond(history, RACE_START);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(1);
  });

  it("ignores correct and backspace events", () => {
    const history = buildHistory(
      encodeEvent(1, CharacterEventType.Correct),
      encodeEvent(2, CharacterEventType.Backspace),
      encodeEvent(3, CharacterEventType.Incorrect)
    );
    const result = getErrorCountsBySecond(history, RACE_START);
    expect(result[0]).toBe(1);
  });
});
