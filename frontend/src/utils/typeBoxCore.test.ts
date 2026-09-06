import { describe, expect, it, vi } from "vitest";
import {
  analyzeTypeBoxInput,
  getCompletedWordCount,
  getWordCount,
  processTypeBoxChange,
  type TypeBoxProgressEventType,
} from "./typeBoxCore";

type ProgressEvent = {
  progressIndex: number;
  eventType: TypeBoxProgressEventType;
};

function processChange(
  phrase: string,
  previousValue: string,
  rawValue: string,
  allowedErrors: number,
) {
  const progressEvents: ProgressEvent[] = [];
  const result = processTypeBoxChange(
    phrase,
    previousValue,
    rawValue,
    allowedErrors,
    (progressIndex, eventType) => {
      progressEvents.push({ progressIndex, eventType });
    },
  );
  return { ...result, progressEvents };
}

describe("word progress", () => {
  it("counts words from completed boundaries", () => {
    const phrase = "hello world";

    expect(getWordCount(phrase)).toBe(2);
    expect(getCompletedWordCount(phrase, 0)).toBe(0);
    expect(getCompletedWordCount(phrase, 6)).toBe(1);
    expect(getCompletedWordCount(phrase, 11)).toBe(2);
  });
});

describe("allowed errors", () => {
  it("preserves analysis while incrementally appending characters", () => {
    const inputs = [
      "",
      "o",
      "ox",
      "oxe",
      "oxe ",
      "oxe t",
      "oxe tx",
      "oxe txo",
      "oxe txo!",
    ];
    const analyses = inputs.map((input) =>
      analyzeTypeBoxInput("one two", input, 1),
    );

    expect(analyses[4]).toEqual({
      completedThrough: 4,
      errorsUsed: 1,
      errorsToFix: 0,
      requiresFixes: false,
      canComplete: false,
      reportedProgress: 4,
    });
    expect(analyses[7]).toEqual({
      completedThrough: 4,
      errorsUsed: 1,
      errorsToFix: 1,
      requiresFixes: true,
      canComplete: false,
      reportedProgress: 5,
    });
    expect(analyses[8]).toEqual({
      completedThrough: 4,
      errorsUsed: 1,
      errorsToFix: 2,
      requiresFixes: true,
      canComplete: false,
      reportedProgress: 5,
    });
  });

  it("keeps errors pending, ignores corrected errors, and commits at later boundaries", () => {
    const pending = processChange("hello world", "hexl", "hexlo", 2);
    expect(pending).toMatchObject({
      value: "hexlo",
      completedThrough: 0,
      requiresFixes: false,
    });

    expect(analyzeTypeBoxInput("hello world", "hexlo ", 2)).toMatchObject({
      completedThrough: 6,
      errorsUsed: 1,
      errorsToFix: 0,
    });
    expect(analyzeTypeBoxInput("hello world", "hello ", 2)).toMatchObject({
      completedThrough: 6,
      errorsUsed: 0,
    });
    expect(analyzeTypeBoxInput("one two three", "onextwo ", 1)).toMatchObject({
      completedThrough: 8,
      errorsUsed: 1,
    });
  });

  it("accepts forward input while requiring fixes and capping earned progress", () => {
    const boundary = processChange("hello world", "hxxlo", "hxxlo ", 1);
    const continued = processChange(
      "hello world",
      boundary.value,
      "hxxlo w",
      1,
    );
    const replacementBackspaces = processChange(
      "hello world",
      "hxxl",
      "hx",
      1,
    );

    expect(boundary).toMatchObject({
      value: "hxxlo ",
      completedThrough: 0,
      requiresFixes: true,
    });
    expect(boundary.progressEvents.at(-1)?.progressIndex).toBe(2);
    expect(continued).toMatchObject({
      value: "hxxlo w",
      requiresFixes: true,
    });
    expect(continued.progressEvents.at(-1)?.progressIndex).toBe(2);
    expect(replacementBackspaces.progressEvents).toEqual([
      { progressIndex: 2, eventType: "Backspace" },
      { progressIndex: 2, eventType: "Backspace" },
    ]);
  });

  it("protects completed words while preserving replacement progress events", () => {
    const protectedPrefix = processChange(
      "hello world",
      "hexlo w",
      "hexl",
      1,
    );
    const onProgress = vi.fn();
    processTypeBoxChange("hello world", "hexlo", "hello", 1, onProgress);

    expect(protectedPrefix).toMatchObject({
      inputCorrection: "hexlo ",
      value: "hexlo ",
      completedThrough: 6,
    });
    expect(onProgress.mock.calls).toEqual([
      [4, "Backspace"],
      [3, "Backspace"],
      [2, "Backspace"],
      [3, "Correct"],
      [4, "Correct"],
      [5, "Correct"],
    ]);
  });

  it("applies the allowance to final-word completion", () => {
    const allowed = processChange("hello", "hell", "hellx", 1);
    const rejected = processChange("hello", "helx", "helxx", 1);

    expect(allowed).toMatchObject({
      completedThrough: 5,
      requiresFixes: false,
      canComplete: true,
    });
    expect(rejected).toMatchObject({
      completedThrough: 0,
      requiresFixes: true,
      canComplete: false,
    });
    expect(rejected.progressEvents.at(-1)).toEqual({
      progressIndex: 4,
      eventType: "Incorrect",
    });
  });
});
