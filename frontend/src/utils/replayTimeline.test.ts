import { describe, expect, it } from "vitest";
import type { PlayerProgress } from "../types/stdb";
import {
  applyReplayEvent,
  buildReplayTimeline,
  getCorrectPrefixLength,
} from "./replayTimeline";

describe("replayTimeline", () => {
  it("reconstructs correct, incorrect, and backspace events", () => {
    let input = "";
    input = applyReplayEvent(input, "cat", "Correct");
    input = applyReplayEvent(input, "cat", "Incorrect");
    input = applyReplayEvent(input, "cat", "Correct");

    expect(input).toBe("c×t");
    expect(getCorrectPrefixLength(input, "cat")).toBe(1);

    input = applyReplayEvent(input, "cat", "Backspace");
    input = applyReplayEvent(input, "cat", "Backspace");
    input = applyReplayEvent(input, "cat", "Correct");

    expect(input).toBe("ca");
    expect(getCorrectPrefixLength(input, "cat")).toBe(2);
  });

  it("combines player histories in timestamp order", () => {
    const makePlayer = (
      id: string,
      characterHistory: number[],
    ): PlayerProgress =>
      ({
        playerId: { toHexString: () => id },
        characterHistory: new Uint8Array(characterHistory),
      }) as PlayerProgress;

    const timeline = buildReplayTimeline(
      [
        makePlayer("one", [5, 0, 0]),
        makePlayer("two", [2, 0, 1]),
      ],
      1_000_000n,
    );

    expect(timeline).toEqual([
      {
        elapsedMs: 200,
        playerId: "two",
        eventIndex: 0,
        eventType: "Incorrect",
      },
      {
        elapsedMs: 500,
        playerId: "one",
        eventIndex: 0,
        eventType: "Correct",
      },
    ]);
  });
});
