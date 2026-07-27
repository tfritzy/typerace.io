import type { PlayerProgress } from "../types/stdb";
import { decodeCharacterHistory } from "./wpmCalculator";

export type ReplayEvent = {
  elapsedMs: number;
  playerId: string;
  eventIndex: number;
  eventType: "Correct" | "Incorrect" | "Backspace";
};

export function buildReplayTimeline(
  players: PlayerProgress[],
  raceStartTimestamp: bigint,
): ReplayEvent[] {
  return players
    .flatMap((player) =>
      decodeCharacterHistory(
        player.characterHistory,
        raceStartTimestamp,
      ).map((event, eventIndex) => ({
        elapsedMs: Number(event.timestamp - raceStartTimestamp) / 1_000,
        playerId: player.playerId.toHexString(),
        eventIndex,
        eventType: event.eventType.tag,
      })),
    )
    .sort((a, b) => a.elapsedMs - b.elapsedMs);
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

  const incorrectCharacter = expectedCharacter === "×" ? "•" : "×";
  return input + incorrectCharacter;
}

export function getCorrectPrefixLength(input: string, phrase: string): number {
  let index = 0;
  while (index < input.length && input[index] === phrase[index]) index++;
  return index;
}
