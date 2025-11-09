import { schema, table, t } from 'spacetimedb/server';
import { ScheduleAt } from 'spacetimedb';

// Enum for game state
export enum GameState {
  Lobby = 'Lobby',
  Starting = 'Starting',
  Racing = 'Racing',
  Finished = 'Finished',
}

// Enum for game mode
export enum GameMode {
  English500 = 'English500',
}

export const spacetimedb = schema(
  table(
    { name: 'person' },
    {
      name: t.string(),
    }
  ),
  table(
    { name: 'game' },
    {
      id: t.u64().primaryKey().autoInc(),
      phrase: t.string(),
      created_at: t.u64(),
      state: t.string().index(),
      game_mode: t.string().index(),
    }
  ),
  table(
    { name: 'game_countdown', scheduled: 'start_game_countdown' },
    {
      game_id: t.u64(),
      scheduled_at: t.scheduleAt(),
    }
  )
);

spacetimedb.reducer('init', (_ctx) => {
  // Called when the module is initially published
});

spacetimedb.reducer('client_connected', (_ctx) => {
  // Called every time a new client connects
});

spacetimedb.reducer('client_disconnected', (_ctx) => {
  // Called every time a client disconnects
});

spacetimedb.reducer('add', { name: t.string() }, (ctx, { name }) => {
  ctx.db.person.insert({ name });
});

spacetimedb.reducer('say_hello', (ctx) => {
  for (const person of ctx.db.person.iter()) {
    console.info(`Hello, ${person.name}!`);
  }
  console.info('Hello, World!');
});

spacetimedb.reducer(
  'join_game',
  { player: t.string(), game_mode: t.string() },
  (ctx, { player, game_mode }) => {
    // Use index to efficiently find games in Lobby state with matching game mode
    let foundGame = null;
    for (const game of ctx.db.game.state.filter(GameState.Lobby)) {
      if (game.game_mode === game_mode) {
        foundGame = game;
        break;
      }
    }

    if (foundGame) {
      // Join existing game
      console.info(`Player ${player} joined game ${foundGame.id}`);
    } else {
      // Create a new game
      const newGame = ctx.db.game.insert({
        id: 0n, // Auto-incremented, this value will be replaced
        phrase: 'The quick brown fox jumps over the lazy dog',
        created_at: BigInt(Date.now()),
        state: GameState.Lobby,
        game_mode: game_mode,
      });
      console.info(`Player ${player} created and joined game ${newGame.id}`);

      const eightSecondsInMicros = 8n * 1000000n;
      const scheduledTime = newGame.created_at * 1000n + eightSecondsInMicros;
      ctx.db.game_countdown.insert({
        game_id: newGame.id,
        scheduled_at: ScheduleAt.time(scheduledTime),
      });
    }
  }
);

spacetimedb.reducer('start_game_countdown', { game_id: t.u64() }, (ctx, { game_id }) => {
  const game = ctx.db.game.id.find(game_id);
  
  if (game && game.state === GameState.Lobby) {
    ctx.db.game.id.update({
      ...game,
      state: GameState.Starting,
    });
    console.info(`Game ${game_id} transitioned to Starting state`);
  }
});