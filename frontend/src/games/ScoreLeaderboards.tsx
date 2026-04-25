import { useEffect, useMemo, useState } from "react";
import { useDatabase } from "../contexts/SpacetimeContext";
import type { HighScore, Score } from "../types/stdb";

type LeaderboardEntry = {
  id: string;
  playerId: string;
  score: number;
  timeMs: bigint;
  timestamp: bigint;
};

type ScoreLeaderboardsProps = {
  gameId: string;
};

const MAX_ROWS = 10;
const DAY_MICROSECONDS = 86_400_000_000n;

function getPlayerLabel(playerId: string): string {
  if (playerId.length <= 12) return playerId;
  return `${playerId.slice(0, 6)}…${playerId.slice(-4)}`;
}

function formatTime(timeMs: bigint): string {
  const seconds = Number(timeMs / 1000n);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeMs < b.timeMs) return -1;
    if (a.timeMs > b.timeMs) return 1;
    if (a.timestamp < b.timestamp) return 1;
    if (a.timestamp > b.timestamp) return -1;
    return 0;
  });
}

function scoreToEntry(row: Score): LeaderboardEntry {
  return {
    id: row.id,
    playerId: row.playerId.toHexString(),
    score: row.value,
    timeMs: row.timeMs,
    timestamp: row.timestamp,
  };
}

function highScoreToEntry(row: HighScore): LeaderboardEntry {
  return {
    id: row.id,
    playerId: row.playerId.toHexString(),
    score: row.value,
    timeMs: row.timeMs,
    timestamp: row.timestamp,
  };
}

function LeaderboardTable({
  title,
  entries,
}: {
  title: string;
  entries: LeaderboardEntry[];
}) {
  return (
    <div className="box p-4 min-h-[240px]">
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scores yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-[32px_1fr_auto_auto] gap-3 items-center text-sm"
            >
              <span className="text-muted-foreground tabular-nums">
                #{index + 1}
              </span>
              <span className="text-foreground truncate">
                {getPlayerLabel(entry.playerId)}
              </span>
              <span className="text-[#f9e2af] font-semibold tabular-nums">
                {entry.score}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatTime(entry.timeMs)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ScoreLeaderboards = ({ gameId }: ScoreLeaderboardsProps) => {
  const conn = useDatabase();
  const [scores, setScores] = useState<Score[]>([]);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    if (!conn) return;

    const refreshScores = () => {
      setScores(Array.from(conn.db.score.GameId.filter(gameId)));
    };
    const refreshHighScores = () => {
      setHighScores(Array.from(conn.db.highscore.GameId.filter(gameId)));
    };

    conn.db.score.onInsert(refreshScores);
    conn.db.score.onDelete(refreshScores);
    conn.db.highscore.onInsert(refreshHighScores);
    conn.db.highscore.onUpdate(refreshHighScores);
    conn.db.highscore.onDelete(refreshHighScores);

    const escapedGameId = gameId.replaceAll("'", "''");
    const subscription = conn.subscriptionBuilder()
      .onApplied(() => {
        refreshScores();
        refreshHighScores();
      })
      .subscribe([
        `SELECT * FROM score WHERE GameId = '${escapedGameId}'`,
        `SELECT * FROM highscore WHERE GameId = '${escapedGameId}'`,
      ]);

    return () => {
      conn.db.score.removeOnInsert(refreshScores);
      conn.db.score.removeOnDelete(refreshScores);
      conn.db.highscore.removeOnInsert(refreshHighScores);
      conn.db.highscore.removeOnUpdate(refreshHighScores);
      conn.db.highscore.removeOnDelete(refreshHighScores);
      subscription.unsubscribe();
    };
  }, [conn, gameId]);

  const dailyEntries = useMemo(() => {
    const cutoff = BigInt(Date.now()) * 1000n - DAY_MICROSECONDS;
    return sortEntries(scores.filter((row) => row.timestamp >= cutoff).map(scoreToEntry)).slice(0, MAX_ROWS);
  }, [scores]);

  const allTimeEntries = useMemo(() => {
    return sortEntries(highScores.map(highScoreToEntry)).slice(0, MAX_ROWS);
  }, [highScores]);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <LeaderboardTable title="Top scores today" entries={dailyEntries} />
      <LeaderboardTable title="All-time high scores" entries={allTimeEntries} />
    </section>
  );
};
