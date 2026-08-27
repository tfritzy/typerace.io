import { describe, expect, it } from "vitest";
import { CharacterEventType } from "./wpmCalculator";
import {
  getReplayProgress,
  reconstructInputFromHistory,
} from "./replayTimeline";

function encodeHistory(events: CharacterEventType[]) {
  return new Uint8Array(
    events.flatMap((eventType) => [0, 0, eventType]),
  );
}

describe("reconstructInputFromHistory", () => {
  it("replays errors and corrections, then truncates to earned progress", () => {
    const history = encodeHistory([
      CharacterEventType.Correct,
      CharacterEventType.Incorrect,
      CharacterEventType.Backspace,
      CharacterEventType.Correct,
      CharacterEventType.Incorrect,
      CharacterEventType.Correct,
    ]);

    expect(reconstructInputFromHistory("hello", history, 3)).toBe("hex");
  });
});

describe("getReplayProgress", () => {
  it("reaches completion when an error is allowed", () => {
    expect(getReplayProgress("hxllo", "hello", 1)).toBe(5);
  });

  it("stops at an error when the allowance is exhausted", () => {
    expect(getReplayProgress("hxllo", "hello", 0)).toBe(1);
  });
});
