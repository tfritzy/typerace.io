import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { GameRecord, Player } from '../types/stdb';

export const saveGameRecord = async (
  record: GameRecord,
  firebaseUid: string
) => {
  const docRef = doc(db, 'gameRecords', record.id);
  await setDoc(docRef, {
    firebaseUid,
    playerId: record.playerId.toHexString(),
    gameId: record.gameId,
    gameMode: record.gameMode.tag,
    gameType: record.gameType.tag,
    year: record.year,
    month: record.month,
    date: Number(record.date),
    timeMs: Number(record.timeMs),
    placement: record.placement,
    wpm: record.wpm,
    xpGained: record.xpGained,
    eloChange: record.eloChange,
    day: record.day,
    createdAt: serverTimestamp(),
  });
};

export const savePlayerData = async (
  player: Player,
  firebaseUid: string
) => {
  const docRef = doc(db, 'players', player.playerId);
  await setDoc(docRef, {
    firebaseUid,
    playerId: player.playerId,
    identity: player.identity.toHexString(),
    name: player.name,
    totalGames: player.totalGames,
    wins: player.wins,
    level: player.level,
    xp: player.xp,
    xpRequiredForNextLevel: player.xpRequiredForNextLevel,
    totalWordsTyped: player.totalWordsTyped,
    totalTimeSpentMs: Number(player.totalTimeSpentMs),
    color: player.color.tag,
    isAnonymous: player.isAnonymous,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
