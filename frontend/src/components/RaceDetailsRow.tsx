import { Quote, Dice5, Trophy } from "lucide-react";
import { memo } from "react";
import type { GameMode } from "../types/stdb";
import {
  getContentTypeFromMode,
  getLanguageInfoFromMode,
} from "../utils/modes";
import { getTranslations } from "../utils/translations";
import { getPhraseLength } from "../utils/phrase";
import { Box } from "./Box";

interface RaceDetailsRowProps {
  gameMode: GameMode;
  phrase: string;
  attribution?: string;
  isPersonalRecord?: boolean;
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
    const phraseLength = getPhraseLength(phrase);
    const description = isQuote
      ? t.quoteDescription(phraseLength, language, attribution)
      : t.randomWordsDescription(phraseLength, language);
    const ModeIcon = isQuote ? Quote : Dice5;

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
