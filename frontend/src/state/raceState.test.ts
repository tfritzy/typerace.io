import { describe, expect, it, vi } from "vitest";
import type { PlayerProgress } from "../types/stdb";
import { RaceStateStore } from "./raceState";

function createPlayer(
  playerId: string,
  progressIndex = 0,
): PlayerProgress {
  return {
    playerId: { toHexString: () => playerId },
    progressIndex,
  } as PlayerProgress;
}

describe("RaceStateStore", () => {
  it("updates one live player without rebuilding the others", () => {
    const store = new RaceStateStore();
    const one = createPlayer("one");
    const two = createPlayer("two");
    store.setPlayers([one, two]);
    const firstState = store.getPlayerSnapshot("one");

    store.upsertPlayer(createPlayer("two", 3));

    expect(store.getPlayerSnapshot("one")).toBe(firstState);
    expect(store.getPlayerSnapshot("two")?.progressIndex).toBe(3);
  });

  it("applies input and progress as a current-world transaction", () => {
    const store = new RaceStateStore();
    const listener = vi.fn();
    store.setPlayers([createPlayer("one"), createPlayer("two")]);
    store.subscribe(listener);

    store.patch({
      input: "he",
      progress: new Map([
        ["one", 2],
        ["two", 1],
      ]),
    });

    expect(store.getSnapshot().input).toBe("he");
    expect(store.getSnapshot().players.map((player) => player.progressIndex))
      .toEqual([2, 1]);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("preserves the players snapshot for input-only updates", () => {
    const store = new RaceStateStore();
    store.setPlayers([createPlayer("one")]);
    const players = store.getPlayersSnapshot();

    store.setInput("h");

    expect(store.getPlayersSnapshot()).toBe(players);
  });
});
