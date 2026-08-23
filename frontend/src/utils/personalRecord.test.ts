import { describe, expect, it } from "vitest";
import type { PersonalRecord } from "../types/stdb";
import { isPersonalRecordForGame } from "./personalRecord";

const playerId = {} as PersonalRecord["playerId"];
const differentPlayerId = {} as PersonalRecord["playerId"];

function personalRecord(
  phraseLength: number | undefined,
  recordPlayerId = playerId,
): PersonalRecord {
  return {
    phraseLength,
    gameRecordId: "record-1",
    playerId: {
      isEqual: (candidate: PersonalRecord["playerId"]) =>
        candidate === recordPlayerId,
    },
  } as PersonalRecord;
}

describe("isPersonalRecordForGame", () => {
  it("accepts a matching length record", () => {
    expect(
      isPersonalRecordForGame(
        personalRecord(12),
        playerId,
        "game-1",
        () => ({ gameId: "game-1" }),
      ),
    ).toBe(true);
  });

  it("rejects overall and mismatched records", () => {
    const findGameRecord = () => ({ gameId: "game-1" });

    expect(
      isPersonalRecordForGame(
        personalRecord(undefined),
        playerId,
        "game-1",
        findGameRecord,
      ),
    ).toBe(false);
    expect(
      isPersonalRecordForGame(
        personalRecord(12, differentPlayerId),
        playerId,
        "game-1",
        findGameRecord,
      ),
    ).toBe(false);
    expect(
      isPersonalRecordForGame(
        personalRecord(12),
        playerId,
        "game-2",
        findGameRecord,
      ),
    ).toBe(false);
  });
});
