import { type PlayerProgress } from "../types/stdb";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";
import { memo } from "react";
import { getTranslations } from "../utils/translations";

interface PlayerStatsRowProps {
  playerProgress: PlayerProgress;
  raceStartTimestamp: bigint;
  placement: number;
}

export const PlayerStatsRow = memo(
  ({ playerProgress, raceStartTimestamp, placement }: PlayerStatsRowProps) => {
    const finalWpm = getFinalWpm(playerProgress);
    const raceTime = getRaceTime(playerProgress);
    const accuracy = getAccuracy(
      playerProgress.characterHistory,
      raceStartTimestamp,
    );
    const t = getTranslations();

    const isFirstPlace = placement === 1;
    const isPerfectAccuracy = accuracy === 100;
    const isHighWpm = finalWpm >= 100;

    return (
      <div className="flex gap-3 mb-3 items-stretch min-h-[100px] flex-wrap">
        <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 bg-card border-border">
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold ${isHighWpm ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.wpm}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isHighWpm ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {Math.round(finalWpm)}
          </div>
        </div>

        <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 bg-card border-border">
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold ${isFirstPlace ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.time}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isFirstPlace ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {formatStopwatchTime(raceTime)}
          </div>
        </div>

        <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 bg-card border-border">
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold ${isFirstPlace ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.place}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isFirstPlace ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {getOrdinalPlacement(placement)}
          </div>
        </div>

        <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 bg-card border-border">
          <div
            className={`text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold ${isPerfectAccuracy ? "text-accent-primary" : "text-muted-foreground"}`}
          >
            {t.accuracy}
          </div>
          <div
            className={`text-4xl font-bold leading-none font-mono ${isPerfectAccuracy ? "text-accent-primary" : "text-secondary-foreground"}`}
          >
            {Math.round(accuracy)}%
          </div>
        </div>
      </div>
    );
  },
);

PlayerStatsRow.displayName = "PlayerStatsRow";
