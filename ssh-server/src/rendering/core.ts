export type RenderState = "pending" | "correct" | "incorrect" | "completed";

export type RenderCell = {
  char: string;
  state: RenderState;
};

export type CursorPosition = {
  line: number;
  column: number;
};

export type RenderFrame = {
  lines: RenderCell[][];
  cursor: CursorPosition;
  isComplete: boolean;
  phraseLength: number;
};

export type BuildRenderFrameOptions = {
  maxWidth?: number;
};

export const buildRenderFrame = (
  phrase: string,
  input: string,
  options: BuildRenderFrameOptions = {}
): RenderFrame => {
  const normalizedInput = input.slice(0, phrase.length);
  const cursorIndex = Math.min(normalizedInput.length, phrase.length);
  const chars = phrase.split("");
  const lines: RenderCell[][] = [[]];
  const maxWidth = options.maxWidth;

  let line = 0;
  let column = 0;
  let cursor: CursorPosition = { line: 0, column: 0 };

  let lastCompletedWordEnd = 0;
  for (let i = 0; i < normalizedInput.length && i < phrase.length; i += 1) {
    if (normalizedInput[i] !== phrase[i]) {
      break;
    }
    if (phrase[i] === " ") {
      lastCompletedWordEnd = i + 1;
    }
  }

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];

    if (char === "\n") {
      if (i === cursorIndex) {
        cursor = { line, column };
      }
      lines.push([]);
      line += 1;
      column = 0;
      continue;
    }

    if (maxWidth && column >= maxWidth) {
      lines.push([]);
      line += 1;
      column = 0;
    }

    if (i === cursorIndex) {
      cursor = { line, column };
    }

    const isTyped = i < normalizedInput.length;
    const isCorrect = normalizedInput[i] === char;
    const isInCompletedWord = i < lastCompletedWordEnd;
    const isInCurrentWord =
      i >= lastCompletedWordEnd && i < normalizedInput.length && isCorrect;

    let state: RenderState = "pending";
    if (isTyped && !isCorrect) {
      state = "incorrect";
    } else if (isInCompletedWord) {
      state = "completed";
    } else if (isInCurrentWord) {
      state = "correct";
    }

    lines[line].push({ char, state });
    column += 1;
  }

  if (cursorIndex === chars.length) {
    cursor = { line, column };
  }

  return {
    lines,
    cursor,
    isComplete: normalizedInput === phrase,
    phraseLength: phrase.length,
  };
};
