import { useEffect, useState } from "react";
import type { DbConnection, EventContext } from "../../module_bindings";
import type { GameRecord, PersonalRecord, Player } from "../types/stdb";

interface ProfileData {
  player: Player | null;
  gameRecords: GameRecord[];
  personalRecords: PersonalRecord[];
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
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

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
    const belongsToProfile = (candidate: Player) => (
      candidate.playerId === playerId
    );
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

    const subscription = conn.subscriptionBuilder()
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
    setGameRecords([]);
    if (!conn || !player || !playerIdentity) return;

    const belongsToPlayer = (record: GameRecord) => (
      record.playerId.isEqual(player.identity)
    );
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
        setGameRecords((previous) => (
          previous.filter(({ id }) => id !== record.id)
        ));
      }
    };

    conn.db.gamerecord.onInsert(handleInsert);
    conn.db.gamerecord.onDelete(handleDelete);

    const subscription = conn.subscriptionBuilder()
      .onApplied(readRecords)
      .subscribe([
        `SELECT * FROM gamerecord WHERE PlayerId = '${player.identity}'`,
      ]);

    return () => {
      conn.db.gamerecord.removeOnInsert(handleInsert);
      conn.db.gamerecord.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerIdentity]);

  useEffect(() => {
    setPersonalRecords([]);
    if (!conn || !player || !playerIdentity) return;

    const belongsToPlayer = (record: PersonalRecord) => (
      record.playerId.isEqual(player.identity)
    );
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
        setPersonalRecords((previous) => (
          previous.filter(({ id }) => id !== record.id)
        ));
      }
    };

    conn.db.personalrecord.onInsert(handleInsert);
    conn.db.personalrecord.onDelete(handleDelete);

    const subscription = conn.subscriptionBuilder()
      .onApplied(readRecords)
      .subscribe([
        `SELECT * FROM personalrecord WHERE PlayerId = '${player.identity}'`,
      ]);

    return () => {
      conn.db.personalrecord.removeOnInsert(handleInsert);
      conn.db.personalrecord.removeOnDelete(handleDelete);
      subscription.unsubscribe();
    };
  }, [conn, playerIdentity]);

  return { player, gameRecords, personalRecords };
}
