import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export const KEYWORD_COLOR = {
  plasma: "#d65c9f",
  chill: "#7dd3fc",
  chain: "#86efac",
  number: "#fbbf24",
} as const;

export const ACCENT_COLOR = "#fbbf24";

export interface TextSegment {
  text?: string;
  color?: string;
  bold?: boolean;
  node?: ReactNode;
}

export function num(current: number, next?: number): TextSegment[] {
  if (next === undefined || next === current) {
    return [{ text: `${current}`, color: KEYWORD_COLOR.number, bold: true }];
  }
  return [
    {
      node: (
        <span style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
          <span
            style={{
              color: KEYWORD_COLOR.number,
              fontWeight: 700,
              textShadow: `0 0 10px ${KEYWORD_COLOR.number}66`,
            }}
          >
            {current}
          </span>
          <ChevronRight
            size={10}
            strokeWidth={2.5}
            style={{ color: "#94a3b8", margin: "0 1px", flexShrink: 0 }}
          />
          <span
            style={{
              color: KEYWORD_COLOR.number,
              fontWeight: 700,
              textShadow: `0 0 10px ${KEYWORD_COLOR.number}66`,
            }}
          >
            {next}
          </span>
        </span>
      ),
    },
  ];
}

export function keyword(text: string, color: string): TextSegment {
  return { text, color, bold: true };
}

export function plain(text: string): TextSegment {
  return { text };
}
