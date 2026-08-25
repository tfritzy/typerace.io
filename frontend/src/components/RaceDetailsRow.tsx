import { Dice5, Languages, Quote, RulerDimensionLine } from "lucide-react";
import { memo } from "react";
import type { GameMode } from "../types/stdb";
import { getLanguageInfoFromMode } from "../utils/modes";
import { getPhraseLength } from "../utils/phrase";
import { getTranslations } from "../utils/translations";

interface RaceDetailsRowProps {
  gameMode: GameMode;
  phrase: string;
  attribution?: string;
}

export const RaceDetailsRow = memo(
  ({ gameMode, phrase, attribution }: RaceDetailsRowProps) => {
    const language = getLanguageInfoFromMode(gameMode.tag);
    const t = getTranslations();
    const phraseLength = getPhraseLength(phrase);
    const isQuote = gameMode.tag.endsWith("Quotes");
    const ModeIcon = isQuote ? Quote : Dice5;
    const modeIconKind = isQuote ? "quote" : "random-words";
    const modeLabel = isQuote ? t.quoteAttribution(attribution) : t.randomWords;

    return (
      <dl
        aria-label="Race details"
        className="mb-3 grid min-h-11 grid-cols-3 gap-3 text-xs font-semibold tracking-wide text-foreground"
      >
        <div className="box flex min-w-0 items-center justify-center rounded-lg px-2 py-2">
          <dt className="sr-only">Language</dt>
          <dd className="flex min-w-0 items-center justify-center gap-1">
            <Languages
              aria-hidden
              data-detail-icon="language"
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="truncate">{language.nativeName}</span>
          </dd>
        </div>
        <div className="box flex min-w-0 items-center justify-center rounded-lg px-2 py-2">
          <dt className="sr-only">Mode</dt>
          <dd className="flex min-w-0 items-center justify-center gap-1">
            <ModeIcon
              aria-hidden
              data-detail-icon={modeIconKind}
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="truncate">{modeLabel}</span>
          </dd>
        </div>
        <div className="box flex min-w-0 items-center justify-center rounded-lg px-2 py-2">
          <dt className="sr-only">Length</dt>
          <dd className="flex min-w-0 items-center justify-center gap-1">
            <RulerDimensionLine
              aria-hidden
              data-detail-icon="length"
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="truncate">
              {phraseLength} {t.wordCountUnit}
            </span>
          </dd>
        </div>
      </dl>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
