import { Dice5, Languages, Quote, Ruler, Trophy } from "lucide-react";
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
    const ModeIcon = isQuote ? Quote : Dice5;
    const quoteLabel = `${t.quote.charAt(0).toLocaleUpperCase()}${t.quote.slice(1)}`;
    const mode = isQuote
      ? `${quoteLabel}${attribution ? ` ${t.by} “${attribution}”` : ""}`
      : t.randomWords;

    const details = [
      {
        label: "Length",
        value: `${phraseLength} ${t.words}`,
        icon: Ruler,
        iconKind: "length",
      },
      {
        label: "Mode",
        value: mode,
        icon: ModeIcon,
        iconKind: isQuote ? "quote" : "random-words",
      },
      {
        label: "Language",
        value: language.nativeName,
        icon: Languages,
        iconKind: "language",
      },
    ];

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
        <dl
          aria-label="Race details"
          className="grid min-h-11 grid-cols-3 gap-3 text-xs font-semibold tracking-wide"
        >
          {details.map((detail) => {
            const DetailIcon = detail.icon;

            return (
              <Box
                asChild
                key={detail.label}
                tone={isPersonalRecord ? "accent" : "default"}
                className="flex min-w-0 items-center justify-center rounded-lg px-2 py-2"
              >
                <div>
                  <dt className="sr-only">{detail.label}</dt>
                  <dd className="flex min-w-0 items-center justify-center gap-2">
                    {DetailIcon && (
                      <DetailIcon
                        aria-hidden
                        data-detail-icon={detail.iconKind}
                        className="h-3.5 w-3.5 shrink-0"
                      />
                    )}
                    <span className="truncate">{detail.value}</span>
                  </dd>
                </div>
              </Box>
            );
          })}
        </dl>
      </div>
    );
  },
);

RaceDetailsRow.displayName = "RaceDetailsRow";
