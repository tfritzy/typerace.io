type ReducerStatus =
  | { tag: "Success" }
  | { tag: "Failed"; value: string }
  | { tag: "OutOfEnergy" };

export interface IdentityLike {
  isEqual(other: IdentityLike): boolean;
  toHexString(): string;
  toString(): string;
}

class MockIdentity implements IdentityLike {
  constructor(private readonly value: string) {}

  isEqual(other: IdentityLike): boolean {
    return this.toHexString() === other.toHexString();
  }

  toHexString(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}

export type GameMode = { tag: string };
export type GameType = { tag: "Public" | "Private" | "Practice" | string };
export type GameState = { tag: string };
export type CharacterEventType =
  | { tag: "Correct" }
  | { tag: "Incorrect" }
  | { tag: "Backspace" };

export interface Player {
  identity: IdentityLike;
  playerId: string;
  name: string;
  level: number;
  xp: number;
  xpRequiredForNextLevel: number;
  isAnonymous: boolean;
  totalGames: number;
  wins: number;
  totalWordsTyped: number;
  totalTimeSpentMs: bigint;
}

export interface Game {
  id: IdentityLike;
  phrase: string;
  attribution?: string;
  gameMode: GameMode;
  gameType?: GameType;
  state: GameState;
  owner?: IdentityLike;
  racingStartedAt: bigint;
  countdownDurationMs: bigint;
}

export interface GameRecord {
  id: number | string;
  gameId: string;
  playerId: IdentityLike;
  gameMode: GameMode;
  gameType: GameType;
  placement: number;
  timeMs: bigint;
  wpm: number;
  date: bigint;
}

export interface PlayerColor {
  tag: string;
}

export interface PlayerProgress {
  id: number | string;
  gameId: IdentityLike;
  playerId: IdentityLike;
  playerName: string;
  playerLevel: number;
  playerPublicId: string;
  playerColor?: PlayerColor;
  progressIndex: number;
  joinCode: string;
  time: bigint;
  wpm: number;
  placement: number;
  characterHistory: Uint8Array;
  isBot: boolean;
  isAnonymous: boolean;
}

export interface XpMultiplier {
  label: string;
  value: string;
}

export interface XpGain {
  multipliers: XpMultiplier[];
  totalXp: number;
}

export interface GlobalStats {
  date: string;
  stats: Array<{
    gameType: GameType;
    gameMode: GameMode;
    finishedGames: number;
    nonLonelyGames: number;
    startedGames: number;
    totalWpm: number;
    minWpm: number;
    maxWpm: number;
    gameCount: number;
  }>;
  total: {
    gameType: GameType;
    gameMode: GameMode;
    finishedGames: number;
    nonLonelyGames: number;
    startedGames: number;
    totalWpm: number;
    minWpm: number;
    maxWpm: number;
    gameCount: number;
  };
  dailyActivePlayers: number;
}

export interface PersonalRecord {
  gameMode: GameMode;
  wpm: number;
  accuracy: number;
  date: bigint;
}

type InsertHandler<T> = (ctx: object, row: T) => void;
type UpdateHandler<T> = (ctx: object, oldRow: T, newRow: T) => void;
type DeleteHandler<T> = (ctx: object, row: T) => void;

interface Table<T> {
  iter(): Iterable<T>;
  onInsert(handler: InsertHandler<T>): void;
  removeOnInsert(handler: InsertHandler<T>): void;
  onUpdate(handler: UpdateHandler<T>): void;
  removeOnUpdate(handler: UpdateHandler<T>): void;
  onDelete(handler: DeleteHandler<T>): void;
  removeOnDelete(handler: DeleteHandler<T>): void;
}

class MockTable<T> implements Table<T> {
  iter(): Iterable<T> {
    return [];
  }

  onInsert(_handler: InsertHandler<T>): void {}
  removeOnInsert(_handler: InsertHandler<T>): void {}
  onUpdate(_handler: UpdateHandler<T>): void {}
  removeOnUpdate(_handler: UpdateHandler<T>): void {}
  onDelete(_handler: DeleteHandler<T>): void {}
  removeOnDelete(_handler: DeleteHandler<T>): void {}
}

interface ReducerEventContext {
  event: {
    callerIdentity: IdentityLike;
    status: ReducerStatus;
  };
}

interface JoinGameArgs {
  gameMode: GameMode;
  joinCode: string;
  gameType: GameType;
}

type JoinGameHandler = (ctx: ReducerEventContext, args: JoinGameArgs) => void;

class MockSubscription {
  unsubscribe(): void {}
}

class MockSubscriptionBuilder {
  private appliedHandler: (() => void) | null = null;

  onApplied(handler: () => void): this {
    this.appliedHandler = handler;
    return this;
  }

  subscribe(_queries: string[]): MockSubscription {
    this.appliedHandler?.();
    return new MockSubscription();
  }
}

class MockConnectionBuilder {
  private connectHandler: ((conn: DbConnection) => void) | null = null;
  private disconnectHandler: (() => void) | null = null;

  withUri(_uri: string): this {
    return this;
  }

  withModuleName(_moduleName: string): this {
    return this;
  }

  withToken(_token: string): this {
    return this;
  }

  onConnect(handler: (conn: DbConnection) => void): this {
    this.connectHandler = handler;
    return this;
  }

  onDisconnect(handler: () => void): this {
    this.disconnectHandler = handler;
    return this;
  }

  build(): DbConnection {
    const connection = new DbConnection(this.disconnectHandler);
    queueMicrotask(() => {
      this.connectHandler?.(connection);
    });
    return connection;
  }
}

export class DbConnection {
  static builder(): MockConnectionBuilder {
    return new MockConnectionBuilder();
  }

  readonly identity: IdentityLike = new MockIdentity("local-player");
  readonly db = {
    game: Object.assign(new MockTable<Game>(), {
      id: {
        find: (_key: string) => undefined as Game | undefined,
      },
    }),
    playerprogress: new MockTable<PlayerProgress>(),
    player: new MockTable<Player>(),
    gamerecord: new MockTable<GameRecord>(),
    globalstats: new MockTable<GlobalStats>(),
  };

  readonly reducers = {
    syncAnonymousStatus: (_args: { isAnonymous: boolean }): void => {},
    joinGame: (_args: JoinGameArgs): void => {},
    onJoinGame: (_handler: JoinGameHandler): void => {},
    removeOnJoinGame: (_handler: JoinGameHandler): void => {},
    updateProgress: (_args: {
      gameId: string;
      newIndex: number;
      eventType: CharacterEventType;
    }): void => {},
    rematch: (_args: { gameId: string }): void => {},
    startPrivateGame: (_args: { gameId: string }): void => {},
    joinPrivateGame: (_args: { gameId: string }): void => {},
    kickPlayer: (_args: { gameId: string; targetPlayerId: IdentityLike }): void => {},
    setPlayerName: (_args: { name: string }): void => {},
  };

  constructor(private readonly disconnectHandler: (() => void) | null = null) {}

  subscriptionBuilder(): MockSubscriptionBuilder {
    return new MockSubscriptionBuilder();
  }

  disconnect(): void {
    this.disconnectHandler?.();
  }
}
