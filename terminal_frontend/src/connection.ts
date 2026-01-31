import { DbConnection, type Game, type PlayerProgress, type GameMode } from './types/spacetimedb';
import type { User } from 'firebase/auth';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface ConnectionManager {
  conn: DbConnection | null;
  state: ConnectionState;
  connect: (user: User) => Promise<DbConnection>;
  disconnect: () => void;
}

export function createConnectionManager(): ConnectionManager {
  let conn: DbConnection | null = null;
  let state: ConnectionState = 'disconnected';

  return {
    get conn() { return conn; },
    get state() { return state; },

    async connect(user: User): Promise<DbConnection> {
      if (conn) return conn;
      
      state = 'connecting';
      const idToken = await user.getIdToken();

      return new Promise((resolve, reject) => {
        const connection = DbConnection.builder()
          .withUri(import.meta.env.VITE_SPACETIMEDB_URI || 'ws://localhost:3000')
          .withModuleName(import.meta.env.VITE_SPACETIMEDB_MODULE || 'typerace')
          .withToken(idToken)
          .onConnect((c) => {
            conn = c;
            state = 'connected';
            c.reducers.syncAnonymousStatus({ isAnonymous: user.isAnonymous });
            resolve(c);
          })
          .onDisconnect(() => {
            conn = null;
            state = 'disconnected';
          })
          .build();

        setTimeout(() => {
          if (state === 'connecting') {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        void connection;
      });
    },

    disconnect() {
      if (conn) {
        conn.disconnect();
        conn = null;
        state = 'disconnected';
      }
    }
  };
}

export interface GameSubscription {
  game: Game | null;
  playerProgress: PlayerProgress[];
  unsubscribe: () => void;
}

export function subscribeToGame(
  conn: DbConnection,
  gameId: string,
  onUpdate: (game: Game | null, progress: PlayerProgress[]) => void
): GameSubscription {
  let game: Game | null = null;
  let playerProgress: PlayerProgress[] = [];

  const handleGameInsert = (_ctx: unknown, g: Game) => {
    if (g.id.toString() === gameId) {
      game = g;
      onUpdate(game, playerProgress);
    }
  };

  const handleGameUpdate = (_ctx: unknown, _oldGame: Game, newGame: Game) => {
    if (newGame.id.toString() === gameId) {
      game = newGame;
      onUpdate(game, playerProgress);
    }
  };

  const handleProgressInsert = (_ctx: unknown, pp: PlayerProgress) => {
    if (pp.gameId.toString() === gameId) {
      if (!playerProgress.some(p => p.id === pp.id)) {
        playerProgress = [...playerProgress, pp];
        onUpdate(game, playerProgress);
      }
    }
  };

  const handleProgressUpdate = (_ctx: unknown, _oldPP: PlayerProgress, newPP: PlayerProgress) => {
    if (newPP.gameId.toString() === gameId) {
      playerProgress = playerProgress.map(pp => pp.id === newPP.id ? newPP : pp);
      onUpdate(game, playerProgress);
    }
  };

  conn.db.game.onInsert(handleGameInsert);
  conn.db.game.onUpdate(handleGameUpdate);
  conn.db.playerprogress.onInsert(handleProgressInsert);
  conn.db.playerprogress.onUpdate(handleProgressUpdate);

  const gameSubscription = conn.subscriptionBuilder()
    .onApplied(() => {
      const g = conn.db.game.id.find(gameId);
      if (g) {
        game = g;
        onUpdate(game, playerProgress);
      }
    })
    .subscribe([`SELECT * FROM game WHERE Id = '${gameId}'`]);

  const progressSubscription = conn.subscriptionBuilder()
    .onApplied(() => {
      const allProgress = Array.from(conn.db.playerprogress.iter()) as PlayerProgress[];
      playerProgress = allProgress.filter((pp: PlayerProgress) => pp.gameId.toString() === gameId);
      onUpdate(game, playerProgress);
    })
    .subscribe([`SELECT * FROM playerprogress WHERE GameId = '${gameId}'`]);

  return {
    get game() { return game; },
    get playerProgress() { return playerProgress; },
    unsubscribe() {
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
      conn.db.playerprogress.removeOnInsert(handleProgressInsert);
      conn.db.playerprogress.removeOnUpdate(handleProgressUpdate);
      gameSubscription.unsubscribe();
      progressSubscription.unsubscribe();
    }
  };
}

export function findGame(
  conn: DbConnection,
  mode: GameMode,
  gameType: 'Public' | 'Practice' | 'Private',
  onJoined: (gameId: string) => void
): () => void {
  const joinCode = `join_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const handleProgressInsert = (_ctx: unknown, progress: PlayerProgress) => {
    if (conn.identity && progress.playerId.isEqual(conn.identity)) {
      if (progress.joinCode === joinCode) {
        onJoined(progress.gameId.toString());
      }
    }
  };

  conn.db.playerprogress.onInsert(handleProgressInsert);

  const subscription = conn.subscriptionBuilder()
    .subscribe([`SELECT * FROM playerprogress WHERE JoinCode = '${joinCode}'`]);

  conn.reducers.joinGame({
    gameMode: mode,
    joinCode: joinCode,
    gameType: { tag: gameType } as { tag: 'Public' } | { tag: 'Practice' } | { tag: 'Private' }
  });

  return () => {
    conn.db.playerprogress.removeOnInsert(handleProgressInsert);
    subscription.unsubscribe();
  };
}
