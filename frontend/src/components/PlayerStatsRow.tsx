import type { PlayerProgress } from "../../module_bindings/player_progress_type";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";

interface PlayerStatsRowProps {
    playerProgress: PlayerProgress;
    raceStartTimestamp: bigint;
    placement: number;
}

export const PlayerStatsRow = ({
    playerProgress,
    raceStartTimestamp,
    placement
}: PlayerStatsRowProps) => {
    const finalWpm = getFinalWpm(playerProgress);
    const raceTime = getRaceTime(playerProgress);
    const accuracy = getAccuracy(playerProgress.characterHistory, raceStartTimestamp);

    const isFirstPlace = placement === 1;
    const isPerfectAccuracy = accuracy === 100;
    const isHighWpm = finalWpm >= 100;

    return (
        <div className="flex gap-3 mb-3 items-stretch min-h-[100px] flex-wrap">
            <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
                <div
                    className="text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold"
                    style={{ color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
                >
                    WPM
                </div>
                <div
                    className="text-4xl font-bold leading-none"
                    style={{ color: isHighWpm ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)' }}
                >
                    {Math.round(finalWpm)}
                </div>
            </div>

            <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
                <div
                    className="text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold"
                    style={{ color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
                >
                    Time
                </div>
                <div
                    className="text-4xl font-bold font-mono leading-none tracking-[0.02em]"
                    style={{ color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)' }}
                >
                    {formatStopwatchTime(raceTime)}
                </div>
            </div>

            <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
                <div
                    className="text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold"
                    style={{ color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
                >
                    Place
                </div>
                <div
                    className="text-4xl font-bold leading-none"
                    style={{ color: isFirstPlace ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)' }}
                >
                    {getOrdinalPlacement(placement)}
                </div>
            </div>

            <div className="basis-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] min-w-[140px] sm:basis-auto sm:max-w-none sm:flex-1 sm:min-w-0 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
                <div
                    className="text-[10px] uppercase tracking-[1.2px] mb-2 font-semibold"
                    style={{ color: isPerfectAccuracy ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
                >
                    Accuracy
                </div>
                <div
                    className="text-4xl font-bold leading-none"
                    style={{ color: isPerfectAccuracy ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.95)' }}
                >
                    {Math.round(accuracy)}%
                </div>
            </div>
        </div>
    );
};
