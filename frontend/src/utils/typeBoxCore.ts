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

function emitProgressEvents(
  phrase: string,
  previousValue: string,
  rawValue: string,
  onProgress?: TypeBoxProgressCallback,
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
    const eventType =
      rawValue[characterIndex] === phrase[characterIndex]
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
      for (let index = wordStart; index <= boundaryIndex; index++) {
        if (value[index] === phrase[index]) continue;
        if (autofixesConsumed >= availableAutofixes) break;

        value =
          value.substring(0, index) +
          phrase[index] +
          value.substring(index + 1);
        autofixesConsumed++;
      }

      if (autofixesConsumed >= availableAutofixes) break;
    }
  }

  if (autofixesConsumed > 0) {
    onAutofixesConsumed?.(autofixesConsumed);
  }

  emitProgressEvents(phrase, previousValue, rawValue, onProgress);

  if (autofixesConsumed > 0) {
    emitAutofixProgressEvents(phrase, rawValue, value, onProgress);
  }

  return autofixesConsumed > 0 ? value : null;
}
