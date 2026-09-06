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

type InputAnalysis = {
  completedThrough: number;
  errorsUsed: number;
  errorsToFix: number;
  requiresFixes: boolean;
  canComplete: boolean;
  reportedProgress: number;
};

type ScanState = {
  committedThrough: number;
  committedErrors: number;
  pendingErrors: number;
  typedErrors: number;
  firstDisallowedError: number | null;
  boundaryRequiresFixes: boolean;
};

type AnalysisCache = {
  phrase: string;
  input: string;
  totalAllowedErrors: number;
  scanState: ScanState;
  analysis: InputAnalysis;
};

let analysisCache: AnalysisCache | undefined;

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

function createScanState(): ScanState {
  return {
    committedThrough: 0,
    committedErrors: 0,
    pendingErrors: 0,
    typedErrors: 0,
    firstDisallowedError: null,
    boundaryRequiresFixes: false,
  };
}

function scanCharacter(
  state: ScanState,
  phrase: string,
  input: string,
  index: number,
  allowedErrors: number,
) {
  if (index >= phrase.length) {
    state.typedErrors++;
  } else {
    if (input[index] !== phrase[index]) {
      state.typedErrors++;
      state.pendingErrors++;
    }

    if (
      !state.boundaryRequiresFixes &&
      phrase[index] === " " &&
      input[index] === " "
    ) {
      if (
        state.committedErrors + state.pendingErrors <=
        allowedErrors
      ) {
        state.committedErrors += state.pendingErrors;
        state.pendingErrors = 0;
        state.committedThrough = index + 1;
      } else {
        state.boundaryRequiresFixes = true;
      }
    }
  }

  if (
    state.firstDisallowedError === null &&
    state.typedErrors > allowedErrors
  ) {
    state.firstDisallowedError = index;
  }
}

function buildInputAnalysis(
  state: ScanState,
  phraseLength: number,
  inputLength: number,
  allowedErrors: number,
): InputAnalysis {
  const canComplete =
    inputLength === phraseLength &&
    !state.boundaryRequiresFixes &&
    state.committedErrors + state.pendingErrors <= allowedErrors;
  const requiresFixes =
    state.boundaryRequiresFixes ||
    (!canComplete && inputLength >= phraseLength);

  return {
    completedThrough: canComplete
      ? phraseLength
      : state.committedThrough,
    errorsUsed: canComplete
      ? state.committedErrors + state.pendingErrors
      : state.committedErrors,
    errorsToFix: Math.max(0, state.typedErrors - allowedErrors),
    requiresFixes,
    canComplete,
    reportedProgress:
      state.firstDisallowedError ??
      (requiresFixes && inputLength >= phraseLength
        ? Math.max(0, phraseLength - 1)
        : Math.min(inputLength, phraseLength)),
  };
}

export function analyzeTypeBoxInput(
  phrase: string,
  input: string,
  totalAllowedErrors: number,
): InputAnalysis {
  if (
    analysisCache?.phrase === phrase &&
    analysisCache.input === input &&
    analysisCache.totalAllowedErrors === totalAllowedErrors
  ) {
    return analysisCache.analysis;
  }

  // Normal typing appends one character. Reuse the scanner state in that case;
  // edits elsewhere in the input fall back to a complete scan.
  let scanState: ScanState;
  let startIndex: number;
  if (
    analysisCache?.phrase === phrase &&
    analysisCache.totalAllowedErrors === totalAllowedErrors &&
    input.length === analysisCache.input.length + 1 &&
    input.startsWith(analysisCache.input)
  ) {
    scanState = analysisCache.scanState;
    startIndex = input.length - 1;
  } else {
    scanState = createScanState();
    startIndex = 0;
  }
  const allowedErrors = Math.max(0, totalAllowedErrors);

  for (let index = startIndex; index < input.length; index++) {
    scanCharacter(scanState, phrase, input, index, allowedErrors);
  }

  const analysis = buildInputAnalysis(
    scanState,
    phrase.length,
    input.length,
    allowedErrors,
  );
  analysisCache = {
    phrase,
    input,
    totalAllowedErrors,
    scanState,
    analysis,
  };
  return analysis;
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

  const isPureAppend =
    rawValue.length > previousValue.length &&
    rawValue.startsWith(previousValue);
  const sharedPrefixLength = isPureAppend
    ? previousValue.length
    : getSharedPrefixLength(previousValue, rawValue);
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
