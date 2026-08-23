import { Quote, Dices, Trophy } from "lucide-react";
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
  attribution?: string;
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
  ({
    gameMode,
    phrase,
    attribution,
    isPersonalRecord = false,
  }: RaceDetailsRowProps) => {
    const language = getLanguageInfoFromMode(gameMode.tag);
    const t = getTranslations();
    const isQuote = getContentTypeFromMode(gameMode.tag) === "Quotes";
    const wordCount = getPhraseWordCount(phrase);
    const description = isQuote
      ? `${wordCount} ${t.words}, ${language.nativeName} ${t.quote}${attribution ? ` ${t.by} “${attribution}”` : ""}`
      : `${wordCount} ${language.nativeName} ${t.randomWords.toLocaleLowerCase(language.htmlLang)}`;
    const ModeIcon = isQuote ? Quote : Dices;

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
        <p
          aria-label="Race details"
          className={`flex min-h-9 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs font-medium tracking-wide ${isPersonalRecord ? "border-accent-primary/40 bg-accent-primary/10 text-accent-primary" : "border-border bg-card text-muted-foreground"}`}
        >
          <ModeIcon
            aria-hidden
            data-mode-icon={isQuote ? "quote" : "random-words"}
            className="h-3.5 w-3.5 shrink-0"
          />
          <span>{description}</span>
        </p>
      </div>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
