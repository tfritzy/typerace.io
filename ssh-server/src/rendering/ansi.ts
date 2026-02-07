import { type RenderFrame, type RenderState } from "./core";

export type RenderAnsiOptions = {
  width?: number;
  cursorGlyph?: string;
  showCursor?: boolean;
};

const ansiStyles = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  brightWhite: "\x1b[97m",
  mutedWhite: "\x1b[37m",
  error: "\x1b[31m",
  underline: "\x1b[4m",
  cursor: "\x1b[7m",
};

const styleForState = (state: RenderState): string => {
  if (state === "incorrect") {
    return `${ansiStyles.error}${ansiStyles.underline}`;
  }
  if (state === "completed") {
    return ansiStyles.dim;
  }
  if (state === "correct") {
    return ansiStyles.brightWhite;
  }
  return ansiStyles.mutedWhite;
};

const renderChar = (char: string, state: RenderState): string =>
  `${styleForState(state)}${char}${ansiStyles.reset}`;

export const renderFrameAnsi = (
  frame: RenderFrame,
  options: RenderAnsiOptions = {}
): string => {
  const cursorGlyph = options.cursorGlyph ?? "▌";
  const showCursor = options.showCursor ?? !frame.isComplete;
  const maxLineLength = frame.lines.reduce(
    (max, line) => Math.max(max, line.length),
    0
  );
  const targetWidth = options.width ?? maxLineLength;

  return frame.lines
    .map((line, lineIndex) => {
      const paddingLeft = Math.max(
        0,
        Math.floor((targetWidth - line.length) / 2)
      );
      const pad = " ".repeat(paddingLeft);
      let lineOutput = pad;

      for (let col = 0; col < line.length; col += 1) {
        if (
          showCursor &&
          frame.cursor.line === lineIndex &&
          frame.cursor.column === col
        ) {
          lineOutput += `${ansiStyles.cursor}${cursorGlyph}${ansiStyles.reset}`;
        }
        lineOutput += renderChar(line[col].char, line[col].state);
      }

      if (
        showCursor &&
        frame.cursor.line === lineIndex &&
        frame.cursor.column === line.length
      ) {
        lineOutput += `${ansiStyles.cursor}${cursorGlyph}${ansiStyles.reset}`;
      }

      return lineOutput;
    })
    .join("\n");
};
