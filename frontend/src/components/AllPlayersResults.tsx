import { useState } from "react";
import type { PlayerProgress } from "../types/stdb";
import { RaceResultsChart } from "./RaceResultsChart";
import { PlayerAvatar } from "./PlayerAvatar";

interface AllPlayersResultsProps {
    allPlayerProgress: PlayerProgress[];
    raceStartTimestamp: bigint;
    initialSelectedPlayerId?: string;
}

export const AllPlayersResults = ({
    allPlayerProgress,
    raceStartTimestamp,
    initialSelectedPlayerId
}: AllPlayersResultsProps) => {
    if (!allPlayerProgress || allPlayerProgress.length === 0) {
        return null;
    }

    const defaultPlayerId = initialSelectedPlayerId || allPlayerProgress[0].playerId.toHexString();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(defaultPlayerId);

    const selectedPlayerProgress = allPlayerProgress.find(
        pp => pp.playerId.toHexString() === selectedPlayerId
    ) || allPlayerProgress[0];

    return (
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
                                    backgroundColor: isSelected ? '#363636' : 'transparent',
                                    color: isSelected ? '#f2f2f2' : '#888888',
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
    );
};
