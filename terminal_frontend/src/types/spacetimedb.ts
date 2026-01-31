import {
  DbConnectionBuilder as _DbConnectionBuilder,
  DbConnectionImpl as _DbConnectionImpl,
  type Identity,
} from 'spacetimedb';

export type { Identity };

export type GameState = 
  | { tag: 'Lobby' }
  | { tag: 'Countdown' }
  | { tag: 'Racing' }
  | { tag: 'Archived' };

export type GameMode =
  | { tag: 'English500' }
  | { tag: 'Spanish500' }
  | { tag: 'French500' }
  | { tag: 'German500' }
  | { tag: 'Italian500' }
  | { tag: 'Portuguese500' }
  | { tag: 'Japanese500' }
  | { tag: 'Korean500' }
  | { tag: 'Chinese500' }
  | { tag: 'Ukrainian500' }
  | { tag: 'Arabic500' }
  | { tag: 'Hindi500' }
  | { tag: 'Dutch500' }
  | { tag: 'Swedish500' }
  | { tag: 'Turkish500' }
  | { tag: 'EnglishQuotes' }
  | { tag: 'SpanishQuotes' }
  | { tag: 'FrenchQuotes' }
  | { tag: 'GermanQuotes' }
  | { tag: 'ItalianQuotes' }
  | { tag: 'PortugueseQuotes' }
  | { tag: 'JapaneseQuotes' }
  | { tag: 'KoreanQuotes' }
  | { tag: 'ChineseQuotes' }
  | { tag: 'UkrainianQuotes' }
  | { tag: 'ArabicQuotes' }
  | { tag: 'HindiQuotes' }
  | { tag: 'DutchQuotes' }
  | { tag: 'SwedishQuotes' }
  | { tag: 'TurkishQuotes' };

export type GameType =
  | { tag: 'Public' }
  | { tag: 'Private' }
  | { tag: 'Practice' };

export type CharacterEventType =
  | { tag: 'Correct' }
  | { tag: 'Incorrect' }
  | { tag: 'Backspace' };

export type PlayerColor =
  | { tag: 'Red' }
  | { tag: 'Orange' }
  | { tag: 'Amber' }
  | { tag: 'Yellow' }
  | { tag: 'Lime' }
  | { tag: 'Green' }
  | { tag: 'Emerald' }
  | { tag: 'Teal' }
  | { tag: 'Cyan' }
  | { tag: 'Sky' }
  | { tag: 'Blue' }
  | { tag: 'Indigo' }
  | { tag: 'Violet' }
  | { tag: 'Purple' }
  | { tag: 'Fuchsia' }
  | { tag: 'Pink' }
  | { tag: 'Rose' };

export interface Game {
  id: string;
  phrase: string;
  attribution?: string | null;
  state?: GameState;
  gameMode?: GameMode;
  gameType?: GameType;
  countdownStartedAt?: bigint | null;
  racingStartedAt?: bigint | null;
  finishedAt?: bigint | null;
  owner?: Identity | null;
}

export interface Player {
  identity: Identity;
  playerId: string;
  name: string;
  totalGames: number;
  wins: number;
  level: number;
  xp: number;
  xpRequiredForNextLevel: number;
  totalWordsTyped: number;
  totalTimeSpentMs: bigint;
  isBot: boolean;
  botConfig?: { typingRate: number; errorRate: number } | null;
  color: PlayerColor;
  isAnonymous: boolean;
  lastGameDate: bigint;
}

export interface PlayerProgress {
  id: string;
  playerId: Identity;
  gameId: Identity;
  playerName: string;
  playerLevel: number;
  playerPublicId: string;
  playerColor?: PlayerColor;
  progressIndex: number;
  wpm?: number;
  placement?: number;
  isBot: boolean;
  isAnonymous: boolean;
  joinCode?: string;
  characterHistory?: Uint8Array;
  finishedAt?: bigint | null;
}

export interface JoinGameArgs {
  gameMode: GameMode;
  joinCode: string;
  gameType: GameType;
}

export interface JoinPrivateGameArgs {
  gameId: string;
}

export interface UpdateProgressArgs {
  progressIndex: number;
  characterEventType: CharacterEventType;
}

export interface SyncAnonymousStatusArgs {
  isAnonymous: boolean;
}

export interface StartCountdownArgs {
  gameId: string;
}

export interface RematchArgs {
  gameId: string;
}

interface TableHandle<T> {
  iter(): IterableIterator<T>;
  onInsert(callback: (ctx: EventContext, row: T) => void): void;
  onUpdate(callback: (ctx: EventContext, oldRow: T, newRow: T) => void): void;
  onDelete(callback: (ctx: EventContext, row: T) => void): void;
  removeOnInsert(callback: (ctx: EventContext, row: T) => void): void;
  removeOnUpdate(callback: (ctx: EventContext, oldRow: T, newRow: T) => void): void;
  removeOnDelete(callback: (ctx: EventContext, row: T) => void): void;
}

interface GameTableHandle extends TableHandle<Game> {
  id: {
    find(id: string): Game | undefined;
  };
}

interface PlayerTableHandle extends TableHandle<Player> {
  identity: {
    find(identity: Identity): Player | undefined;
  };
}

interface PlayerProgressTableHandle extends TableHandle<PlayerProgress> {
  gameId: {
    filter(gameId: Identity): PlayerProgress[];
  };
  playerId: {
    filter(playerId: Identity): PlayerProgress[];
  };
}

interface ReducerEvent {
  callerIdentity: Identity;
  status: { tag: 'Committed' } | { tag: 'Failed'; value: string } | { tag: 'OutOfEnergy' };
}

export interface EventContext {
  event: ReducerEvent;
}

export interface ReducerEventContext {
  event: ReducerEvent;
}

export interface SubscriptionHandle {
  unsubscribe(): void;
}

interface SubscriptionBuilder {
  onApplied(callback: () => void): SubscriptionBuilder;
  subscribe(queries: string[]): SubscriptionHandle;
}

interface Reducers {
  joinGame(args: JoinGameArgs): void;
  joinPrivateGame(args: JoinPrivateGameArgs): void;
  updateProgress(args: UpdateProgressArgs): void;
  syncAnonymousStatus(args: SyncAnonymousStatusArgs): void;
  startCountdown(args: StartCountdownArgs): void;
  rematch(args: RematchArgs): void;

  onJoinGame(callback: (ctx: ReducerEventContext, args: JoinGameArgs) => void): void;
  removeOnJoinGame(callback: (ctx: ReducerEventContext, args: JoinGameArgs) => void): void;
}

interface Database {
  game: GameTableHandle;
  player: PlayerTableHandle;
  playerprogress: PlayerProgressTableHandle;
}

export interface DbConnection {
  identity: Identity | null;
  db: Database;
  reducers: Reducers;
  subscriptionBuilder(): SubscriptionBuilder;
  disconnect(): void;
}

class DbConnectionBuilderWrapper {
  private uri: string = '';
  private moduleName: string = '';
  private token: string = '';
  private onConnectCallback: ((conn: DbConnection) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  withUri(uri: string): this {
    this.uri = uri;
    return this;
  }

  withModuleName(moduleName: string): this {
    this.moduleName = moduleName;
    return this;
  }

  withToken(token: string): this {
    this.token = token;
    return this;
  }

  onConnect(callback: (conn: DbConnection) => void): this {
    this.onConnectCallback = callback;
    return this;
  }

  onDisconnect(callback: () => void): this {
    this.onDisconnectCallback = callback;
    return this;
  }

  build(): DbConnection {
    const REMOTE_MODULE = {
      versionInfo: { cliVersion: "1.10.0" as const },
      tables: [] as const,
      reducers: [] as const,
      procedures: [] as const,
    };

    const realBuilder = new _DbConnectionBuilder<_DbConnectionImpl<any>>(
      REMOTE_MODULE as any,
      (config: any) => new _DbConnectionImpl(config) as any
    );
    
    const wrappedConn = realBuilder
      .withUri(this.uri)
      .withModuleName(this.moduleName)
      .withToken(this.token)
      .onConnect((conn) => {
        if (this.onConnectCallback) {
          this.onConnectCallback(conn as unknown as DbConnection);
        }
      })
      .onDisconnect(() => {
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      })
      .build();

    return wrappedConn as unknown as DbConnection;
  }
}

export const DbConnection = {
  builder(): DbConnectionBuilderWrapper {
    return new DbConnectionBuilderWrapper();
  }
};
