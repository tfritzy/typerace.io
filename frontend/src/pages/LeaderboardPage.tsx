import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getDefaultSiteTitle } from "../utils/modes";
import { PlayerAvatar } from "../components/PlayerAvatar";
import type { Player } from "../types/stdb";

type LeaderboardPlayer = Pick<
  Player,
  "identity" | "playerId" | "name" | "level" | "xp" | "totalGames" | "wins"
>;

const comparePlayers = (a: LeaderboardPlayer, b: LeaderboardPlayer) => {
  if (a.level !== b.level) return b.level - a.level;
  if (a.xp !== b.xp) return b.xp - a.xp;
  return a.playerId.localeCompare(b.playerId);
};

export const LeaderboardPage = () => {
  const { conn } = useDatabase();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    document.title = "Leaderboard - TypeRace.io";
    return () => {
      document.title = getDefaultSiteTitle();
    };
  }, []);

  useEffect(() => {
    if (!conn) return;

    const db = conn.db.topPlayersByLevel;
    const sortPlayers = (list: LeaderboardPlayer[]) =>
      [...list].sort(comparePlayers);

    // Upsert by playerId: rows can be re-applied by resubscriptions and view
    // updates arrive as delete+insert since the view has no primary key.
    const upsert = (player: LeaderboardPlayer) => {
      setPlayers((prev) => {
        const next = prev.some((p) => p.playerId === player.playerId)
          ? prev.map((p) => (p.playerId === player.playerId ? player : p))
          : [...prev, player];
        return sortPlayers(next);
      });
    };
    const remove = (player: LeaderboardPlayer) => {
      setPlayers((prev) =>
        prev.filter((p) => p.playerId !== player.playerId),
      );
    };

    const handleInsert = (_ctx: unknown, player: LeaderboardPlayer) =>
      upsert(player);
    const handleDelete = (_ctx: unknown, player: LeaderboardPlayer) =>
      remove(player);
    const handleUpdate = (
      _ctx: unknown,
      _oldPlayer: LeaderboardPlayer,
      newPlayer: LeaderboardPlayer,
    ) => upsert(newPlayer);

    db.onInsert(handleInsert);
    db.onDelete(handleDelete);
    db.onUpdate(handleUpdate);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(() => {
        setPlayers(sortPlayers(Array.from(db.iter())));
      })
      .subscribe(["SELECT * FROM topPlayersByLevel"]);

    return () => {
      db.removeOnInsert(handleInsert);
      db.removeOnDelete(handleDelete);
      db.removeOnUpdate(handleUpdate);
      subscription.unsubscribe();
    };
  }, [conn]);

  return (
    <main className="flex-1 px-4 py-8">
      <div className="content-container">
        <section className="box box-shadow rounded-lg p-6 text-foreground">
          <h1 className="mb-2 text-3xl font-bold">Leaderboard</h1>
          <p className="mb-6 text-muted-foreground">
            The highest level players
          </p>
          {players.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              {conn ? "No players on the leaderboard yet" : "Connecting…"}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {players.map((player, index) => (
                <li
                  key={player.playerId}
                  role="link"
                  tabIndex={0}
                  aria-label={`View profile ${player.name}`}
                  onClick={() => navigate(`/profile/${player.playerId}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(`/profile/${player.playerId}`);
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent-primary"
                >
                  <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <PlayerAvatar
                    size={40}
                    identity={player.identity.toHexString()}
                    isHighlighted
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-sm font-semibold text-foreground"
                      title={player.name}
                    >
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Level {player.level}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div>
                      {player.wins} win{player.wins === 1 ? "" : "s"}
                    </div>
                    <div>
                      {player.totalGames} game
                      {player.totalGames === 1 ? "" : "s"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
