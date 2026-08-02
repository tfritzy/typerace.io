import { describe, expect, it } from "vitest";
import { alignToClosestTargetPrefix } from "./levenshteinAlignment";

describe("alignToClosestTargetPrefix", () => {
  it("aligns extra source characters to deletions", () => {
    expect(alignToClosestTargetPrefix("heyllo", "hello ")).toEqual([
      { type: "Match", sourceIndex: 0, targetIndex: 0 },
      { type: "Match", sourceIndex: 1, targetIndex: 1 },
      { type: "Delete", sourceIndex: 2 },
      { type: "Match", sourceIndex: 3, targetIndex: 2 },
      { type: "Match", sourceIndex: 4, targetIndex: 3 },
      { type: "Match", sourceIndex: 5, targetIndex: 4 },
    ]);
  });

  it("aligns missing source characters to insertions", () => {
    expect(alignToClosestTargetPrefix("helo w", "hello w")).toContainEqual(
      { type: "Insert", targetIndex: 2 },
    );
  });

  it("prefers the longest target prefix when edit distances tie", () => {
    expect(alignToClosestTargetPrefix("hellx", "hello").at(-1)).toEqual({
      type: "Replace",
      sourceIndex: 4,
      targetIndex: 4,
    });
  });
});
