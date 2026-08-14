import { describe, expect, it } from "vitest";
import {
  buildLanguagePersonalRecords,
  buildProfileModeOptions,
  filterProfileGameRecords,
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
) => ({
  gameMode: { tag: mode } as never,
  gameRecordId,
  phraseLength,
  wpm,
});

describe("buildLanguagePersonalRecords", () => {
  it("uses personal-record rows for the four game lengths", () => {
    const groups = buildLanguagePersonalRecords(
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

    expect(groups).toEqual([
      {
        language: "English",
        raceCount: 10,
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
      },
    ]);
  });

  it("groups modes under the language name and keeps the best record per length", () => {
    const groups = buildLanguagePersonalRecords(
      [
        record("Spanish500", 16, 80, "words"),
        record("SpanishQuotes", 16, 88, "quote"),
      ],
      [
        race("Spanish500", "words", 91),
        race("SpanishQuotes", "quote", 97),
      ],
      1,
    );

    expect(groups[0].language).toBe("Spanish");
    expect(groups[0].slots[2]).toEqual({
      wordCount: 16,
      wpm: 88,
      accuracy: 97,
      gameId: "game-quote",
    });
  });

  it("only promotes substantially played languages", () => {
    const groups = buildLanguagePersonalRecords(
      [record("French500", 8, 70, "french")],
      [
        race("French500", "french"),
        ...Array.from({ length: 9 }, () => race("French500")),
        ...Array.from({ length: 9 }, () => race("German500")),
      ],
    );

    expect(groups.map((group) => group.language)).toEqual(["French"]);
  });

  it("does not count the same subscribed race twice", () => {
    const duplicatedRace = race("English500", "duplicate");
    const groups = buildLanguagePersonalRecords(
      [],
      Array.from({ length: 10 }, () => duplicatedRace),
    );

    expect(groups).toEqual([]);
  });

  it("keeps a record visible when its matching race is unavailable", () => {
    const groups = buildLanguagePersonalRecords(
      [record("English500", 20, 110, "missing")],
      Array.from({ length: 10 }, () => race("English500")),
    );

    expect(groups[0].slots[3]).toEqual({
      wordCount: 20,
      wpm: 110,
      accuracy: null,
      gameId: null,
    });
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

  it("filters by mode and time frame, then sorts by pace", () => {
    const fast = activityRace("English500", 2, 10_000n);
    const slow = activityRace("English500", 3, 20_000n);
    const old = activityRace("English500", 10, 5_000n);
    const quotes = activityRace("EnglishQuotes", 1, 8_000n);

    expect(filterProfileGameRecords(
      [slow, old, quotes, fast],
      "English500",
      "week",
      nowMs,
    )).toEqual([fast, slow]);
  });
});
