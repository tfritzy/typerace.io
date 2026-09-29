import { useEffect, useState } from "react";
import type { DbConnection, EventContext } from "../../module_bindings";
import type {
  GameRecord,
  PersonalRecord,
  Player,
  PlayerStreak,
  StatDistribution,
} from "../types/stdb";

interface ProfileData {
  player: Player | null;
  playerStreak: PlayerStreak | null;
  gameRecords: GameRecord[];
  personalRecords: PersonalRecord[];
  statDistributions: Map<StatDistribution["statType"], StatDistribution>;
  statValues: Map<string, number>;
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  return [...items.filter(({ id }) => id !== item.id), item];
}

function escapeSqlString(value: string): string {
  return value.replaceAll("'", "''");
}

export function useProfileData(
  conn: DbConnection | null,
  playerId: string | undefined,
): ProfileData {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStreak, setPlayerStreak] = useState<PlayerStreak | null>(null);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [statDistributions, setStatDistributions] = useState<
    Map<StatDistribution["statType"], StatDistribution>
  >(() => new Map());
  const [statValues, setStatValues] = useState(
    () =>
      new Map<string, number>([
        ["GamesPlayed", player?.totalGames || 0],
        ["Streaks", 0],
        ["WordsTyped", player?.totalWordsTyped || 0],
        ["Levels", player?.level || 0],
      ]),
  );

  useEffect(() => {
    setPlayer(null);
    if (!conn || !playerId) return;

    const resolvePlayer = () => {
      setPlayer(
        Array.from(conn.db.player.iter()).find(
          (candidate) => candidate.playerId === playerId,
        ) ?? null,
      );
    };
    const belongsToProfile = (candidate: Player) =>
      candidate.playerId === playerId;
    const handleInsert = (_ctx: EventContext, inserted: Player) => {
      if (belongsToProfile(inserted)) setPlayer(inserted);
    };
    const handleUpdate = (
      _ctx: EventContext,
      previous: Player,
      updated: Player,
    ) => {
      if (belongsToProfile(updated)) {
        setPlayer(updated);
      } else if (belongsToProfile(previous)) {
        setPlayer(null);
      }
    };
    const handleDelete = (_ctx: EventContext, deleted: Player) => {
      if (belongsToProfile(deleted)) setPlayer(null);
    };

    conn.db.player.onInsert(handleInsert);
    conn.db.player.onUpdate(handleUpdate);
    conn.db.player.onDelete(handleDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(resolvePlayer)
      .subscribe([
        `SELECT * FROM player WHERE PlayerId = '${escapeSqlString(playerId)}'`,
      ]);

    return () => {
      conn.db.player.removeOnInsert(handleInsert);
      conn.db.player.removeOnUpdate(handleUpdate);
      conn.db.player.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerId]);

  const playerIdentity = player?.identity.toHexString() ?? null;

  useEffect(() => {
    setPlayerStreak(null);
    if (!conn || !playerIdentity) return;

    const belongsToPlayer = (streak: PlayerStreak) =>
      streak.playerId.toHexString() === playerIdentity;
    const readStreak = () => {
      setPlayerStreak(
        Array.from(conn.db.playerstreak.iter()).find(belongsToPlayer) ?? null,
      );
    };
    const handleInsert = (_ctx: EventContext, streak: PlayerStreak) => {
      if (belongsToPlayer(streak)) setPlayerStreak(streak);
    };
    const handleUpdate = (
      _ctx: EventContext,
      previous: PlayerStreak,
      updated: PlayerStreak,
    ) => {
      if (belongsToPlayer(updated)) {
        setPlayerStreak(updated);
      } else if (belongsToPlayer(previous)) {
        setPlayerStreak(null);
      }
    };
    const handleDelete = (_ctx: EventContext, streak: PlayerStreak) => {
      if (belongsToPlayer(streak)) setPlayerStreak(null);
    };

    conn.db.playerstreak.onInsert(handleInsert);
    conn.db.playerstreak.onUpdate(handleUpdate);
    conn.db.playerstreak.onDelete(handleDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(readStreak)
      .subscribe([
        `SELECT * FROM playerstreak WHERE PlayerId = '${playerIdentity}'`,
      ]);

    return () => {
      conn.db.playerstreak.removeOnInsert(handleInsert);
      conn.db.playerstreak.removeOnUpdate(handleUpdate);
      conn.db.playerstreak.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerIdentity]);

  useEffect(() => {
    setGameRecords([]);
    if (!conn || !playerIdentity) return;

    const belongsToPlayer = (record: GameRecord) =>
      record.playerId.toHexString() === playerIdentity;
    const readRecords = () => {
      setGameRecords(
        Array.from(conn.db.gamerecord.iter()).filter(belongsToPlayer),
      );
    };
    const handleInsert = (_ctx: EventContext, record: GameRecord) => {
      if (belongsToPlayer(record)) {
        setGameRecords((previous) => upsertById(previous, record));
      }
    };
    const handleDelete = (_ctx: EventContext, record: GameRecord) => {
      if (belongsToPlayer(record)) {
        setGameRecords((previous) =>
          previous.filter(({ id }) => id !== record.id),
        );
      }
    };

    conn.db.gamerecord.onInsert(handleInsert);
    conn.db.gamerecord.onDelete(handleDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(readRecords)
      .subscribe([
        `SELECT * FROM gamerecord WHERE PlayerId = '${playerIdentity}'`,
      ]);

    return () => {
      conn.db.gamerecord.removeOnInsert(handleInsert);
      conn.db.gamerecord.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerIdentity]);

  useEffect(() => {
    setPersonalRecords([]);
    if (!conn || !playerIdentity) return;

    const belongsToPlayer = (record: PersonalRecord) =>
      record.playerId.toHexString() === playerIdentity;
    const readRecords = () => {
      setPersonalRecords(
        Array.from(conn.db.personalrecord.iter()).filter(belongsToPlayer),
      );
    };
    const handleInsert = (_ctx: EventContext, record: PersonalRecord) => {
      if (belongsToPlayer(record)) {
        setPersonalRecords((previous) => upsertById(previous, record));
      }
    };
    const handleDelete = (_ctx: EventContext, record: PersonalRecord) => {
      if (belongsToPlayer(record)) {
        setPersonalRecords((previous) =>
          previous.filter(({ id }) => id !== record.id),
        );
      }
    };

    conn.db.personalrecord.onInsert(handleInsert);
    conn.db.personalrecord.onDelete(handleDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(readRecords)
      .subscribe([
        `SELECT * FROM personalrecord WHERE PlayerId = '${playerIdentity}'`,
      ]);

    return () => {
      conn.db.personalrecord.removeOnInsert(handleInsert);
      conn.db.personalrecord.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerIdentity]);

  useEffect(() => {
    setStatDistributions(new Map());
    if (!conn) return;

    const readDistributions = () => {
      setStatDistributions(
        new Map(
          Array.from(conn.db.statdistribution.iter()).map((distribution) => [
            distribution.statType,
            distribution,
          ]),
        ),
      );
    };
    const handleInsert = (
      _ctx: EventContext,
      distribution: StatDistribution,
    ) => {
      setStatDistributions((previous) => {
        const next = new Map(previous);
        next.set(distribution.statType, distribution);
        return next;
      });
    };
    const handleUpdate = (
      _ctx: EventContext,
      previous: StatDistribution,
      updated: StatDistribution,
    ) => {
      setStatDistributions((current) => {
        const next = new Map(current);
        next.delete(previous.statType);
        next.set(updated.statType, updated);
        return next;
      });
    };
    const handleDelete = (
      _ctx: EventContext,
      distribution: StatDistribution,
    ) => {
      setStatDistributions((previous) => {
        const next = new Map(previous);
        next.delete(distribution.statType);
        return next;
      });
    };

    conn.db.statdistribution.onInsert(handleInsert);
    conn.db.statdistribution.onUpdate(handleUpdate);
    conn.db.statdistribution.onDelete(handleDelete);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(readDistributions)
      .subscribe(["SELECT * FROM statdistribution"]);

    return () => {
      conn.db.statdistribution.removeOnInsert(handleInsert);
      conn.db.statdistribution.removeOnUpdate(handleUpdate);
      conn.db.statdistribution.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn]);

  useEffect(() => {
    setStatValues(
      new Map<string, number>([
        ["GamesPlayed", player?.totalGames || 0],
        ["Streaks", 0],
        ["WordsTyped", player?.totalWordsTyped || 0],
        ["Levels", player?.level || 0],
      ]),
    );
  }, [player?.totalGames, player?.totalWordsTyped, player?.level]);

  return {
    player,
    playerStreak,
    gameRecords,
    personalRecords,
    statDistributions,
    statValues,
  };
}
