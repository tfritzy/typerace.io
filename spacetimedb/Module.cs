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
        public int TotalGames;
        public int Wins;
        public int Level;
        public int Xp;
    }

    [Table(Name = "game", Public = true)]
    public partial struct Game
    {
        [PrimaryKey]
        public string Id;
        public string Phrase;
        public long CreatedAt;
        public long RacingStartedAt;

        [SpacetimeDB.Index.BTree]
        public GameState State;

        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;

        public List<Identity> Placements;
    }

    [Table(Name = "playerstats", Public = true)]
    public partial struct PlayerStats
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        public int Year;
        public int Month;
        public List<GameRecord> Games;
    }

    [Type]
    public partial struct GameRecord
    {
        public int WordCount;
        public long TimeMs;
        public int Placement;
        public double Wpm;
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

    [Table(Scheduled = nameof(ArchiveOldGames))]
    public partial struct GameArchiver
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
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
        public int ProgressIndex;
        public bool IsBot;
        public long CreatedAt;
    }

    [Table(Scheduled = nameof(UpdateBotProgress))]
    public partial struct BotProgressUpdate
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string PlayerProgressId;
        public int PhraseLength;
        public ScheduleAt ScheduledAt;
    }

    [Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        var fiveMinutes = new TimeDuration { Microseconds = 300_000_000 };

        ctx.Db.GameArchiver.Insert(new GameArchiver
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(fiveMinutes)
        });

        Log.Info("Initialized game archiver with 5-minute interval");
    }

    [Reducer(ReducerKind.ClientConnected)]
    public static void ClientConnected(ReducerContext ctx)
    {
        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer == null)
        {
            var animalName = AnimalNameGenerator.Generate(ctx.Rng);
            ctx.Db.player.Insert(new Player
            {
                Id = ctx.Sender,
                Name = $"Anonymous {animalName}",
                TotalGames = 0,
                Wins = 0,
                Level = 1,
                Xp = 0
            });
            Log.Info($"Created player record for new client {ctx.Sender}");
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
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
                RacingStartedAt = 0,
                State = GameState.Lobby,
                GameMode = gameMode,
                Placements = new List<Identity>()
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
    public static void UpdateBotProgress(ReducerContext ctx, BotProgressUpdate args)
    {
        var progress = ctx.Db.playerprogress.Id.Find(args.PlayerProgressId);

        if (progress != null && progress.Value.IsBot)
        {
            var game = ctx.Db.game.Id.Find(progress.Value.GameId);

            if (game != null && game.Value.State == GameState.Racing)
            {
                var updatedProgress = progress.Value;
                updatedProgress.ProgressIndex += 1;
                ctx.Db.playerprogress.Id.Update(updatedProgress);

                if (updatedProgress.ProgressIndex >= args.PhraseLength)
                {
                    var updatedGame = game.Value;
                    updatedGame.Placements.Add(progress.Value.PlayerId);
                    ctx.Db.game.Id.Update(updatedGame);

                    Log.Info($"Bot {progress.Value.PlayerId} finished game {game.Value.Id} in place {updatedGame.Placements.Count}");
                }
                else
                {
                    var delay = new TimeDuration { Microseconds = GenerateBotDelay(ctx.Rng) };
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = args.PlayerProgressId,
                        PhraseLength = args.PhraseLength,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + delay)
                    });
                }
            }
        }
    }

    private static long GenerateBotDelay(Random rng)
    {
        return 100_000 + rng.Next(150_000);
    }

    [Reducer]
    public static void StartGame(ReducerContext ctx, GameStart args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Countdown)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Racing;
            updatedGame.RacingStartedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Racing state");

            foreach (var progress in ctx.Db.playerprogress.GameId.Filter(args.GameId))
            {
                if (progress.IsBot)
                {
                    var delay = new TimeDuration { Microseconds = GenerateBotDelay(ctx.Rng) };
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = progress.Id,
                        PhraseLength = updatedGame.Phrase.Length,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + delay)
                    });
                }
            }
        }
    }

    [Reducer]
    public static void ArchiveOldGames(ReducerContext ctx, GameArchiver args)
    {
        var fiveMinutesAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;

        foreach (var game in ctx.Db.game.State.Filter(GameState.Racing))
        {
            if (game.CreatedAt < fiveMinutesAgo)
            {
                var updatedGame = game;
                updatedGame.State = GameState.Archived;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {game.Id} transitioned to Archived state");
            }
        }
    }

    private static void UpdatePlayerStatsForGame(ReducerContext ctx, PlayerProgress progress, Game game, int placement)
    {
        var player = ctx.Db.player.Id.Find(progress.PlayerId);
        if (player == null) return;

        var timeMs = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;
        timeMs = timeMs / 1000;

        var wordCount = game.Phrase.Split(' ').Length;
        var timeMinutes = timeMs / 60000.0;
        var wpm = game.Phrase.Length / 5.0 / timeMinutes;

        var year = 2025;
        var month = 11;

        var statsId = $"{progress.PlayerId}_{game.GameMode}_{year}_{month}";
        var existingStats = ctx.Db.playerstats.Id.Find(statsId);

        var gameRecord = new GameRecord
        {
            WordCount = wordCount,
            TimeMs = timeMs,
            Placement = placement,
            Wpm = wpm
        };

        if (existingStats == null)
        {
            var games = new List<GameRecord> { gameRecord };
            ctx.Db.playerstats.Insert(new PlayerStats
            {
                Id = statsId,
                PlayerId = progress.PlayerId,
                GameMode = game.GameMode,
                Year = year,
                Month = month,
                Games = games
            });
        }
        else
        {
            var updatedStats = existingStats.Value;
            updatedStats.Games.Add(gameRecord);
            ctx.Db.playerstats.Id.Update(updatedStats);
        }

        var xpEarned = CalculateXpForPlacement(placement);

        var updatedPlayer = player.Value;
        updatedPlayer.TotalGames += 1;
        if (placement == 1)
        {
            updatedPlayer.Wins += 1;
        }
        updatedPlayer.Xp += xpEarned;

        while (updatedPlayer.Xp >= XpRequiredForLevel(updatedPlayer.Level + 1))
        {
            updatedPlayer.Level += 1;
        }

        ctx.Db.player.Id.Update(updatedPlayer);

        Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}, earned {xpEarned} XP");
    }

    private static int CalculateXpForPlacement(int placement)
    {
        return placement switch
        {
            1 => 100,
            2 => 50,
            3 => 25,
            4 => 10,
            _ => 5
        };
    }

    private static int XpRequiredForLevel(int level)
    {
        return level * 100;
    }

    [Reducer]
    public static void UpdateProgress(ReducerContext ctx, string gameId, int newIndex)
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

        if (newIndex >= game.Value.Phrase.Length)
        {
            var updatedGame = game.Value;
            updatedGame.Placements.Add(playerId);
            var placement = updatedGame.Placements.Count;
            ctx.Db.game.Id.Update(updatedGame);

            if (!existingProgress.Value.IsBot)
            {
                UpdatePlayerStatsForGame(ctx, updatedProgress, updatedGame, placement);
            }

            Log.Info($"Player {playerId} finished game {gameId} in place {placement}");
        }
        else
        {
            Log.Info($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
        }
    }

    private static PlayerProgress? FindPlayerProgress(ReducerContext ctx, Identity playerId, string gameId)
    {
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            if (progress.PlayerId == playerId)
            {
                return progress;
            }
        }
        return null;
    }
}