import { useEffect, useMemo, useState } from "react";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { useDatabase } from "../../contexts/SpacetimeContext";
import type { GameHighScore, GameScore } from "../../types/stdb";

type ScoreLeaderboardsProps = {
  gameId: string;
  language: string;
};

type LeaderboardQueryValues = {
  gameId: string;
  language: string;
  day: string;
};

const GAME_ID_PATTERN = /^[a-z0-9_]+$/;
const LANGUAGE_PATTERN = /^[a-z0-9_-]+$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getUtcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeSqlString(value: string): string {
  return value.replaceAll("'", "''");
}

function getLeaderboardQueryValues(gameId: string, language: string, day: string): LeaderboardQueryValues | null {
  if (!GAME_ID_PATTERN.test(gameId) || !LANGUAGE_PATTERN.test(language) || !DAY_PATTERN.test(day)) {
    return null;
  }
  return {
    gameId: escapeSqlString(gameId),
    language: escapeSqlString(language),
    day: escapeSqlString(day),
  };
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
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scores yet.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-[28px_28px_1fr_auto] items-center gap-2 py-1 text-sm"
            >
              {index < 3 ? (
                <div aria-hidden="true" />
              ) : (
                <span className="text-muted-foreground tabular-nums text-right">
                  {index + 1}
                </span>
              )}
              {index < 3 ? (
                <PlayerAvatar
                  size={22}
                  identity={row.playerId.toHexString()}
                  placement={index + 1}
                />
              ) : (
                <div aria-hidden="true" />
              )}
              <span className="text-foreground truncate">
                {row.playerName}
              </span>
              <span className="text-accent-primary tabular-nums">
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
  const [day, setDay] = useState(getUtcDay);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [highScores, setHighScores] = useState<GameHighScore[]>([]);

  useEffect(() => {
    const now = new Date();
    const nextDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const timeout = setTimeout(() => {
      setDay(getUtcDay());
    }, nextDay - Date.now());
    return () => clearTimeout(timeout);
  }, [day]);

  useEffect(() => {
    const queryValues = getLeaderboardQueryValues(gameId, language, day);
    if (!conn || !queryValues) return;

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
        `SELECT * FROM game_score WHERE GameId = '${queryValues.gameId}' AND Language = '${queryValues.language}' AND Day = '${queryValues.day}'`,
        `SELECT * FROM game_highscore WHERE GameId = '${queryValues.gameId}' AND Language = '${queryValues.language}'`,
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
    <section className="grid grid-cols-2 gap-8">
      <LeaderboardTable title="Top scores today" rows={dailyScores} />
      <LeaderboardTable title="All-time high scores" rows={allTimeScores} />
    </section>
  );
};
