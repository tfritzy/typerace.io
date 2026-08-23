import { Quote, Dices, Trophy } from "lucide-react";
import { memo } from "react";
import type { GameMode } from "../types/stdb";
import {
  getContentTypeFromMode,
  getLanguageInfoFromMode,
} from "../utils/modes";
import { getTranslations } from "../utils/translations";
import { Box } from "./Box";

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
      ? t.quoteDescription(wordCount, language.nativeName, attribution)
      : t.randomWordsDescription(wordCount, language.nativeName);
    const ModeIcon = isQuote ? Quote : Dices;

    return (
      <div className="mb-3">
        {isPersonalRecord && (
          <Box
            role="status"
            tone="accent"
            className="mb-3 flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2"
          >
            <Trophy aria-hidden className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              {t.newPersonalRecord}
            </span>
          </Box>
        )}
        <Box
          asChild
          tone={isPersonalRecord ? "accent" : "default"}
          className={`flex min-h-11 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg px-3 py-2 text-xs font-medium tracking-wide ${isPersonalRecord ? "" : "text-muted-foreground"}`}
        >
          <p aria-label="Race details">
            <ModeIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
            <span>{description}</span>
          </p>
        </Box>
      </div>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
