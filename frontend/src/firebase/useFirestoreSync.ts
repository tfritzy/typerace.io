import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useDatabase } from '../contexts/SpacetimeContext';
import { saveGameRecord, savePlayerData } from './firestoreService';
import type { GameRecord, Player } from '../types/stdb';

export const useFirestoreSync = () => {
  const { user } = useAuth();
  const conn = useDatabase();

  useEffect(() => {
    if (!conn || !user || user.isAnonymous) return;

    const firebaseUid = user.uid;

    const handleGameRecordInsert = (_ctx: unknown, record: GameRecord) => {
      if (conn.identity && record.playerId.isEqual(conn.identity)) {
        saveGameRecord(record, firebaseUid).catch((err) =>
          console.error('Failed to save game record to Firestore:', err)
        );
      }
    };

    const handlePlayerUpdate = (_ctx: unknown, _old: Player, updated: Player) => {
      if (conn.identity && updated.identity.isEqual(conn.identity)) {
        savePlayerData(updated, firebaseUid).catch((err) =>
          console.error('Failed to save player data to Firestore:', err)
        );
      }
    };

    conn.db.gamerecord.onInsert(handleGameRecordInsert);
    conn.db.player.onUpdate(handlePlayerUpdate);

    return () => {
      conn.db.gamerecord.removeOnInsert(handleGameRecordInsert);
      conn.db.player.removeOnUpdate(handlePlayerUpdate);
    };
  }, [conn, user]);
};
