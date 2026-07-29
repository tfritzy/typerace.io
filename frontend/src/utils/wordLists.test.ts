import { describe, expect, it } from "vitest";
import { getWordList } from "./wordLists";

describe("Turkish word list", () => {
  it("does not include an extra combining dot above after lowercase i", () => {
    const wordsWithCombiningDots = getWordList("tr").filter((word) =>
      word.includes("\u0307"),
    );

    expect(wordsWithCombiningDots).toEqual([]);
    expect(getWordList("tr")).toContain("ilk");
  });
});
