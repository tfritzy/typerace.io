import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { GameRecord } from "../types/stdb";
import { formatStopwatchTime, getOrdinalPlacement } from "../utils/formatters";
import { getGameModeLabel } from "../utils/modes";

interface RecentGamesProps {
  gameRecords: readonly GameRecord[];
}

interface RecentGameRowProps {
  game: GameRecord;
  onSelect: (gameId: string) => void;
}

const PAGE_SIZE = 5;

function compareMostRecent(a: GameRecord, b: GameRecord): number {
  return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
}

function formatGameType(type: string): string {
  return type === "Private" || type === "Practice" ? type : "Public";
}

function formatDuration(timeMs: bigint): string {
  return formatStopwatchTime(Number(timeMs) / 1_000);
}

function formatPlayedAt(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000);
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${time}`;
}

function RecentGameRow({ game, onSelect }: RecentGameRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(game.gameId)}
      aria-label={`View ${getGameModeLabel(game.gameMode.tag)} race played ${formatPlayedAt(game.date)}`}
      className="grid w-full min-w-[620px] cursor-pointer grid-cols-[1.4fr_.7fr_.8fr_.7fr_1.25fr] gap-4 border-0 border-b border-border bg-transparent px-2 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted"
    >
      <div>
        <div className="text-sm font-medium text-secondary-foreground">
          {getGameModeLabel(game.gameMode.tag)}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatGameType(game.gameType.tag)}
        </div>
      </div>
      <div className="self-center text-right font-semibold tabular-nums text-foreground">
        {Math.round(game.wpm)}{" "}
        <span className="text-[0.68rem] font-medium uppercase text-muted-foreground">
          wpm
        </span>
      </div>
      <div className="self-center text-right tabular-nums text-muted-foreground">
        {formatDuration(game.timeMs)}
      </div>
      <div className="flex items-center justify-end gap-1 self-center text-right text-muted-foreground">
        {game.placement === 1 && (
          <Star
            aria-hidden
            className="h-3.5 w-3.5 fill-accent-primary text-accent-primary"
          />
        )}
        <span>{getOrdinalPlacement(game.placement)}</span>
      </div>
      <div className="self-center text-right text-xs text-muted-foreground">
        {formatPlayedAt(game.date)}
      </div>
    </button>
  );
}

export function RecentGames({ gameRecords }: RecentGamesProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const openGame = (gameId: string) => navigate(`/game/${gameId}`);
  const sortedGames = useMemo(
    () => [...gameRecords].sort(compareMostRecent),
    [gameRecords],
  );
  const totalPages = Math.ceil(sortedGames.length / PAGE_SIZE);
  const firstItem = (currentPage - 1) * PAGE_SIZE;
  const currentGames = sortedGames.slice(firstItem, firstItem + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [gameRecords]);

  if (sortedGames.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No games played yet
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        {currentGames.map((game) => (
          <RecentGameRow
            key={game.id}
            game={game}
            onSelect={openGame}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded bg-muted px-3 py-1 text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="rounded bg-muted px-3 py-1 text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
