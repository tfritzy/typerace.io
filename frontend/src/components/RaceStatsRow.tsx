import { type PlayerProgress } from "../types/stdb";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";
import { memo } from "react";
import { getTranslations } from "../utils/translations";

interface RaceStatsRowProps {
  playerProgress: PlayerProgress;
  raceStartTimestamp: bigint;
  isFinished: boolean;
}

const STAT_CARD_CLASS =
  "flex min-w-0 flex-col items-center justify-center rounded-lg border border-border bg-card p-3 transition-all duration-300";

export const RaceStatsRow = memo(
  ({ playerProgress, raceStartTimestamp, isFinished }: RaceStatsRowProps) => {
    const finalWpm = getFinalWpm(playerProgress);
    const raceTime = getRaceTime(playerProgress);
    const accuracy = getAccuracy(
      playerProgress.characterHistory,
      raceStartTimestamp,
    );
    const t = getTranslations();

    const isFirstPlace = isFinished && playerProgress.placement === 1;
    const isPerfectAccuracy = isFinished && accuracy === 100;
    const isHighWpm = isFinished && finalWpm >= 100;
    const unavailableFigure = "–";

    return (
      <div className="mb-3 grid min-h-[90px] grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={STAT_CARD_CLASS}>
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-1 font-semibold ${isFirstPlace ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.place}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isFirstPlace ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {isFinished
              ? getOrdinalPlacement(playerProgress.placement)
              : unavailableFigure}
          </div>
        </div>

        <div className={STAT_CARD_CLASS}>
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-1 font-semibold ${isHighWpm ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.wpm}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isHighWpm ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {isFinished ? Math.round(finalWpm) : unavailableFigure}
          </div>
        </div>

        <div className={STAT_CARD_CLASS}>
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-1 font-semibold ${isFirstPlace ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.time}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isFirstPlace ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {isFinished ? formatStopwatchTime(raceTime) : unavailableFigure}
          </div>
        </div>

        <div className={STAT_CARD_CLASS}>
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-1 font-semibold ${isPerfectAccuracy ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.accuracy}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isPerfectAccuracy ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {isFinished ? `${Math.round(accuracy)}%` : unavailableFigure}
          </div>
        </div>
      </div>
    );
  },
);

RaceStatsRow.displayName = "RaceStatsRow";
