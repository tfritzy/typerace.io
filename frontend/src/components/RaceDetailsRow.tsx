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
        {isPersonalRecord && (
          <div
            role="status"
            className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-4 py-3 text-accent-primary"
          >
            <Trophy aria-hidden className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              {t.newPersonalRecord}
            </span>
          </div>
        )}
        <dl
          aria-label="Race details"
          className={`grid min-h-9 grid-cols-3 gap-3 text-xs font-semibold tracking-wide ${isPersonalRecord ? "text-accent-primary" : "text-secondary-foreground"}`}
        >
          {details.map((detail) => (
            <div
              key={detail.label}
              data-race-detail
              className={`flex min-w-0 items-center justify-center rounded-lg border px-2 py-2 ${isPersonalRecord ? "border-accent-primary/40 bg-accent-primary/10" : "border-border bg-card"}`}
            >
              <dt className="sr-only">{detail.label}</dt>
              <dd className="truncate">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
