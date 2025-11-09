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
  ),
  table(
    { name: 'player_progress' },
    {
      id: t.u64().primaryKey().autoInc(),
      player_id: t.identity(),
      game_id: t.u64(),
      progress_index: t.u64(),
    },
    [[t.identity(), t.u64()]]
  )
);

spacetimedb.reducer('init', (_ctx) => {});

spacetimedb.reducer('client_connected', (_ctx) => {});

spacetimedb.reducer('client_disconnected', (_ctx) => {});

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
    let foundGame = null;
    for (const game of ctx.db.game.state.filter(GameState.Lobby)) {
      if (game.game_mode === game_mode) {
        foundGame = game;
        break;
      }
    }

    if (foundGame) {
      console.info(`Player ${player} joined game ${foundGame.id}`);
      
      ctx.db.player_progress.insert({
        id: 0n,
        player_id: ctx.sender,
        game_id: foundGame.id,
        progress_index: 0n,
      });
    } else {
      const newGame = ctx.db.game.insert({
        id: 0n,
        phrase: 'The quick brown fox jumps over the lazy dog',
        created_at: BigInt(Date.now()),
        state: GameState.Lobby,
        game_mode: game_mode,
      });
      console.info(`Player ${player} created and joined game ${newGame.id}`);

      ctx.db.player_progress.insert({
        id: 0n,
        player_id: ctx.sender,
        game_id: newGame.id,
        progress_index: 0n,
      });

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

spacetimedb.reducer(
  'update_progress',
  { game_id: t.u64(), new_index: t.u64() },
  (ctx, { game_id, new_index }) => {
    const player_id = ctx.sender;

    const game = ctx.db.game.id.find(game_id);

    if (!game || game.state !== GameState.Racing) {
      console.info(`Cannot update progress: game ${game_id} is not in Racing state`);
      return;
    }

    let existingProgress = null;
    for (const progress of ctx.db.player_progress[0].filter([player_id, game_id])) {
      existingProgress = progress;
      break;
    }

    if (!existingProgress) {
      console.info(`No progress found for player ${player_id} in game ${game_id}`);
      return;
    }

    ctx.db.player_progress.id.update({
      ...existingProgress,
      progress_index: new_index,
    });
    console.info(`Updated progress for player ${player_id} in game ${game_id} to ${new_index}`);
  }
);