import { Trophy } from "lucide-react";
import { memo } from "react";
import type { PlayerProgress } from "../../types/stdb";
import { getFinalWpm, getRaceTime, getAccuracy } from "../../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../../utils/formatters";
import { getTranslations } from "../../utils/translations";
import type { ContentTypeValue } from "../../utils/modes";
import { ResultStatCard } from "./ResultStatCard";

interface PlayerStatsRowProps {
  playerProgress: PlayerProgress;
  raceStartTimestamp: bigint;
  placement: number;
  categoryLength: number;
  contentType: ContentTypeValue;
  isPersonalRecord?: boolean;
}

export const PlayerStatsRow = memo(
  ({
    playerProgress,
    raceStartTimestamp,
    placement,
    categoryLength,
    contentType,
    isPersonalRecord = false,
  }: PlayerStatsRowProps) => {
    const finalWpm = getFinalWpm(playerProgress);
    const raceTime = getRaceTime(playerProgress);
    const accuracy = getAccuracy(
      playerProgress.characterHistory,
      raceStartTimestamp,
    );
    const t = getTranslations();

    const isFirstPlace = placement === 1;
    const isPerfectAccuracy = accuracy === 100;
    const category = contentType === "RandomWords"
      ? `${categoryLength} ${t.word}`
      : t.quotes;
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
        <div className="grid min-h-[90px] grid-cols-2 gap-3 sm:grid-cols-5">
          <ResultStatCard
            label={t.place}
            value={getOrdinalPlacement(placement)}
            isAccent={isPersonalRecord || isFirstPlace}
          />
          <ResultStatCard
            label={t.wpm}
            value={Math.round(finalWpm)}
            isAccent={isPersonalRecord || isFirstPlace}
          />
          <ResultStatCard
            label={t.time}
            value={formatStopwatchTime(raceTime)}
            isAccent={isPersonalRecord || isFirstPlace}
          />
          <ResultStatCard
            label={t.accuracy}
            value={`${Math.round(accuracy)}%`}
            isAccent={isPersonalRecord || isPerfectAccuracy}
          />
          <ResultStatCard
            label={t.category}
            value={category}
            isAccent={isPersonalRecord || isFirstPlace}
          />
        </div>
      </div>
    );
  },
);

PlayerStatsRow.displayName = "PlayerStatsRow";
