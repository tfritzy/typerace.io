import { renderFrameAnsi, type RenderAnsiOptions } from "./ansi";
import type { RenderFrame } from "./core";

export type RenderXtermOptions = RenderAnsiOptions;

export const renderFrameXterm = (
  frame: RenderFrame,
  options: RenderXtermOptions = {}
): string => renderFrameAnsi(frame, options);
