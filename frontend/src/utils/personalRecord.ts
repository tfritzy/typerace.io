import type { GameRecord, PersonalRecord } from "../types/stdb";

type GameRecordLookup = (
  gameRecordId: string,
) => Pick<GameRecord, "gameId"> | null | undefined;

export function isPersonalRecordForGame(
  record: PersonalRecord,
  playerId: PersonalRecord["playerId"] | undefined,
  gameId: string,
  findGameRecord: GameRecordLookup,
): boolean {
  return !!(
    record.phraseLength !== undefined &&
    playerId &&
    record.playerId.isEqual(playerId) &&
    findGameRecord(record.gameRecordId)?.gameId === gameId
  );
}
