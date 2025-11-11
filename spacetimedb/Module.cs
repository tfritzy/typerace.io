using SpacetimeDB;

[Type]
public enum GameState
{
    Lobby,
    Countdown,
    Racing,
    Archived
}

[Type]
public enum GameMode
{
    English500,
    Spanish500,
    French500,
    German500,
    Italian500,
    Portuguese500,
    Japanese500,
    Korean500,
    Chinese500,
    Russian500,
    Arabic500,
    Hindi500,
    Dutch500,
    Swedish500,
    Turkish500
}

public static partial class Module
{
    [Table(Name = "person", Public = true)]
    public partial struct Person
    {
        [AutoInc]
        [PrimaryKey]
        public ulong Id;
        public string Name;
    }

    [Table(Name = "game", Public = true)]
    public partial struct Game
    {
        [AutoInc]
        [PrimaryKey]
        public ulong Id;
        public string Phrase;
        public ulong CreatedAt;

        [SpacetimeDB.Index.BTree]
        public GameState State;

        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
    }

    [Table(Scheduled = nameof(FillGameWithBots))]
    public partial struct BotFillTrigger
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        [SpacetimeDB.Index.BTree]
        public ulong GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Scheduled = nameof(StartGame))]
    public partial struct GameStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ulong GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Scheduled = nameof(CompleteGame))]
    public partial struct GameCompletion
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ulong GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Name = "player_progress", Public = true)]
    public partial struct PlayerProgress
    {
        [AutoInc]
        [PrimaryKey]
        public ulong Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public ulong GameId;
        public ulong ProgressIndex;
        public bool IsBot;
    }

    [Reducer]
    public static void Init(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void ClientConnected(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void ClientDisconnected(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void Add(ReducerContext ctx, string name)
    {
        Log.Info("Added person", name);
        ctx.Db.person.Insert(new Person { Name = name });
    }

    [Reducer]
    public static void SayHello(ReducerContext ctx)
    {
        foreach (var person in ctx.Db.person.Iter())
        {
            Log.Info($"Hello, {person.Name}!");
        }
        Log.Info("Hello, World!");
    }

    [Reducer]
    public static void JoinGame(ReducerContext ctx, string player, GameMode gameMode)
    {
        var foundGame = FindLobbyGame(ctx, gameMode);

        if (foundGame != null)
        {
            Log.Info($"Player {player} joined game {foundGame.Value.Id}");
            InsertPlayerProgress(ctx, foundGame.Value.Id);

            // Check if this is the 4th player
            int playerCount = CountPlayersInGame(ctx, foundGame.Value.Id);
            if (playerCount >= 4)
            {
                // Cancel any pending bot fill triggers for this game
                CancelBotFillTrigger(ctx, foundGame.Value.Id);

                // Transition to Countdown state immediately
                var updatedGame = foundGame.Value;
                updatedGame.State = GameState.Countdown;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {foundGame.Value.Id} reached 4 players, transitioning to Countdown state");

                // Schedule StartGame after 3 seconds
                var threeSeconds = new TimeDuration { Microseconds = +3_000_000 };
                var scheduledTime = ctx.Timestamp + threeSeconds;

                ctx.Db.GameStart.Insert(new GameStart
                {
                    ScheduledId = 0,
                    GameId = foundGame.Value.Id,
                    ScheduledAt = new ScheduleAt.Time(scheduledTime)
                });
            }
        }
        else
        {
            var createdAtMs = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var newGame = ctx.Db.game.Insert(new Game
            {
                Id = 0,
                Phrase = "The quick brown fox jumps over the lazy dog",
                CreatedAt = createdAtMs,
                State = GameState.Lobby,
                GameMode = gameMode
            });

            Log.Info($"Player {player} created and joined game {newGame.Id}");
            InsertPlayerProgress(ctx, newGame.Id);

            // Schedule bot fill after 5 seconds instead of countdown
            var fiveSeconds = new TimeDuration { Microseconds = +5_000_000 };
            var futureTimestamp = ctx.Timestamp + fiveSeconds;

            ctx.Db.BotFillTrigger.Insert(new BotFillTrigger
            {
                ScheduledId = 0,
                GameId = newGame.Id,
                ScheduledAt = new ScheduleAt.Time(futureTimestamp)
            });
        }
    }

    private static Game? FindLobbyGame(ReducerContext ctx, GameMode gameMode)
    {
        // Use State index to only iterate over Lobby games
        foreach (var game in ctx.Db.game.State.Filter(GameState.Lobby))
        {
            if (game.GameMode == gameMode)
            {
                // Check if game has less than 4 players
                if (CountPlayersInGame(ctx, game.Id) < 4)
                {
                    return game;
                }
            }
        }
        return null;
    }

    private static int CountPlayersInGame(ReducerContext ctx, ulong gameId)
    {
        int count = 0;
        // Use GameId index to only iterate over progress for this game
        foreach (var progress in ctx.Db.player_progress.GameId.Filter(gameId))
        {
            count++;
        }
        return count;
    }

    private static void CancelBotFillTrigger(ReducerContext ctx, ulong gameId)
    {
        // Use GameId index to only iterate over triggers for this game
        var triggersToDelete = new List<BotFillTrigger>();
        foreach (var trigger in ctx.Db.BotFillTrigger.GameId.Filter(gameId))
        {
            triggersToDelete.Add(trigger);
        }

        foreach (var trigger in triggersToDelete)
        {
            ctx.Db.BotFillTrigger.ScheduledId.Delete(trigger.ScheduledId);
            Log.Info($"Cancelled bot fill trigger for game {gameId}");
        }
    }

    private static void InsertPlayerProgress(ReducerContext ctx, ulong gameId)
    {
        ctx.Db.player_progress.Insert(new PlayerProgress
        {
            Id = 0,
            PlayerId = ctx.Sender,
            GameId = gameId,
            ProgressIndex = 0,
            IsBot = false
        });
    }

    [Reducer]
    public static void FillGameWithBots(ReducerContext ctx, BotFillTrigger args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby)
        {
            int currentPlayerCount = CountPlayersInGame(ctx, args.GameId);
            
            // Fill with bots up to 4 players
            int botsToAdd = 4 - currentPlayerCount;
            
            for (int i = 0; i < botsToAdd; i++)
            {
                ctx.Db.player_progress.Insert(new PlayerProgress
                {
                    Id = 0,
                    PlayerId = Identity.ZERO, // Bot marker
                    GameId = args.GameId,
                    ProgressIndex = 0,
                    IsBot = true
                });
                
                Log.Info($"Added bot {i + 1} to game {args.GameId}");
            }

            // Transition to Countdown state after adding bots
            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} filled with {botsToAdd} bots and transitioned to Countdown state");

            // Schedule StartGame after 3 seconds
            var threeSeconds = new TimeDuration { Microseconds = +3_000_000 };
            var scheduledTime = ctx.Timestamp + threeSeconds;

            ctx.Db.GameStart.Insert(new GameStart
            {
                ScheduledId = 0,
                GameId = args.GameId,
                ScheduledAt = new ScheduleAt.Time(scheduledTime)
            });
        }
    }

    [Reducer]
    public static void StartGame(ReducerContext ctx, GameStart args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Countdown)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Racing;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Racing state");

            var fiveMinutes = new TimeDuration { Microseconds = +300_000_000 };
            var scheduledTime = ctx.Timestamp + fiveMinutes;

            ctx.Db.GameCompletion.Insert(new GameCompletion
            {
                ScheduledId = 0,
                GameId = args.GameId,
                ScheduledAt = new ScheduleAt.Time(scheduledTime)
            });
        }
    }

    [Reducer]
    public static void CompleteGame(ReducerContext ctx, GameCompletion args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Racing)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Archived;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Archived state");
        }
    }

    [Reducer]
    public static void UpdateProgress(ReducerContext ctx, ulong gameId, ulong newIndex)
    {
        var playerId = ctx.Sender;
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null || game.Value.State != GameState.Racing)
        {
            Log.Info($"Cannot update progress: game {gameId} is not in Racing state");
            return;
        }

        var existingProgress = FindPlayerProgress(ctx, playerId, gameId);

        if (existingProgress == null)
        {
            Log.Info($"No progress found for player {playerId} in game {gameId}");
            return;
        }

        var updatedProgress = existingProgress.Value;
        updatedProgress.ProgressIndex = newIndex;
        ctx.Db.player_progress.Id.Update(updatedProgress);

        Log.Info($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }

    private static PlayerProgress? FindPlayerProgress(ReducerContext ctx, Identity playerId, ulong gameId)
    {
        foreach (var progress in ctx.Db.player_progress.Iter())
        {
            if (progress.PlayerId == playerId && progress.GameId == gameId)
            {
                return progress;
            }
        }
        return null;
    }
}