import { useState } from "react";
import type { PlayerProgress } from "../types/stdb";
import { RaceResultsChart } from "./RaceResultsChart";
import { PlayerAvatar } from "./PlayerAvatar";
import { useDatabase } from "../contexts/SpacetimeContext";

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
    const { conn } = useDatabase();
    if (!allPlayerProgress || allPlayerProgress.length === 0) {
        return null;
    }

    const defaultPlayerId = initialSelectedPlayerId || allPlayerProgress[0].playerId.toHexString();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(defaultPlayerId);

    const selectedPlayerProgress = allPlayerProgress.find(
        pp => pp.playerId.toHexString() === selectedPlayerId
    ) || allPlayerProgress[0];

    const currentPlayerId = conn?.identity;
    const isSelectedCurrentPlayer = !!(currentPlayerId && selectedPlayerProgress.playerId.isEqual(currentPlayerId));

    return (
        <div className="rounded-lg p-3 bg-card border border-border">
            {allPlayerProgress.length > 1 && (
                <div className="flex gap-3 mb-3 flex-wrap">
                    {allPlayerProgress.map((pp) => {
                        const isSelected = selectedPlayerId === pp.playerId.toHexString();
                        const isCurrentPlayer = !!(currentPlayerId && pp.playerId.isEqual(currentPlayerId));
                        return (
                            <button
                                key={pp.playerId.toHexString()}
                                onClick={() => setSelectedPlayerId(pp.playerId.toHexString())}
                                className={`px-3 py-2 border rounded-md text-[13px] font-semibold cursor-pointer transition-all duration-200 tracking-wide flex items-center gap-2 border-border ${isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-transparent text-muted-foreground'}`}
                            >
                                <PlayerAvatar
                                    size={24}
                                    identity={pp.playerId.toHexString()}
                                    playerColorTag={isCurrentPlayer ? undefined : pp.playerColor?.tag}
                                    isBot={pp.isBot}
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
                isCurrentPlayer={isSelectedCurrentPlayer}
            />
        </div>
    );
};
