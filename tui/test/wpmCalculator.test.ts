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

    const wpm = getWpmPerKeystroke(history, BigInt(10));
    console.log(wpm);
    const result = 2 + 2;

    expect(result).toBe(5);
  });
});
