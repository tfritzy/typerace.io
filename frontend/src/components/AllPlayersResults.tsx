import { useState } from "react";
import type { PlayerProgress } from "../types/stdb";
import { RaceResultsChart } from "./RaceResultsChart";
import { PlayerAvatar } from "./PlayerAvatar";
import { useDatabase } from "../contexts/SpacetimeContext";

interface AllPlayersResultsProps {
  allPlayerProgress: PlayerProgress[];
  raceStartTimestamp: bigint;
  initialSelectedPlayerId?: string;
  isPersonalRecord?: boolean;
}

export const AllPlayersResults = ({
  allPlayerProgress,
  raceStartTimestamp,
  initialSelectedPlayerId,
  isPersonalRecord = false,
}: AllPlayersResultsProps) => {
  const { conn } = useDatabase();
  const defaultPlayerId =
    initialSelectedPlayerId ??
    allPlayerProgress[0]?.playerId.toHexString() ??
    "";
  const [selectedPlayerId, setSelectedPlayerId] =
    useState<string>(defaultPlayerId);

  if (allPlayerProgress.length === 0) return null;

  const selectedPlayerProgress =
    allPlayerProgress.find(
      (progress) => progress.playerId.toHexString() === selectedPlayerId,
    ) ?? allPlayerProgress[0];

  const currentPlayerId = conn?.identity;
  const isSelectedCurrentPlayer = !!(
    currentPlayerId && selectedPlayerProgress.playerId.isEqual(currentPlayerId)
  );

  return (
    <div
      className={`rounded-lg border p-3 ${isPersonalRecord ? "border-accent-primary/40 bg-accent-primary/10" : "border-border bg-card"}`}
    >
      {allPlayerProgress.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {allPlayerProgress.map((progress) => {
            const playerId = progress.playerId.toHexString();
            const isSelected = selectedPlayerId === playerId;
            const isCurrentPlayer = !!(
              currentPlayerId && progress.playerId.isEqual(currentPlayerId)
            );
            return (
              <button
                key={playerId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedPlayerId(playerId)}
                className={`flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 ${isSelected ? "bg-secondary text-secondary-foreground" : "bg-transparent text-muted-foreground"}`}
              >
                <PlayerAvatar
                  size={24}
                  identity={playerId}
                  playerColorTag={
                    isCurrentPlayer ? undefined : progress.playerColor?.tag
                  }
                  isBot={progress.isBot}
                />
                {progress.playerName}
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
