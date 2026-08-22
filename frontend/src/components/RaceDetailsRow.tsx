import { Trophy } from "lucide-react";
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
  isPersonalRecord?: boolean;
}

export function getPhraseWordCount(phrase: string): number {
  const trimmedPhrase = phrase.trim();
  if (!trimmedPhrase) return 0;
  return /\s/u.test(trimmedPhrase)
    ? trimmedPhrase.split(/\s+/u).length
    : Array.from(trimmedPhrase).length;
}

export const RaceDetailsRow = memo(
  ({ gameMode, phrase, isPersonalRecord = false }: RaceDetailsRowProps) => {
    const language = getLanguageInfoFromMode(gameMode.tag);
    const t = getTranslations();
    const mode =
      getContentTypeFromMode(gameMode.tag) === "Quotes"
        ? t.quotes
        : t.randomWords;
    const wordCount = getPhraseWordCount(phrase);
    const wordLabel = t.words;

    const details = [
      { label: "Word length", value: `${wordCount} ${wordLabel}` },
      { label: "Language", value: language.nativeName },
      { label: "Mode", value: mode },
    ];

    return (
      <div className="mb-3">
        <dl
          aria-label="Race details"
          className={`flex min-h-7 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium tracking-wide text-muted-foreground ${isPersonalRecord ? "mb-3" : ""}`}
        >
          {details.map((detail, index) => (
            <div
              key={detail.label}
              data-race-detail
              className={`flex min-w-0 items-center gap-2 ${index > 0 ? "before:content-['·'] before:text-muted-foreground" : ""}`}
            >
              <dt className="sr-only">{detail.label}</dt>
              <dd className="truncate">{detail.value}</dd>
            </div>
          ))}
        </dl>
        {isPersonalRecord && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-4 py-3 text-accent-primary"
          >
            <Trophy aria-hidden className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              {t.newPersonalRecord}
            </span>
          </div>
        )}
      </div>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
