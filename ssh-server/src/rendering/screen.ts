import { buildRenderFrame } from "./core";
import { renderFrameAnsi, type RenderAnsiOptions } from "./ansi";
import { renderFrameXterm } from "./xterm";

export type RacePlayerProgress = {
  name: string;
  progressIndex: number;
  phraseLength?: number;
  wpm?: number;
  isCurrent?: boolean;
};

export type RaceScreenOptions = {
  phrase: string;
  input: string;
  players: RacePlayerProgress[];
  attribution?: string;
  width?: number;
  showCursor?: boolean;
};

const renderProgressLine = (
  player: RacePlayerProgress,
  phraseLength: number,
  barWidth: number
): string => {
  const total = player.phraseLength ?? phraseLength;
  const safeTotal = total > 0 ? total : 1;
  const progress = Math.min(player.progressIndex, safeTotal);
  const filled = Math.round((progress / safeTotal) * barWidth);
  const bar = `${"█".repeat(filled)}${" ".repeat(barWidth - filled)}`;
  const name = player.name.length > 12 ? player.name.slice(0, 12) : player.name;
  const paddedName = name.padEnd(12, " ");
  const wpm = player.wpm ? ` ${Math.round(player.wpm)}wpm` : "";
  const prefix = player.isCurrent ? ">" : " ";
  return `${prefix} ${paddedName} [${bar}] ${progress}/${safeTotal}${wpm}`;
};

const buildFrame = (options: RaceScreenOptions) =>
  buildRenderFrame(options.phrase, options.input, {
    maxWidth: Math.max(10, (options.width ?? 80) - 4),
  });

const buildScreenLines = (
  options: RaceScreenOptions,
  frame: ReturnType<typeof buildFrame>,
  renderPhrase: (frame: ReturnType<typeof buildFrame>, opts: RenderAnsiOptions) => string
): string[] => {
  const width = options.width ?? 80;
  const barWidth = Math.max(10, Math.floor(width * 0.35));
  const players = options.players.map((player) =>
    renderProgressLine(player, options.phrase.length, barWidth)
  );
  const phraseLines = renderPhrase(frame, {
    width,
    showCursor: options.showCursor,
  }).split("\n");
  const lines = [...players, "", ...phraseLines];

  if (options.attribution) {
    const attributionLine = `- ${options.attribution}`;
    const padLeft = Math.max(0, width - attributionLine.length);
    lines.push(`${" ".repeat(padLeft)}${attributionLine}`);
  }

  return lines;
};

export const renderRaceScreenAnsi = (options: RaceScreenOptions): string => {
  const frame = buildFrame(options);
  return buildScreenLines(options, frame, renderFrameAnsi).join("\n");
};

export const renderRaceScreenXterm = (options: RaceScreenOptions): string => {
  const frame = buildFrame(options);
  return buildScreenLines(options, frame, renderFrameXterm).join("\n");
};
