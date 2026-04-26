import { useEffect, useMemo, useState } from "react";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { useDatabase } from "../../contexts/SpacetimeContext";
import type { GameHighScore, GameScore } from "../../types/stdb";

type ScoreLeaderboardsProps = {
  gameId: string;
  language: string;
};

const RECENT_SCORE_WINDOW_US = 86_400_000_000n;

function getRecentScoreCutoff(): bigint {
  return BigInt(Date.now()) * 1000n - RECENT_SCORE_WINDOW_US;
}

function sortByScore<T extends GameScore | GameHighScore>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.value - a.value);
}

function LeaderboardTable<T extends GameScore | GameHighScore>({
  title,
  rows,
}: {
  title: string;
  rows: T[];
}) {
  return (
    <div className="min-h-[280px] rounded-2xl border border-white/10 bg-[#111827]/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="rounded-full border border-[#f9e2af]/30 bg-[#f9e2af]/10 px-3 py-1 text-xs font-semibold text-[#f9e2af]">
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10">
          <p className="text-sm text-muted-foreground">No scores yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-[40px_32px_1fr_auto] items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
            >
              <span className="rounded-full bg-black/20 py-1 text-center text-muted-foreground tabular-nums">
                #{index + 1}
              </span>
              {index < 3 ? (
                <PlayerAvatar
                  size={28}
                  identity={row.playerId.toHexString()}
                  placement={index + 1}
                />
              ) : (
                <div aria-hidden="true" />
              )}
              <span className="text-foreground truncate">
                {row.playerName}
              </span>
              <span className="text-[#f9e2af] font-semibold tabular-nums">
                {row.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ScoreLeaderboards = ({ gameId, language }: ScoreLeaderboardsProps) => {
  const conn = useDatabase();
  const [recentCutoff, setRecentCutoff] = useState(getRecentScoreCutoff);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [highScores, setHighScores] = useState<GameHighScore[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentCutoff(getRecentScoreCutoff());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!conn) return;

    const refreshScores = () => {
      setScores(Array.from(conn.db.gameScore.GameId_Language.filter([gameId, language])).filter((row) => row.timestamp >= recentCutoff));
    };
    const refreshHighScores = () => {
      setHighScores(Array.from(conn.db.gameHighscore.GameId_Language.filter([gameId, language])));
    };
    const refresh = () => {
      refreshScores();
      refreshHighScores();
    };

    conn.db.gameScore.onInsert(refresh);
    conn.db.gameScore.onUpdate(refresh);
    conn.db.gameScore.onDelete(refresh);
    conn.db.gameHighscore.onInsert(refresh);
    conn.db.gameHighscore.onUpdate(refresh);
    conn.db.gameHighscore.onDelete(refresh);

    const subscription = conn.subscriptionBuilder()
      .onApplied(refresh)
      .subscribe([
        `SELECT * FROM game_score WHERE GameId = '${gameId}' AND Language = '${language}' AND Timestamp >= ${recentCutoff}`,
        `SELECT * FROM game_highscore WHERE GameId = '${gameId}' AND Language = '${language}'`,
      ]);

    return () => {
      conn.db.gameScore.removeOnInsert(refresh);
      conn.db.gameScore.removeOnUpdate(refresh);
      conn.db.gameScore.removeOnDelete(refresh);
      conn.db.gameHighscore.removeOnInsert(refresh);
      conn.db.gameHighscore.removeOnUpdate(refresh);
      conn.db.gameHighscore.removeOnDelete(refresh);
      subscription.unsubscribe();
    };
  }, [conn, recentCutoff, gameId, language]);

  const dailyScores = useMemo(() => sortByScore(scores), [scores]);
  const allTimeScores = useMemo(() => sortByScore(highScores), [highScores]);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <LeaderboardTable title="Top scores last 24h" rows={dailyScores} />
      <LeaderboardTable title="All-time high scores" rows={allTimeScores} />
    </section>
  );
};
