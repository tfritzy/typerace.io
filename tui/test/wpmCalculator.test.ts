// math.test.ts
import { describe, it, expect } from "vitest";
import {
  CharacterEvent,
  getWpmByBucket,
  getWpmPerKeystroke,
} from "../src/util/wpmCalculator";

const hexToUint8Array = (hex: bigint): Uint8Array => {
  let hexStr = hex.toString(16);
  if (hexStr.length % 2 !== 0) hexStr = "0" + hexStr;
  const bytes = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexStr.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

describe("getWpmPerKeystroke", () => {
  it("is approximately correct", () => {
    const history: CharacterEvent[] = [
      { timestamp_s: 1.0, eventType: { tag: "Correct" } },
      { timestamp_s: 1.1, eventType: { tag: "Correct" } },
      { timestamp_s: 1.2, eventType: { tag: "Incorrect" } },
      { timestamp_s: 1.3, eventType: { tag: "Correct" } },
      { timestamp_s: 1.4, eventType: { tag: "Backspace" } },
      { timestamp_s: 1.5, eventType: { tag: "Backspace" } },
      { timestamp_s: 1.6, eventType: { tag: "Correct" } },
    ];

    const wpm = getWpmPerKeystroke(history, 0.9);
    expect(wpm.length).to.equal(7);
  });
});

describe("getWpmByBucket", () => {
  it("is approximately correct", () => {
    const history: CharacterEvent[] = [
      { timestamp_s: 1, eventType: { tag: "Correct" } },
      { timestamp_s: 1.5, eventType: { tag: "Correct" } },
      { timestamp_s: 2, eventType: { tag: "Correct" } },
      { timestamp_s: 5, eventType: { tag: "Incorrect" } },
    ];

    const wpm = getWpmByBucket(history, 0, 9);

    // keystrokes: [[ 1, 12 ], [ 1.5, 16 ], [ 2, 18 ], [ 5, 7.2 ]]
    expect(wpm[0]).to.equal(12); // t = 1
    expect(wpm[1]).to.equal(16); // t = 1.5
    expect(wpm[2]).to.equal(18); // t = 2
    expect(wpm[3]).to.equal(16.2); // t = 2.5
    expect(wpm[4]).to.equal(14.4); // t = 3
    expect(wpm[5]).to.equal(12.6); // t = 3.5
    expect(wpm[6]).to.equal(10.8); // t = 4
    expect(wpm[7]).to.closeTo(8.9, 0.1); // t = 4.5
    expect(wpm[8]).to.closeTo(7.2, 0.1); // t = 5
    expect(wpm.length).to.equal(9);
  });
});
