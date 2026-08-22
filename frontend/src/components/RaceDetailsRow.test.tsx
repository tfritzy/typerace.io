import { describe, expect, it } from "vitest";
import { getPhraseWordCount } from "./RaceDetailsRow";

describe("getPhraseWordCount", () => {
  it("counts whitespace-separated words", () => {
    expect(getPhraseWordCount("one two   three\nfour")).toBe(4);
  });

  it("counts characters for phrases without spaces", () => {
    expect(getPhraseWordCount("日本語")).toBe(3);
  });

  it("ignores surrounding whitespace", () => {
    expect(getPhraseWordCount("  one two  ")).toBe(2);
    expect(getPhraseWordCount("   ")).toBe(0);
  });
});
