import { describe, expect, it } from "vitest";
import type { PlayerProgress } from "../types/stdb";
import {
  formatRaceResultForClipboard,
  getWordAccuracyBlocks,
} from "./raceResultShare";

const event = (type: 0 | 1 | 2): number[] => [0, 0, type];

describe("getWordAccuracyBlocks", () => {
  it("colors words by their error count", () => {
    const history = new Uint8Array([
      ...event(0),
      ...event(0),
      ...event(1),
      ...event(2),
      ...event(0),
      ...event(0),
      ...event(1),
      ...event(2),
      ...event(1),
      ...event(2),
      ...event(0),
      ...event(0),
      ...event(1),
      ...event(2),
      ...event(1),
      ...event(2),
      ...event(1),
      ...event(2),
      ...event(0),
    ]);

    expect(getWordAccuracyBlocks("a b c d", history)).toBe("🟩 🟨 🟧 🟥");
  });

  it("wraps the accuracy blocks after every eight words", () => {
    const phrase = Array(9).fill("a").join(" ");
    const history = new Uint8Array(
      Array.from({ length: phrase.length }, () => event(0)).flat(),
    );

    expect(getWordAccuracyBlocks(phrase, history)).toBe(
      "🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩\n🟩",
    );
  });
});

describe("formatRaceResultForClipboard", () => {
  it("formats a compact daily-game-style result with placement", () => {
    const playerProgress = {
      placement: 1,
      progressIndex: 7,
      time: 74_039_000n,
      characterHistory: new Uint8Array([
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
      ]),
    } as PlayerProgress;

    expect(
      formatRaceResultForClipboard({
        playerProgress,
        raceStartTimestamp: 0n,
        phrase: "cat dog",
        modeTag: "English500",
      }),
    ).toBe(
      [
        "🏆 1st place",
        "⚡ 1 wpm",
        "🏹 100% accuracy",
        "⏱️ 01:14.03",
        "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F} 2 words",
        "",
        "🟩 🟩",
        "",
        "https://typerace.io",
      ].join("\n"),
    );
  });

  it("uses the language flag and word count for quotes", () => {
    const playerProgress = {
      placement: 1,
      progressIndex: 7,
      time: 1_000_000n,
      characterHistory: new Uint8Array([
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
        ...event(0),
      ]),
    } as PlayerProgress;

    const result = formatRaceResultForClipboard({
      playerProgress,
      raceStartTimestamp: 0n,
      phrase: "Be kind",
      modeTag: "EnglishQuotes",
    });

    expect(result).not.toContain("⌨️ typerace.io");
    expect(result).toContain("🏆 1st place\n");
    expect(result).toContain(
      "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F} 2 words",
    );
  });
});
