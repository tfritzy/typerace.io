import type { PlayerProgress } from "../types/stdb";
import { CharacterEventType } from "./wpmCalculator";

const EVENT_SIZE_BYTES = 3;

export type ReplayEvent = {
  elapsedMs: number;
  playerId: string;
  eventIndex: number;
  eventType: "Correct" | "Incorrect" | "Backspace";
};

export function buildReplayTimeline(
  players: readonly PlayerProgress[],
  _raceStartTimestamp: bigint,
): ReplayEvent[] {
  let eventCount = 0;
  for (const player of players) {
    eventCount += Math.floor(player.characterHistory.length / EVENT_SIZE_BYTES);
  }

  const timeline = new Array<ReplayEvent>(eventCount);
  let timelineIndex = 0;

  for (const player of players) {
    const history = player.characterHistory;
    const playerId = player.playerId.toHexString();
    let eventIndex = 0;

    for (
      let offset = 0;
      offset + EVENT_SIZE_BYTES <= history.length;
      offset += EVENT_SIZE_BYTES
    ) {
      const deciseconds = history[offset] | (history[offset + 1] << 8);
      const encodedType = history[offset + 2];
      const eventType =
        encodedType === CharacterEventType.Incorrect
          ? "Incorrect"
          : encodedType === CharacterEventType.Backspace
            ? "Backspace"
            : "Correct";

      timeline[timelineIndex++] = {
        elapsedMs: deciseconds * 100,
        playerId,
        eventIndex: eventIndex++,
        eventType,
      };
    }
  }

  timeline.sort((a, b) => a.elapsedMs - b.elapsedMs);
  return timeline;
}

export function applyReplayEvent(
  input: string,
  phrase: string,
  eventType: ReplayEvent["eventType"],
): string {
  if (eventType === "Backspace") return input.slice(0, -1);
  if (input.length >= phrase.length) return input;

  const expectedCharacter = phrase[input.length];
  if (eventType === "Correct") return input + expectedCharacter;

  const incorrectCharacter = expectedCharacter === "x" ? "×" : "x";
  return input + incorrectCharacter;
}

export function reconstructInputFromHistory(
  phrase: string,
  history: Uint8Array,
  progressIndex: number,
): string {
  let input = "";

  for (
    let offset = 0;
    offset + EVENT_SIZE_BYTES <= history.length;
    offset += EVENT_SIZE_BYTES
  ) {
    const encodedType = history[offset + 2];
    const eventType: ReplayEvent["eventType"] =
      encodedType === CharacterEventType.Incorrect
        ? "Incorrect"
        : encodedType === CharacterEventType.Backspace
          ? "Backspace"
          : "Correct";
    input = applyReplayEvent(input, phrase, eventType);
  }

  const earnedLength = Math.min(
    phrase.length,
    Math.max(0, progressIndex),
  );
  return input.slice(0, earnedLength);
}
