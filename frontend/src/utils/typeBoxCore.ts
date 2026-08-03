import {
  alignToClosestTargetPrefix,
  alignToTarget,
  type AlignmentStep,
} from "./levenshteinAlignment";

const EMPTY_CHARACTER_ALIGNMENT: ReadonlyMap<number, number | null> =
  new Map();

export type TypeBoxProgressEventType =
  | "Correct"
  | "Incorrect"
  | "Backspace";

export function getWordCount(phrase: string) {
  let count = 0;

  for (let index = 0; index < phrase.length; index++) {
    if (
      phrase[index] !== " " &&
      (index === 0 || phrase[index - 1] === " ")
    ) {
      count++;
    }
  }

  return count;
}

export function getCompletedWordCount(
  phrase: string,
  progressIndex: number,
) {
  let finalCharacterIndex = phrase.length - 1;
  while (
    finalCharacterIndex >= 0 &&
    phrase[finalCharacterIndex] === " "
  ) {
    finalCharacterIndex--;
  }
  if (finalCharacterIndex < 0) return 0;

  let count = progressIndex > finalCharacterIndex ? 1 : 0;
  const scannedLength = Math.min(progressIndex, finalCharacterIndex);

  for (let index = 1; index < scannedLength; index++) {
    if (phrase[index] === " " && phrase[index - 1] !== " ") {
      count++;
    }
  }

  return count;
}

export type TypeBoxProgressCallback = (
  correctCharCount: number,
  eventType: TypeBoxProgressEventType,
) => void;

function getLastCompletedWordEnd(phrase: string, input: string) {
  let lastCompletedWordEnd = 0;

  for (let index = 0; index < input.length; index++) {
    if (input[index] !== phrase[index]) break;
    if (phrase[index] === " ") lastCompletedWordEnd = index + 1;
  }

  return lastCompletedWordEnd;
}

function getCorrectPrefix(phrase: string, input: string) {
  let correctCharCount = 0;

  for (let index = 0; index < input.length; index++) {
    if (input[index] !== phrase[index]) break;
    correctCharCount++;
  }

  return correctCharCount;
}

function applyAlignment(
  source: string,
  target: string,
  steps: AlignmentStep[],
  availableAutofixes: number,
) {
  const value = source.split("");
  let changed = false;
  let autofixesConsumed = 0;
  let sourceCursor = 0;
  let targetCursor = 0;
  const edits: Array<{ apply: boolean; cost: 0 | 1; start: number }> = [];

  for (const step of steps) {
    if (step.type === "Match") {
      sourceCursor++;
      targetCursor++;
      continue;
    }

    const correctsToSpace =
      step.type !== "Delete" && target[step.targetIndex] === " ";
    edits.push({
      apply: true,
      cost: correctsToSpace ? 0 : 1,
      start: step.type === "Insert" ? targetCursor : sourceCursor,
    });

    if (step.type !== "Insert") sourceCursor++;
    if (step.type !== "Delete") targetCursor++;
  }

  for (let editIndex = 0; editIndex < edits.length; editIndex++) {
    const edit = edits[editIndex];
    if (!edit.apply) continue;
    if (edit.cost > 0 && autofixesConsumed >= availableAutofixes) continue;

    const end = edits[editIndex + 1]?.start ?? target.length;
    for (
      let index = edit.start;
      index < end && index < value.length && index < target.length;
      index++
    ) {
      if (value[index] !== target[index]) {
        value[index] = target[index];
        changed = true;
      }
    }
    autofixesConsumed += edit.cost;
  }

  return { value: value.join(""), autofixesConsumed, changed };
}

function alignRawCharacterIndexes(
  phrase: string,
  rawValue: string,
  autofixesRemaining: number,
): ReadonlyMap<number, number | null> {
  if (phrase.startsWith(rawValue)) return EMPTY_CHARACTER_ALIGNMENT;

  const rawCharacterTargetIndexes = new Map<number, number | null>();
  const alignmentStart = getLastCompletedWordEnd(phrase, rawValue);
  const source = rawValue.substring(alignmentStart);
  const targetEnd = Math.min(
    phrase.length,
    alignmentStart + source.length + autofixesRemaining,
  );
  const target = phrase.substring(alignmentStart, targetEnd);

  for (const step of alignToClosestTargetPrefix(source, target)) {
    if (step.type === "Insert") continue;

    rawCharacterTargetIndexes.set(
      alignmentStart + step.sourceIndex,
      step.type === "Delete"
        ? null
        : alignmentStart + step.targetIndex,
    );
  }

  return rawCharacterTargetIndexes;
}

function emitProgressEvents(
  phrase: string,
  previousValue: string,
  rawValue: string,
  onProgress?: TypeBoxProgressCallback,
  rawCharacterTargetIndexes: ReadonlyMap<number, number | null> = new Map(),
) {
  if (!onProgress) return;

  const correctCharCount = getCorrectPrefix(phrase, rawValue);

  if (rawValue.length < previousValue.length) {
    const charactersDeleted = previousValue.length - rawValue.length;
    for (let index = 0; index < charactersDeleted; index++) {
      onProgress(correctCharCount, "Backspace");
    }
    return;
  }

  const charactersAdded = rawValue.length - previousValue.length;
  for (let index = 0; index < charactersAdded; index++) {
    const characterIndex = previousValue.length + index;
    const alignedCharacterIndex = rawCharacterTargetIndexes.has(
      characterIndex,
    )
      ? rawCharacterTargetIndexes.get(characterIndex)
      : characterIndex;
    const eventType =
      alignedCharacterIndex !== null &&
      alignedCharacterIndex !== undefined &&
      rawValue[characterIndex] === phrase[alignedCharacterIndex]
        ? "Correct"
        : "Incorrect";
    onProgress(
      Math.min(correctCharCount, characterIndex + 1),
      eventType,
    );
  }
}

function emitAutofixProgressEvents(
  phrase: string,
  rawValue: string,
  correctedValue: string,
  onProgress?: TypeBoxProgressCallback,
) {
  if (!onProgress) return;

  const rawCorrectCharCount = getCorrectPrefix(phrase, rawValue);
  const correctedCharCount = getCorrectPrefix(phrase, correctedValue);
  const correctedCharacterTargetIndexes = alignRawCharacterIndexes(
    phrase,
    correctedValue,
    0,
  );

  for (let index = rawValue.length; index > rawCorrectCharCount; index--) {
    onProgress(rawCorrectCharCount, "Backspace");
  }

  for (
    let index = rawCorrectCharCount;
    index < correctedValue.length;
    index++
  ) {
    const alignedCharacterIndex = correctedCharacterTargetIndexes.has(index)
      ? correctedCharacterTargetIndexes.get(index)
      : index;
    onProgress(
      Math.min(correctedCharCount, index + 1),
      alignedCharacterIndex !== null &&
        alignedCharacterIndex !== undefined &&
        correctedValue[index] === phrase[alignedCharacterIndex]
        ? "Correct"
        : "Incorrect",
    );
  }
}

/**
 * Processes a native input change and returns a replacement only when the
 * browser's value must be corrected. A null result keeps rawValue as-is.
 */
export function processTypeBoxChange(
  phrase: string,
  previousValue: string,
  rawValue: string,
  autofixesRemaining: number,
  onProgress?: TypeBoxProgressCallback,
  onAutofixesConsumed?: (count: number) => void,
): string | null {
  if (rawValue === previousValue) return null;

  if (rawValue.length < previousValue.length) {
    const lastCompletedWordEnd = getLastCompletedWordEnd(
      phrase,
      previousValue,
    );

    if (rawValue.length < lastCompletedWordEnd) {
      return phrase.substring(0, lastCompletedWordEnd);
    }
  }

  let value = rawValue;
  let autofixesConsumed = 0;
  const availableAutofixes = Math.max(0, autofixesRemaining);

  if (rawValue.length > previousValue.length) {
    const lastCrossedIndex = Math.min(rawValue.length, phrase.length) - 1;
    for (
      let triggerIndex = previousValue.length;
      triggerIndex <= lastCrossedIndex;
      triggerIndex++
    ) {
      const targetWordStart =
        phrase.lastIndexOf(
          " ",
          Math.min(triggerIndex - 1, phrase.length - 1),
        ) + 1;
      const startsNextWord =
        targetWordStart > 0 &&
        rawValue[triggerIndex] !== " " &&
        (previousValue.length <= targetWordStart ||
          previousValue[targetWordStart] === " ");
      const reachesPhraseEnd = triggerIndex === phrase.length - 1;
      if (!startsNextWord && !reachesPhraseEnd) continue;

      const wordStart = startsNextWord
        ? phrase.lastIndexOf(" ", targetWordStart - 2) + 1
        : phrase.lastIndexOf(" ", triggerIndex - 1) + 1;
      const remainingAutofixes =
        availableAutofixes - autofixesConsumed;
      const windowEnd = triggerIndex + 1 + remainingAutofixes;
      const sourceEnd = startsNextWord
        ? Math.min(value.length, triggerIndex)
        : Math.min(value.length, windowEnd);
      const targetEnd = startsNextWord
        ? targetWordStart
        : Math.min(phrase.length, windowEnd);
      if (sourceEnd <= wordStart || targetEnd <= wordStart) continue;

      const source = value.substring(wordStart, sourceEnd);
      const target = phrase.substring(wordStart, targetEnd);
      const alignment = alignToTarget(source, target);
      const correction = applyAlignment(
        source,
        target,
        alignment,
        remainingAutofixes,
      );

      if (correction.changed) {
        value =
          value.substring(0, wordStart) +
          correction.value +
          value.substring(sourceEnd);
        autofixesConsumed += correction.autofixesConsumed;
      }

      if (autofixesConsumed >= availableAutofixes) break;
    }
  }

  const wasCorrected = value !== rawValue;

  if (autofixesConsumed > 0) {
    onAutofixesConsumed?.(autofixesConsumed);
  }

  const rawCharacterTargetIndexes =
    availableAutofixes > 0
      ? alignRawCharacterIndexes(
          phrase,
          rawValue,
          availableAutofixes,
        )
      : EMPTY_CHARACTER_ALIGNMENT;

  emitProgressEvents(
    phrase,
    previousValue,
    rawValue,
    onProgress,
    rawCharacterTargetIndexes,
  );

  if (wasCorrected) {
    emitAutofixProgressEvents(phrase, rawValue, value, onProgress);
  }

  return wasCorrected ? value : null;
}
