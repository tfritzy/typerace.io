import type { PlayerProgress } from "../types/stdb";

export type RaceStateSnapshot = {
  players: readonly PlayerProgress[];
  input: string;
};

export type RaceStatePatch = {
  input?: string;
  progress?: ReadonlyMap<string, number>;
};

type SetPlayersOptions = {
  input?: string;
  getProgressIndex?: (player: PlayerProgress) => number;
};

const EMPTY_STATE: RaceStateSnapshot = { players: [], input: "" };

export class RaceStateStore {
  private snapshot = EMPTY_STATE;
  private playerIndexes = new Map<string, number>();
  private listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.snapshot;

  readonly getPlayersSnapshot = () => this.snapshot.players;

  readonly getInputSnapshot = () => this.snapshot.input;

  getPlayerSnapshot = (playerId: string) => {
    const index = this.playerIndexes.get(playerId);
    return index === undefined ? undefined : this.snapshot.players[index];
  };

  setPlayers(
    players: readonly PlayerProgress[],
    options: SetPlayersOptions = {},
  ) {
    const getProgressIndex =
      options.getProgressIndex ??
      ((player: PlayerProgress) => player.progressIndex);
    const nextPlayers = players.map((player) => ({
      ...player,
      progressIndex: getProgressIndex(player),
    }));
    this.playerIndexes = new Map(
      nextPlayers.map((player, index) => [
        player.playerId.toHexString(),
        index,
      ]),
    );
    this.commit({
      players: nextPlayers,
      input: options.input ?? this.snapshot.input,
    });
  }

  upsertPlayer(player: PlayerProgress) {
    const playerId = player.playerId.toHexString();
    const index = this.playerIndexes.get(playerId);

    if (index === undefined) {
      this.playerIndexes.set(playerId, this.snapshot.players.length);
      this.commit({
        ...this.snapshot,
        players: [...this.snapshot.players, player],
      });
      return;
    }

    const players = [...this.snapshot.players];
    players[index] = player;
    this.commit({ ...this.snapshot, players });
  }

  removePlayer(playerId: string) {
    const index = this.playerIndexes.get(playerId);
    if (index === undefined) return;

    const players = this.snapshot.players.filter(
      (_, playerIndex) => playerIndex !== index,
    );
    this.playerIndexes = new Map(
      players.map((player, playerIndex) => [
        player.playerId.toHexString(),
        playerIndex,
      ]),
    );
    this.commit({ ...this.snapshot, players });
  }

  patch({ input, progress }: RaceStatePatch) {
    let nextPlayers: PlayerProgress[] | undefined;

    if (progress?.size) {
      for (const [playerId, progressIndex] of progress) {
        const index = this.playerIndexes.get(playerId);
        if (index === undefined) continue;
        const current = this.snapshot.players[index];
        if (current.progressIndex === progressIndex) continue;
        nextPlayers ??= [...this.snapshot.players];
        nextPlayers[index] = { ...current, progressIndex };
      }
    }

    const nextInput = input ?? this.snapshot.input;
    if (!nextPlayers && nextInput === this.snapshot.input) return;
    this.commit({
      players: nextPlayers ?? this.snapshot.players,
      input: nextInput,
    });
  }

  setInput(input: string) {
    this.patch({ input });
  }

  private commit(snapshot: RaceStateSnapshot) {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
}
