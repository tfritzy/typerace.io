import {
  alignToClosestTargetPrefix,
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
  let value = "";
  let autofixesConsumed = 0;

  for (const step of steps) {
    if (step.type === "Insert") {
      if (autofixesConsumed < availableAutofixes) {
        value += target[step.targetIndex];
        autofixesConsumed++;
      }
      continue;
    }

    if (step.type === "Delete") {
      if (autofixesConsumed < availableAutofixes) {
        autofixesConsumed++;
      } else {
        value += source[step.sourceIndex];
      }
      continue;
    }

    const shouldReplace =
      step.type === "Replace" &&
      autofixesConsumed < availableAutofixes;
    value += shouldReplace
      ? target[step.targetIndex]
      : source[step.sourceIndex];
    if (shouldReplace) autofixesConsumed++;
  }

  return { value, autofixesConsumed };
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

  for (let index = rawValue.length; index > rawCorrectCharCount; index--) {
    onProgress(rawCorrectCharCount, "Backspace");
  }

  for (
    let index = rawCorrectCharCount;
    index < correctedValue.length;
    index++
  ) {
    onProgress(
      Math.min(correctedCharCount, index + 1),
      correctedValue[index] === phrase[index] ? "Correct" : "Incorrect",
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

  if (rawValue.length > previousValue.length && availableAutofixes > 0) {
    const lastCrossedIndex = Math.min(rawValue.length, phrase.length) - 1;
    for (
      let boundaryIndex = previousValue.length;
      boundaryIndex <= lastCrossedIndex;
      boundaryIndex++
    ) {
      const isBoundary =
        phrase[boundaryIndex] === " " || boundaryIndex === phrase.length - 1;
      if (!isBoundary) continue;

      const wordStart = phrase.lastIndexOf(" ", boundaryIndex - 1) + 1;
      const remainingAutofixes =
        availableAutofixes - autofixesConsumed;
      const windowEnd = boundaryIndex + 1 + remainingAutofixes;
      const sourceEnd = Math.min(value.length, windowEnd);
      const targetEnd = Math.min(phrase.length, windowEnd);
      if (sourceEnd <= wordStart || targetEnd <= wordStart) continue;

      const source = value.substring(wordStart, sourceEnd);
      const target = phrase.substring(wordStart, targetEnd);
      const alignment = alignToClosestTargetPrefix(source, target);
      const correction = applyAlignment(
        source,
        target,
        alignment,
        remainingAutofixes,
      );

      if (correction.autofixesConsumed > 0) {
        value =
          value.substring(0, wordStart) +
          correction.value +
          value.substring(sourceEnd);
        autofixesConsumed += correction.autofixesConsumed;
      }

      if (autofixesConsumed >= availableAutofixes) break;
    }
  }

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

  if (autofixesConsumed > 0) {
    emitAutofixProgressEvents(phrase, rawValue, value, onProgress);
  }

  return autofixesConsumed > 0 ? value : null;
}
