import { describe, expect, it } from "vitest";
import { getPhraseLength } from "./phrase";

describe("getPhraseLength", () => {
  it("counts whitespace-delimited words", () => {
    expect(getPhraseLength("one two   three\nfour")).toBe(4);
  });

  it("counts characters when the phrase has no whitespace", () => {
    expect(getPhraseLength("日本語")).toBe(3);
  });

  it("ignores surrounding whitespace", () => {
    expect(getPhraseLength("  one two  ")).toBe(2);
    expect(getPhraseLength("   ")).toBe(0);
  });
});
