import type { GameRecord, PersonalRecord } from "../types/stdb";

type GameRecordLookup = (
  gameRecordId: string,
) => Pick<GameRecord, "gameId"> | null | undefined;

export function isPersonalRecordForGame(
  record: PersonalRecord,
  currentPlayerId: PersonalRecord["playerId"] | undefined,
  gameId: string,
  findGameRecord: GameRecordLookup,
): boolean {
  return !!(
    record.phraseLength !== undefined &&
    currentPlayerId &&
    record.playerId.isEqual(currentPlayerId) &&
    findGameRecord(record.gameRecordId)?.gameId === gameId
  );
}
