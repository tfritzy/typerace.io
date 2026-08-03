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

  it("waits for the next word to start before spending an autofix", () => {
    const space = processChange({
      phrase: "hello world",
      previousValue: "hexxo",
      rawValue: "hexxo ",
      autofixesRemaining: 1,
    });
    const result = processChange({
      phrase: "hello world",
      previousValue: space.value,
      rawValue: "hexxo w",
      autofixesRemaining: 1,
    });

    expect(space).toMatchObject({
      value: "hexxo ",
      shouldSyncInput: false,
      autofixesConsumed: 0,
    });
    expect(result).toMatchObject({
      value: "helxo w",
      shouldSyncInput: true,
      autofixesConsumed: 1,
    });
    expect(result.operationOrder[0]).toBe("consume");
  });

  it("prices an extra character without removing it", () => {
    const shifted = processChange({
      phrase: "hello world",
      previousValue: "heyll",
      rawValue: "heyllo",
      autofixesRemaining: 1,
    });
    const space = processChange({
      phrase: "hello world",
      previousValue: shifted.value,
      rawValue: "heyllo ",
      autofixesRemaining: 1,
    });
    const nextCharacter = processChange({
      phrase: "hello world",
      previousValue: space.value,
      rawValue: "heyllo w",
      autofixesRemaining: 1,
    });

    expect(shifted).toMatchObject({
      value: "heyllo",
      shouldSyncInput: false,
      progressEvents: [
        { correctCharCount: 2, eventType: "Correct" },
      ],
      autofixesConsumed: 0,
    });
    expect(space).toMatchObject({
      value: "heyllo ",
      shouldSyncInput: false,
      autofixesConsumed: 0,
    });
    expect(nextCharacter).toMatchObject({
      value: "hello  w",
      shouldSyncInput: true,
      autofixesConsumed: 1,
    });
    expect(nextCharacter.value).toHaveLength("heyllo w".length);
  });

  it("aligns the remaining characters after multiple insertions", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "hexyll",
      rawValue: "hexyllo",
      autofixesRemaining: 2,
    });

    expect(result).toMatchObject({
      value: "helll o",
      shouldSyncInput: true,
      autofixesConsumed: 2,
    });
    expect(result.value).toHaveLength("hexyllo".length);
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
      previousValue: "helo w",
      rawValue: "helo wo",
      autofixesRemaining: 1,
    });

    expect(result).toMatchObject({
      value: "hellowo",
      shouldSyncInput: true,
      progressEvents: [
        { correctCharCount: 3, eventType: "Correct" },
      ],
      autofixesConsumed: 1,
    });
    expect(result.value).toHaveLength("helo wo".length);
  });

  it("charges an autofix to correct letter casing", () => {
    const result = processChange({
      phrase: "Hello world",
      previousValue: "hello ",
      rawValue: "hello w",
      autofixesRemaining: 1,
    });

    expect(result).toMatchObject({
      value: "Hello w",
      shouldSyncInput: true,
      autofixesConsumed: 1,
    });
  });

  it("does not apply remaining autofixes to the current word", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "hexlo ",
      rawValue: "hexlo x",
      autofixesRemaining: 2,
    });

    expect(result).toMatchObject({
      value: "hello x",
      shouldSyncInput: true,
      autofixesConsumed: 1,
    });
  });

  it("charges separately for substitutions while spaces remain free", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "haxxo ",
      rawValue: "haxxo w",
      autofixesRemaining: 3,
    });

    expect(result).toMatchObject({
      value: "hello w",
      shouldSyncInput: true,
      autofixesConsumed: 3,
    });
  });

  it("corrects a separator when no paid autofixes remain", () => {
    const result = processChange({
      phrase: "hello world",
      previousValue: "hellox",
      rawValue: "helloxw",
      autofixesRemaining: 0,
    });

    expect(result).toMatchObject({
      value: "hello w",
      shouldSyncInput: true,
      autofixesConsumed: 0,
    });
  });

  it("corrects declineesa to declines a without moving the current word", () => {
    const result = processChange({
      phrase: "declines and",
      previousValue: "declinees",
      rawValue: "declineesa",
      autofixesRemaining: 2,
    });

    expect(result).toMatchObject({
      value: "declines a",
      shouldSyncInput: true,
      autofixesConsumed: 1,
    });
    expect(result.value).toHaveLength("declineesa".length);
    expect(result.value[9]).toBe("a");
    expect(result.autofixProgressEvents.at(-1)).toMatchObject({
      eventType: "Correct",
    });
  });

  it("waits for a non-space character after crossing a phrase boundary", () => {
    const crossedBoundary = processChange({
      phrase: "hello world",
      previousValue: "hezlo",
      rawValue: "hezlox",
      autofixesRemaining: 2,
    });
    const nextWord = processChange({
      phrase: "hello world",
      previousValue: "hezlox ",
      rawValue: "hezlox w",
      autofixesRemaining: 2,
    });
    const laterBoundary = processChange({
      phrase: "hello world again",
      previousValue: "hexlo world",
      rawValue: "hexlo world ",
      autofixesRemaining: 4,
    });

    expect(crossedBoundary).toMatchObject({
      value: "hezlox",
      progressEvents: [{ correctCharCount: 2, eventType: "Incorrect" }],
      autofixesConsumed: 0,
    });
    expect(nextWord).toMatchObject({
      value: "hello  w",
      shouldSyncInput: true,
      autofixesConsumed: 2,
    });
    expect(nextWord.value).toHaveLength("hezlox w".length);
    expect(laterBoundary).toMatchObject({
      value: "hexlo world ",
      inputCorrection: null,
      shouldSyncInput: false,
      autofixesConsumed: 0,
      autofixProgressEvents: [],
    });
  });
});
