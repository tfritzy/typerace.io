import { memo } from "react";
import type { PlayerProgress } from "../../types/stdb";
import { getFinalWpm, getRaceTime, getAccuracy } from "../../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../../utils/formatters";
import { getTranslations } from "../../utils/translations";
import { ResultStatCard } from "./ResultStatCard";

interface PlayerStatsRowProps {
  playerProgress: PlayerProgress;
  raceStartTimestamp: bigint;
  placement: number;
  isPersonalRecord?: boolean;
}

export const PlayerStatsRow = memo(
  ({
    playerProgress,
    raceStartTimestamp,
    placement,
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
    const isHighWpm = finalWpm >= 100;
    return (
      <div className="mb-3">
        <div className="grid min-h-[90px] grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultStatCard
            label={t.place}
            value={getOrdinalPlacement(placement)}
            isAccent={isPersonalRecord || isFirstPlace}
          />
          <ResultStatCard
            label={t.wpm}
            value={Math.round(finalWpm)}
            isAccent={isPersonalRecord || isHighWpm}
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
        </div>
      </div>
    );
  },
);

PlayerStatsRow.displayName = "PlayerStatsRow";
