import { describe, expect, it } from "vitest";
import {
  buildProfilePersonalRecords,
  buildProfileModeOptions,
  filterProfileGameRecords,
  getMostPlayedLanguage,
} from "./profileStats";

let nextRaceId = 0;
const race = (
  mode: string,
  id = `race-${nextRaceId++}`,
  accuracy = 95,
) => ({
  id,
  gameId: `game-${id}`,
  accuracy,
  gameMode: { tag: mode } as never,
});
const record = (
  mode: string,
  phraseLength: number | undefined,
  wpm: number,
  gameRecordId: string,
  gameId = `game-${gameRecordId}`,
  accuracy = 0,
) => ({
  accuracy,
  gameId,
  gameMode: { tag: mode } as never,
  gameRecordId,
  phraseLength,
  wpm,
});

describe("buildProfilePersonalRecords", () => {
  it("uses personal-record rows for the four game lengths", () => {
    const result = buildProfilePersonalRecords(
      [
        record("English500", 8, 82, "record-8"),
        record("English500", 12, 91, "record-12"),
        record("English500", undefined, 100, "overall"),
      ],
      [
        race("English500", "record-8", 94.2),
        race("English500", "record-12", 96.4),
        ...Array.from({ length: 8 }, () => race("English500")),
      ],
    );

    expect(result).toEqual({
      language: "English",
      slots: [
        {
          wordCount: 8,
          wpm: 82,
          accuracy: 94.2,
          gameId: "game-record-8",
        },
        {
          wordCount: 12,
          wpm: 91,
          accuracy: 96.4,
          gameId: "game-record-12",
        },
        { wordCount: 16, wpm: null, accuracy: null, gameId: null },
        { wordCount: 20, wpm: null, accuracy: null, gameId: null },
      ],
    });
  });

  it("groups modes under the language name and keeps the best record per length", () => {
    const result = buildProfilePersonalRecords(
      [
        record("Spanish500", 16, 80, "words"),
        record("SpanishQuotes", 16, 88, "quote"),
      ],
      [
        race("Spanish500", "words", 91),
        race("SpanishQuotes", "quote", 97),
      ],
    );

    expect(result.language).toBe("Spanish");
    expect(result.slots[2]).toEqual({
      wordCount: 16,
      wpm: 88,
      accuracy: 97,
      gameId: "game-quote",
    });
  });

  it("only shows the most-played language without a minimum", () => {
    const result = buildProfilePersonalRecords(
      [record("French500", 8, 70, "french")],
      [
        race("French500", "french"),
        race("French500"),
        race("German500"),
      ],
    );

    expect(result.language).toBe("French");
  });

  it("does not let duplicate subscribed races skew the language", () => {
    const duplicatedRace = race("Spanish500", "duplicate");
    const result = buildProfilePersonalRecords(
      [],
      [
        ...Array.from({ length: 10 }, () => duplicatedRace),
        race("English500"),
        race("EnglishQuotes"),
      ],
    );

    expect(result.language).toBe("English");
  });

  it("uses the personal record's game link when its race is unavailable", () => {
    const result = buildProfilePersonalRecords(
      [record("English500", 20, 110, "missing", "game-missing", 98.5)],
      Array.from({ length: 10 }, () => race("English500")),
    );

    expect(result.slots[3]).toEqual({
      wordCount: 20,
      wpm: 110,
      accuracy: 98.5,
      gameId: "game-missing",
    });
  });

  it("falls back to the matching race for records created before GameId", () => {
    const result = buildProfilePersonalRecords(
      [record("English500", 20, 110, "legacy", "")],
      [race("English500", "legacy")],
    );

    expect(result.slots[3].gameId).toBe("game-legacy");
  });

  it("returns empty slots when the player has not raced", () => {
    expect(buildProfilePersonalRecords([], [])).toEqual({
      language: null,
      slots: [
        { wordCount: 8, wpm: null, accuracy: null, gameId: null },
        { wordCount: 12, wpm: null, accuracy: null, gameId: null },
        { wordCount: 16, wpm: null, accuracy: null, gameId: null },
        { wordCount: 20, wpm: null, accuracy: null, gameId: null },
      ],
    });
  });
});

describe("getMostPlayedLanguage", () => {
  it("groups word and quote modes by language", () => {
    expect(getMostPlayedLanguage([
      race("Spanish500"),
      race("English500"),
      race("SpanishQuotes"),
    ])).toBe("Spanish");
  });

  it("returns no language when there are no races", () => {
    expect(getMostPlayedLanguage([])).toBeNull();
  });

  it("uses alphabetical order to break a tie", () => {
    expect(getMostPlayedLanguage([
      race("Spanish500"),
      race("EnglishQuotes"),
    ])).toBe("English");
  });
});

describe("profile activity filters", () => {
  const nowMs = Date.UTC(2026, 7, 14);
  const activityRace = (
    mode: string,
    ageInDays: number,
    timeMs: bigint,
  ) => ({
    gameMode: { tag: mode } as never,
    date: BigInt(nowMs - ageInDays * 24 * 60 * 60 * 1_000) * 1_000n,
    timeMs,
  });

  it("builds unique, human-readable mode options", () => {
    expect(buildProfileModeOptions([
      activityRace("SpanishQuotes", 0, 1n),
      activityRace("English500", 0, 1n),
      activityRace("English500", 0, 1n),
    ])).toEqual([
      { value: "English500", label: "English words" },
      { value: "SpanishQuotes", label: "Spanish quotes" },
    ]);
  });

  it("filters by mode and time frame without reordering races", () => {
    const fast = activityRace("English500", 2, 10_000n);
    const slow = activityRace("English500", 3, 20_000n);
    const old = activityRace("English500", 10, 5_000n);
    const quotes = activityRace("EnglishQuotes", 1, 8_000n);

    expect(filterProfileGameRecords(
      [slow, old, quotes, fast],
      "English500",
      "week",
      nowMs,
    )).toEqual([slow, fast]);
  });
});
