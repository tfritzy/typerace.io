import { memo } from "react";
import type { GameMode } from "../types/stdb";
import {
  getContentTypeFromMode,
  getLanguageInfoFromMode,
} from "../utils/modes";
import { getTranslations } from "../utils/translations";

interface RaceDetailsRowProps {
  gameMode: GameMode;
  phrase: string;
}

export function getPhraseWordCount(phrase: string): number {
  const trimmedPhrase = phrase.trim();
  if (!trimmedPhrase) return 0;
  return /\s/u.test(trimmedPhrase)
    ? trimmedPhrase.split(/\s+/u).length
    : Array.from(trimmedPhrase).length;
}

export const RaceDetailsRow = memo(
  ({ gameMode, phrase }: RaceDetailsRowProps) => {
    const language = getLanguageInfoFromMode(gameMode.tag);
    const t = getTranslations();
    const mode =
      getContentTypeFromMode(gameMode.tag) === "Quotes"
        ? t.quotes
        : t.randomWords;
    const wordCount = getPhraseWordCount(phrase);
    const wordLabel = t.words;

    const details = [
      { label: "Language", value: language.nativeName },
      { label: "Mode", value: mode },
      { label: "Word length", value: `${wordCount} ${wordLabel}` },
    ];

    return (
      <dl
        aria-label="Race details"
        className="mb-3 grid min-h-9 grid-cols-3 gap-3 text-xs font-semibold tracking-wide text-secondary-foreground"
      >
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex min-w-0 items-center justify-center rounded-lg border border-border bg-card px-2 py-2"
          >
            <dt className="sr-only">{detail.label}</dt>
            <dd className="truncate">{detail.value}</dd>
          </div>
        ))}
      </dl>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
