import { describe, expect, it } from "vitest";
import { CharacterEventType } from "./wpmCalculator";
import { reconstructInputFromHistory } from "./replayTimeline";

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
