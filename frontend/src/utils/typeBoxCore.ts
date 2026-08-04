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
  progressIndex: number,
  eventType: TypeBoxProgressEventType,
) => void;

export type TypeBoxChangeResult = {
  inputCorrection: string | null;
  value: string;
  completedThrough: number;
  requiresFixes: boolean;
  canComplete: boolean;
};

function getSharedPrefixLength(left: string, right: string) {
  const sharedLength = Math.min(left.length, right.length);
  let index = 0;
  while (index < sharedLength && left[index] === right[index]) index++;
  return index;
}

export function analyzeTypeBoxInput(
  phrase: string,
  input: string,
  totalAllowedErrors: number,
) {
  let completedThrough = 0;
  const allowedErrors = Math.max(0, totalAllowedErrors);
  let errorsUsed = 0;
  let pendingErrors = 0;
  let typedErrors = 0;
  let firstDisallowedError = -1;
  let boundaryRequiresFixes = false;
  const scannedLength = Math.min(input.length, phrase.length);

  for (let index = 0; index < scannedLength; index++) {
    if (input[index] !== phrase[index]) {
      typedErrors++;
      pendingErrors++;
      if (
        firstDisallowedError < 0 &&
        typedErrors > allowedErrors
      ) {
        firstDisallowedError = index;
      }
    }

    if (
      !boundaryRequiresFixes &&
      phrase[index] === " " &&
      input[index] === " "
    ) {
      if (errorsUsed + pendingErrors <= allowedErrors) {
        errorsUsed += pendingErrors;
        pendingErrors = 0;
        completedThrough = index + 1;
      } else {
        boundaryRequiresFixes = true;
      }
    }
  }

  for (let index = phrase.length; index < input.length; index++) {
    typedErrors++;
    if (
      firstDisallowedError < 0 &&
      typedErrors > allowedErrors
    ) {
      firstDisallowedError = index;
    }
  }

  const canComplete =
    input.length === phrase.length &&
    !boundaryRequiresFixes &&
    errorsUsed + pendingErrors <= allowedErrors;
  if (canComplete) {
    errorsUsed += pendingErrors;
    completedThrough = phrase.length;
  }

  const requiresFixes =
    boundaryRequiresFixes ||
    (!canComplete && input.length >= phrase.length);
  const reportedProgress =
    firstDisallowedError >= 0
      ? firstDisallowedError
      : requiresFixes && input.length >= phrase.length
        ? Math.max(0, phrase.length - 1)
        : Math.min(input.length, phrase.length);

  return {
    completedThrough,
    errorsUsed,
    errorsToFix: Math.max(0, typedErrors - allowedErrors),
    requiresFixes,
    canComplete,
    reportedProgress,
  };
}

function getReportedProgress(
  phrase: string,
  input: string,
  totalAllowedErrors: number,
) {
  return analyzeTypeBoxInput(
    phrase,
    input,
    totalAllowedErrors,
  ).reportedProgress;
}

/**
 * Processes one native input change. Errors remain untouched and pending until
 * a correct word boundary commits them. Browser input is always accepted as-is;
 * this function only derives completion and progress information from it.
 */
export function processTypeBoxChange(
  phrase: string,
  previousValue: string,
  rawValue: string,
  totalAllowedErrors: number,
  onProgress?: TypeBoxProgressCallback,
): TypeBoxChangeResult {
  if (rawValue === previousValue) {
    const analysis = analyzeTypeBoxInput(
      phrase,
      previousValue,
      totalAllowedErrors,
    );
    return {
      inputCorrection: null,
      value: previousValue,
      completedThrough: analysis.completedThrough,
      requiresFixes: analysis.requiresFixes,
      canComplete: analysis.canComplete,
    };
  }

  const sharedPrefixLength = getSharedPrefixLength(
    previousValue,
    rawValue,
  );
  const isPureAppend =
    sharedPrefixLength === previousValue.length &&
    rawValue.length > previousValue.length;
  if (!isPureAppend) {
    const previousAnalysis = analyzeTypeBoxInput(
      phrase,
      previousValue,
      totalAllowedErrors,
    );
    let correction: string | null = null;
    if (rawValue.length < previousAnalysis.completedThrough) {
      correction = previousValue.substring(
        0,
        previousAnalysis.completedThrough,
      );
    } else if (sharedPrefixLength < previousAnalysis.completedThrough) {
      correction = previousValue;
    }

    if (correction !== null) {
      return {
        inputCorrection: correction,
        value: correction,
        completedThrough: previousAnalysis.completedThrough,
        requiresFixes: previousAnalysis.requiresFixes,
        canComplete: previousAnalysis.canComplete,
      };
    }
  }

  const nextAnalysis = analyzeTypeBoxInput(
    phrase,
    rawValue,
    totalAllowedErrors,
  );

  if (onProgress) {
    for (
      let index = previousValue.length;
      index > sharedPrefixLength;
      index--
    ) {
      onProgress(
        getReportedProgress(
          phrase,
          previousValue.substring(0, index - 1),
          totalAllowedErrors,
        ),
        "Backspace",
      );
    }

    for (
      let characterIndex = sharedPrefixLength;
      characterIndex < rawValue.length;
      characterIndex++
    ) {
      const inputAtEvent = rawValue.substring(0, characterIndex + 1);
      onProgress(
        characterIndex === rawValue.length - 1
          ? nextAnalysis.reportedProgress
          : getReportedProgress(
              phrase,
              inputAtEvent,
              totalAllowedErrors,
            ),
        rawValue[characterIndex] === phrase[characterIndex]
          ? "Correct"
          : "Incorrect",
      );
    }
  }

  return {
    inputCorrection: null,
    value: rawValue,
    completedThrough: nextAnalysis.completedThrough,
    requiresFixes: nextAnalysis.requiresFixes,
    canComplete: nextAnalysis.canComplete,
  };
}
