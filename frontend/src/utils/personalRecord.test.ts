import { describe, expect, it } from "vitest";
import type { PersonalRecord } from "../types/stdb";
import { isPersonalRecordForGame } from "./personalRecord";

const currentPlayerId = {} as PersonalRecord["playerId"];
const otherPlayerId = {} as PersonalRecord["playerId"];

function personalRecord(
  phraseLength: number | undefined,
  playerId = currentPlayerId,
): PersonalRecord {
  return {
    phraseLength,
    gameRecordId: "record-1",
    playerId: {
      isEqual: (candidate: PersonalRecord["playerId"]) =>
        candidate === playerId,
    },
  } as PersonalRecord;
}

describe("isPersonalRecordForGame", () => {
  it("matches a length record linked to the current game and player", () => {
    expect(
      isPersonalRecordForGame(
        personalRecord(12),
        currentPlayerId,
        "game-1",
        () => ({ gameId: "game-1" }),
      ),
    ).toBe(true);
  });

  it("rejects overall records and records for another player or game", () => {
    const findCurrentGame = () => ({ gameId: "game-1" });

    expect(
      isPersonalRecordForGame(
        personalRecord(undefined),
        currentPlayerId,
        "game-1",
        findCurrentGame,
      ),
    ).toBe(false);
    expect(
      isPersonalRecordForGame(
        personalRecord(12, otherPlayerId),
        currentPlayerId,
        "game-1",
        findCurrentGame,
      ),
    ).toBe(false);
    expect(
      isPersonalRecordForGame(
        personalRecord(12),
        currentPlayerId,
        "game-2",
        findCurrentGame,
      ),
    ).toBe(false);
  });
});
