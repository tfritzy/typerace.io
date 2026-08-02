import { describe, expect, it } from "vitest";
import {
  getCompletedWordCount,
  getWordCount,
  processTypeBoxChange,
  type TypeBoxProgressEventType,
} from "./typeBoxCore";

type ProgressEvent = {
  correctCharCount: number;
  eventType: TypeBoxProgressEventType;
};

const processChange = ({
  phrase,
  previousValue,
  rawValue,
  autofixesRemaining,
}: {
  phrase: string;
  previousValue: string;
  rawValue: string;
  autofixesRemaining: number;
}) => {
  const events: ProgressEvent[] = [];
  const operationOrder: Array<"consume" | "progress"> = [];
  let autofixesConsumed = 0;
  const normalEventCount = Math.abs(rawValue.length - previousValue.length);
  const inputCorrection = processTypeBoxChange(
    phrase,
    previousValue,
    rawValue,
    autofixesRemaining,
    (correctCharCount, eventType) => {
      operationOrder.push("progress");
      events.push({ correctCharCount, eventType });
    },
    (count) => {
      operationOrder.push("consume");
      autofixesConsumed = count;
    },
  );

  return {
    inputCorrection,
    value: inputCorrection ?? rawValue,
    shouldSyncInput: inputCorrection !== null,
    progressEvents: events.slice(0, normalEventCount),
    autofixProgressEvents: events.slice(normalEventCount),
    autofixesConsumed,
    operationOrder,
  };
};

describe("word counts", () => {
  it("counts target words as their boundaries are crossed", () => {
    const phrase = "hello world";

    expect(getWordCount(phrase)).toBe(2);
    expect(getCompletedWordCount(phrase, 0)).toBe(0);
    expect(getCompletedWordCount(phrase, 5)).toBe(0);
    expect(getCompletedWordCount(phrase, 6)).toBe(1);
    expect(getCompletedWordCount(phrase, 11)).toBe(2);
  });
});

describe("processTypeBoxChange", () => {
  it("reports inserted progress and locks completed words", () => {
    const insert = processChange({
      phrase: "hello",
      previousValue: "",
      rawValue: "he",
      autofixesRemaining: 0,
    });
    const backspace = processChange({
      phrase: "hello world",
      previousValue: "hello w",
      rawValue: "hell",
      autofixesRemaining: 2,
    });

    expect(insert?.progressEvents).toEqual([
      { correctCharCount: 1, eventType: "Correct" },
      { correctCharCount: 2, eventType: "Correct" },
    ]);
    expect(insert.inputCorrection).toBeNull();
    expect(backspace).toMatchObject({
      value: "hello ",
      shouldSyncInput: true,
      progressEvents: [],
    });
  });

  it("spends the available balance on errors from left to right", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "hexxo",
      rawValue: "hexxo ",
      autofixesRemaining: 1,
    });

    expect(result).toMatchObject({
      value: "helxo ",
      shouldSyncInput: true,
      autofixesConsumed: 1,
      autofixProgressEvents: [
        { correctCharCount: 2, eventType: "Backspace" },
        { correctCharCount: 2, eventType: "Backspace" },
        { correctCharCount: 2, eventType: "Backspace" },
        { correctCharCount: 2, eventType: "Backspace" },
        { correctCharCount: 3, eventType: "Correct" },
        { correctCharCount: 3, eventType: "Incorrect" },
        { correctCharCount: 3, eventType: "Correct" },
        { correctCharCount: 3, eventType: "Correct" },
      ],
    });
    expect(result.operationOrder[0]).toBe("consume");
  });

  it("uses one autofix to remove an extra character that shifted the word", () => {
    const shifted = processChange({
      phrase: "hello world",
      previousValue: "heyll",
      rawValue: "heyllo",
      autofixesRemaining: 1,
    });

    expect(shifted).toMatchObject({
      value: "hello",
      shouldSyncInput: true,
      progressEvents: [
        { correctCharCount: 2, eventType: "Correct" },
      ],
      autofixesConsumed: 1,
    });
    expect(shifted.autofixProgressEvents.at(-1)).toEqual({
      correctCharCount: 5,
      eventType: "Correct",
    });

    const nextCharacter = processChange({
      phrase: "hello world",
      previousValue: shifted.value,
      rawValue: "hello ",
      autofixesRemaining: 0,
    });

    expect(nextCharacter).toMatchObject({
      value: "hello ",
      inputCorrection: null,
      progressEvents: [
        { correctCharCount: 6, eventType: "Correct" },
      ],
      autofixesConsumed: 0,
    });
  });

  it("aligns the remaining characters after multiple insertions", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "he",
      rawValue: "hexyllo",
      autofixesRemaining: 2,
    });

    expect(result).toMatchObject({
      value: "hello",
      shouldSyncInput: true,
      progressEvents: [
        { correctCharCount: 2, eventType: "Incorrect" },
        { correctCharCount: 2, eventType: "Incorrect" },
        { correctCharCount: 2, eventType: "Correct" },
        { correctCharCount: 2, eventType: "Correct" },
        { correctCharCount: 2, eventType: "Correct" },
      ],
      autofixesConsumed: 2,
    });
  });

  it("reports shifted characters as correct before applying the autofix", () => {
    const firstShiftedCharacter = processChange({
      phrase: "hello world",
      previousValue: "hey",
      rawValue: "heyl",
      autofixesRemaining: 1,
    });
    const secondShiftedCharacter = processChange({
      phrase: "hello world",
      previousValue: "heyl",
      rawValue: "heyll",
      autofixesRemaining: 1,
    });

    expect(firstShiftedCharacter).toMatchObject({
      inputCorrection: null,
      progressEvents: [
        { correctCharCount: 2, eventType: "Correct" },
      ],
    });
    expect(secondShiftedCharacter).toMatchObject({
      inputCorrection: null,
      progressEvents: [
        { correctCharCount: 2, eventType: "Correct" },
      ],
    });
  });

  it("uses the same alignment to restore a missing character", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "helo ",
      rawValue: "helo w",
      autofixesRemaining: 1,
    });

    expect(result).toMatchObject({
      value: "hello w",
      shouldSyncInput: true,
      progressEvents: [
        { correctCharCount: 3, eventType: "Correct" },
      ],
      autofixesConsumed: 1,
    });
    expect(result.autofixProgressEvents.at(-1)).toEqual({
      correctCharCount: 7,
      eventType: "Correct",
    });
  });

  it("uses newly crossed target boundaries rather than typed spaces", () => {
    const crossedBoundary = processChange({
      phrase: "hello world",
      previousValue: "hezlo",
      rawValue: "hezlox",
      autofixesRemaining: 2,
    });
    const laterBoundary = processChange({
      phrase: "hello world again",
      previousValue: "hexlo world",
      rawValue: "hexlo world ",
      autofixesRemaining: 4,
    });

    expect(crossedBoundary).toMatchObject({
      value: "hello ",
      progressEvents: [{ correctCharCount: 2, eventType: "Incorrect" }],
      autofixesConsumed: 2,
    });
    expect(crossedBoundary?.autofixProgressEvents.at(-1)).toEqual({
      correctCharCount: 6,
      eventType: "Correct",
    });
    expect(laterBoundary).toMatchObject({
      value: "hexlo world ",
      inputCorrection: null,
      shouldSyncInput: false,
      autofixesConsumed: 0,
      autofixProgressEvents: [],
    });
  });
});
