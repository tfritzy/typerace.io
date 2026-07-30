import { describe, expect, it } from "vitest";
import {
  getLanguageFromMode,
  getWordModeTag,
  Language,
  WORD_COUNT_BUCKETS,
} from "./modes";

describe("word-count game modes", () => {
  it("builds each explicit word-count bucket without the list-size suffix", () => {
    expect(
      WORD_COUNT_BUCKETS.map((count) => getWordModeTag(Language.English, count)),
    ).toEqual(["English10", "English15", "English20", "English25"]);
  });

  it("recognizes explicit and legacy word modes as the same language", () => {
    expect(getLanguageFromMode("Ukrainian20")).toBe(Language.Ukrainian);
    expect(getLanguageFromMode("Ukrainian500")).toBe(Language.Ukrainian);
  });
});
