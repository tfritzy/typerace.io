import { useEffect, useMemo, useState } from "react";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { useDatabase } from "../../contexts/SpacetimeContext";
import type { GameHighScore, GameScore } from "../../types/stdb";

type ScoreLeaderboardsProps = {
  gameId: string;
  language: string;
};

function getUtcDay(): string {
  return new Date().toISOString().slice(0, 10);
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
    <div className="box p-4 min-h-[240px]">
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scores yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-[32px_32px_1fr_auto] gap-3 items-center text-sm"
            >
              <span className="text-muted-foreground tabular-nums">
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
                {row.value}
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
  const [day, setDay] = useState(getUtcDay);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [highScores, setHighScores] = useState<GameHighScore[]>([]);

  useEffect(() => {
    const scheduleNextDay = () => {
      const now = new Date();
      const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      return setTimeout(() => {
        setDay(getUtcDay());
      }, nextDay - now.getTime());
    };

    const timeout = scheduleNextDay();
    return () => clearTimeout(timeout);
  }, [day]);

  useEffect(() => {
    if (!conn) return;

    const refreshScores = () => {
      setScores(Array.from(conn.db.gameScore.GameId_Language_Day.filter([gameId, language, day])));
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
        `SELECT * FROM game_score WHERE GameId = '${gameId}' AND Language = '${language}' AND Day = '${day}'`,
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
  }, [conn, day, gameId, language]);

  const dailyScores = useMemo(() => sortByScore(scores), [scores]);
  const allTimeScores = useMemo(() => sortByScore(highScores), [highScores]);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <LeaderboardTable title="Top scores today" rows={dailyScores} />
      <LeaderboardTable title="All-time high scores" rows={allTimeScores} />
    </section>
  );
};
