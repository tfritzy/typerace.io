import { useState } from "react";
import type { PlayerProgress } from "../../module_bindings/player_progress_type";
import { RaceResultsChart } from "./RaceResultsChart";
import { PlayerAvatar } from "./PlayerAvatar";
import { getFinalWpm, getRaceTime, getAccuracy } from "../utils/wpmCalculator";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";

interface RaceResultsProps {
    playerProgress?: PlayerProgress;
    allPlayerProgress: PlayerProgress[];
    raceStartTimestamp: bigint;
    placement?: number;
}

export const RaceResults = ({
    playerProgress,
    allPlayerProgress,
    raceStartTimestamp,
    placement
}: RaceResultsProps) => {
    const defaultPlayerId = playerProgress?.playerId.toHexString() || allPlayerProgress[0]?.playerId.toHexString() || '';
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(defaultPlayerId);

    const selectedPlayerProgress = allPlayerProgress.find(
        pp => pp.playerId.toHexString() === selectedPlayerId
    ) || allPlayerProgress[0];

    if (!selectedPlayerProgress || allPlayerProgress.length === 0) {
        return null;
    }

    const finalWpm = playerProgress ? getFinalWpm(playerProgress) : 0;
    const raceTime = playerProgress ? getRaceTime(playerProgress) : 0;
    const accuracy = playerProgress ? getAccuracy(playerProgress.characterHistory, raceStartTimestamp) : 0;

    const isFirstPlace = placement === 1;
    const isPerfectAccuracy = accuracy === 100;
    const isHighWpm = finalWpm >= 100;

    return (
        <div className="w-full animate-slideUpFadeIn">
            {playerProgress && (
            <div className="flex gap-3 mb-3 items-stretch min-h-[100px]">
                <div className="flex-1 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
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

                <div className="flex-1 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
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

                <div className="flex-1 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
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

                <div className="flex-1 border rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--color-box-bg)', borderColor: 'var(--color-box-border)' }}>
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
            )}

            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-box-bg)', border: '1px solid var(--color-box-border)' }}>
                {allPlayerProgress.length > 1 && (
                    <div className="flex gap-3 mb-3 flex-wrap">
                        {allPlayerProgress.map((pp) => {
                            const isSelected = selectedPlayerId === pp.playerId.toHexString();
                            return (
                                <button
                                    key={pp.playerId.toHexString()}
                                    onClick={() => setSelectedPlayerId(pp.playerId.toHexString())}
                                    className="px-3 py-2 border rounded-md text-[13px] font-semibold cursor-pointer transition-all duration-200 tracking-wide flex items-center gap-2"
                                    style={{
                                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        color: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)',
                                        borderColor: 'var(--color-box-border)'
                                    }}
                                >
                                    <PlayerAvatar
                                        size={24}
                                        identity={pp.playerId.toHexString()}
                                        color={pp.playerColor}
                                    />
                                    {pp.playerName}
                                </button>
                            );
                        })}
                    </div>
                )}

                <RaceResultsChart
                    playerProgress={selectedPlayerProgress}
                    raceStartTimestamp={raceStartTimestamp}
                    playerColor={selectedPlayerProgress.playerColor}
                />
            </div>
        </div>
    );
};
