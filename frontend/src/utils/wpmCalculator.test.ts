import { describe, expect, it } from "vitest";
import {
  type CharacterEvent,
  decodeCharacterHistory,
  getAccuracy,
  getErrorCountsBySecond,
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

  it("keeps calculating after allowed errors in a production race", () => {
    // https://typerace.io/game/game_07EdDHCPY9h5
    const encodedHistory = Uint8Array.from(
      "0200000300000400000500000600000800011000001300001300001400001500001600001700001800001900001900001a00001d00001d00001f00002000002100002200002300002500002500002600002700002800002900002900002b00002c00002e00002f00003000003100003200003300013900003b00003c00003d00003f00004000004100014600024c00004d00004e00004f00005000005100005200005300005400005500005600005700005800005800005900005a00005a00005c00005e00005f00006000006100006300006300006500006600006600006800006900006a0000"
        .match(/../g)!
        .map((byte) => Number.parseInt(byte, 16)),
    );
    const history = decodeCharacterHistory(encodedHistory, raceStartTimestamp);
    const wpms = getWpmPerKeystroke(history, raceStartTimestamp);
    const buckets = getWpmByBucket(history, raceStartTimestamp, 33);

    expect(history).toHaveLength(77);
    expect(wpms[6][0]).toBe(1.6);
    expect(wpms[6][1]).toBeCloseTo(52.5);
    expect(wpms.at(-1)![0]).toBe(10.6);
    expect(wpms.at(-1)![1]).toBeCloseTo(75 / 5 / (10.6 / 60));
    expect(buckets).toHaveLength(33);
    expect(buckets.at(-1)).toBeCloseTo(75 / 5 / (10.6 / 60));
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
    expect(wpms[3]).toBe(16.6);
    expect(wpms[4]).toBeCloseTo(15.2);
    expect(wpms[5]).toBeCloseTo(13.8);
    expect(wpms[6]).toBeCloseTo(12.4);
    expect(wpms[7]).toBeCloseTo(11);
    expect(wpms[8]).toBeCloseTo(9.6);
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

describe("compressed history summaries", () => {
  it("calculates accuracy without materializing decoded events", () => {
    const history = new Uint8Array([
      10, 0, 0,
      11, 0, 1,
      12, 0, 2,
      13, 0, 0,
    ]);

    expect(getAccuracy(history, raceStartTimestamp)).toBe(50);
  });

  it("buckets encoded errors directly by second", () => {
    const history = new Uint8Array([
      9, 0, 1,
      10, 0, 1,
      15, 0, 0,
      21, 0, 1,
    ]);

    expect(getErrorCountsBySecond(history, raceStartTimestamp)).toEqual([
      1, 1, 1,
    ]);
  });
});
