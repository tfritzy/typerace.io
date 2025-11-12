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
    [Table(Name = "player", Public = true)]
    public partial struct Player
    {
        [PrimaryKey]
        public Identity Id;
        public string Name;
    }

    [Table(Name = "game", Public = true)]
    public partial struct Game
    {
        [PrimaryKey]
        public string Id;
        public string Phrase;
        public long CreatedAt;

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
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Scheduled = nameof(StartGame))]
    public partial struct GameStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Scheduled = nameof(CompleteGame))]
    public partial struct GameCompletion
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Name = "playerprogress", Public = true)]
    public partial struct PlayerProgress
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public string GameId;
        public ulong ProgressIndex;
        public bool IsBot;
        public long CreatedAt;
    }

    [Reducer]
    public static void Init(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void ClientConnected(ReducerContext ctx)
    {
        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer == null)
        {
            var animalName = AnimalNameGenerator.Generate(ctx.Rng);
            ctx.Db.player.Insert(new Player { Id = ctx.Sender, Name = $"Anonymous {animalName}" });
            Log.Info($"Created player record for new client {ctx.Sender}");
        }
    }

    [Reducer]
    public static void ClientDisconnected(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void SetPlayerName(ReducerContext ctx, string name)
    {
        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Name = name;
            ctx.Db.player.Id.Update(updatedPlayer);
            Log.Info($"Updated player name for {ctx.Sender} to {name}");
        }
    }

    [Reducer]
    public static void JoinGame(ReducerContext ctx, GameMode gameMode)
    {
        Log.Info($"Player {ctx.Sender} looking for game.");
        var foundGame = FindLobbyGame(ctx, gameMode);

        if (foundGame != null)
        {
            Log.Info($"Player {ctx.Sender} joined game {foundGame.Value.Id}");
            InsertPlayerProgress(ctx, foundGame.Value.Id);

            int playerCount = CountPlayersInGame(ctx, foundGame.Value.Id);
            if (playerCount >= 4)
            {
                CancelBotFillTrigger(ctx, foundGame.Value.Id);

                var updatedGame = foundGame.Value;
                updatedGame.State = GameState.Countdown;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {foundGame.Value.Id} reached 4 players, transitioning to Countdown state");

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
            var newGame = ctx.Db.game.Insert(new Game
            {
                Id = IdGenerator.Generate("game_", ctx.Rng),
                Phrase = PhraseGenerator.GeneratePhraseForMode(gameMode, ctx.Rng),
                CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                State = GameState.Lobby,
                GameMode = gameMode
            });

            Log.Info($"Player {ctx.Sender} created and joined game {newGame.Id}");
            InsertPlayerProgress(ctx, newGame.Id);

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
        foreach (var game in ctx.Db.game.State.Filter(GameState.Lobby))
        {
            if (game.GameMode == gameMode)
            {
                if (CountPlayersInGame(ctx, game.Id) < 4)
                {
                    return game;
                }
            }
        }
        return null;
    }

    private static int CountPlayersInGame(ReducerContext ctx, string gameId)
    {
        int count = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            count++;
        }
        return count;
    }

    private static void CancelBotFillTrigger(ReducerContext ctx, string gameId)
    {
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

    private static void InsertPlayerProgress(ReducerContext ctx, string gameId)
    {
        ctx.Db.playerprogress.Insert(new PlayerProgress
        {
            Id = IdGenerator.Generate("pp_", ctx.Rng),
            PlayerId = ctx.Sender,
            GameId = gameId,
            ProgressIndex = 0,
            IsBot = false,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch
        });
    }

    [Reducer]
    public static void FillGameWithBots(ReducerContext ctx, BotFillTrigger args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby)
        {
            int currentPlayerCount = CountPlayersInGame(ctx, args.GameId);

            int botsToAdd = 4 - currentPlayerCount;

            for (int i = 0; i < botsToAdd; i++)
            {
                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = new Identity(),
                    GameId = args.GameId,
                    ProgressIndex = 0,
                    IsBot = true,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch
                });

                Log.Info($"Added bot {i + 1} to game {args.GameId}");
            }

            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} filled with {botsToAdd} bots and transitioned to Countdown state");

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
    public static void UpdateProgress(ReducerContext ctx, string gameId, ulong newIndex)
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
        ctx.Db.playerprogress.Id.Update(updatedProgress);

        Log.Info($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }

    private static PlayerProgress? FindPlayerProgress(ReducerContext ctx, Identity playerId, string gameId)
    {
        foreach (var progress in ctx.Db.playerprogress.Iter())
        {
            if (progress.PlayerId == playerId && progress.GameId == gameId)
            {
                return progress;
            }
        }
        return null;
    }
}