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
    Ukrainian500,
    Arabic500,
    Hindi500,
    Dutch500,
    Swedish500,
    Turkish500
}

[Type]
public enum GameType
{
    Public,
    Private,
    Practice
}

[Type]
public enum CharacterEventType
{
    Correct,
    Incorrect,
    Backspace
}

[Type]
public enum PlayerColor
{
    Amber,
    Blue,
    Green,
    Purple,
    Red,
    Pink,
    Cyan,
    Orange,
    Lime,
    Indigo
}

[Type]
public partial struct CharacterEvent
{
    public long Timestamp;
    public CharacterEventType EventType;
}

[Type]
public partial struct BotConfig
{
    public double TypingRate;
    public double ErrorRate;
}

public static partial class Module
{
    private const long PUBLIC_GAME_COUNTDOWN_MICROSECONDS = 3_000_000;
    private const long PRIVATE_GAME_COUNTDOWN_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_MICROSECONDS = 5_000_000;
    private const long BOT_FILL_DELAY_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS = 1_000_000;

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
        [SpacetimeDB.Index.BTree]
        public bool IsBot;
        public BotConfig? BotConfig;
        public PlayerColor Color;
    }

    [Table(Name = "game", Public = true)]
    public partial struct Game
    {
        [PrimaryKey]
        public string Id;
        public string Phrase;
        public long CreatedAt;
        public long RacingStartedAt;
        public long CountdownDurationMs;

        [SpacetimeDB.Index.BTree]
        public GameState State;

        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;

        [SpacetimeDB.Index.BTree]
        public GameType GameType;

        public List<Identity> Placements;
    }

    [Table(Name = "gamerecord", Public = true)]
    public partial struct GameRecord
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        [SpacetimeDB.Index.BTree]
        public int Year;
        [SpacetimeDB.Index.BTree]
        public int Month;
        public long Date;
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

    [Table(Scheduled = nameof(StartCountdown))]
    public partial struct CountdownStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
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
        public string PlayerName;
        public int PlayerLevel;
        public int ProgressIndex;
        public bool IsBot;
        public long CreatedAt;
        public List<CharacterEvent> CharacterHistory;
        public long Time;
        public int Placement;
        public string JoinCode;
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

        for (int i = 0; i < 100; i++)
        {
            var botName = RobotNameGenerator.Generate(ctx.Rng);
            var typingRate = GenerateTypingRate(ctx.Rng);
            var errorRate = GenerateErrorRate(ctx.Rng);
            
            var identityBytes = Guid.NewGuid().ToByteArray();
            Array.Resize(ref identityBytes, 32);
            var identity = new Identity(identityBytes);
            
            ctx.Db.player.Insert(new Player
            {
                Id = identity,
                Name = botName,
                TotalGames = 0,
                Wins = 0,
                Level = 1,
                Xp = 0,
                IsBot = true,
                BotConfig = new BotConfig
                {
                    TypingRate = typingRate,
                    ErrorRate = errorRate
                },
                Color = GenerateRandomColor(ctx.Rng)
            });
        }

        Log.Info("Initialized 100 bot players");
    }

    private static double GenerateTypingRate(Random rng)
    {
        var meanWpm = 40.0;
        var stdDev = 15.0;
        var wpm = GenerateNormalDistribution(rng, meanWpm, stdDev);
        wpm = Math.Max(20.0, Math.Min(80.0, wpm));
        var charactersPerSecond = (wpm * 5.0) / 60.0;
        var microsecondsPerCharacter = 1_000_000.0 / charactersPerSecond;
        return microsecondsPerCharacter;
    }

    private static double GenerateErrorRate(Random rng)
    {
        var meanErrorRate = 0.05;
        var stdDev = 0.03;
        var errorRate = GenerateNormalDistribution(rng, meanErrorRate, stdDev);
        return Math.Max(0.0, Math.Min(0.15, errorRate));
    }

    private static double GenerateNormalDistribution(Random rng, double mean, double stdDev)
    {
        var u1 = 1.0 - rng.NextDouble();
        var u2 = 1.0 - rng.NextDouble();
        var randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        return mean + stdDev * randStdNormal;
    }

    private static PlayerColor GenerateRandomColor(Random rng)
    {
        var colors = new[] { 
            PlayerColor.Amber, 
            PlayerColor.Blue, 
            PlayerColor.Green, 
            PlayerColor.Purple, 
            PlayerColor.Red, 
            PlayerColor.Pink, 
            PlayerColor.Cyan, 
            PlayerColor.Orange, 
            PlayerColor.Lime, 
            PlayerColor.Indigo 
        };
        return colors[rng.Next(colors.Length)];
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
                Xp = 0,
                IsBot = false,
                BotConfig = null,
                Color = PlayerColor.Amber
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
    public static void SetPlayerColor(ReducerContext ctx, PlayerColor color)
    {
        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Color = color;
            ctx.Db.player.Id.Update(updatedPlayer);
            Log.Info($"Updated player color for {ctx.Sender} to {color}");
        }
    }

    [Reducer]
    public static void JoinGame(ReducerContext ctx, GameMode gameMode, string joinCode, GameType gameType)
    {
        Log.Info($"Player {ctx.Sender} looking for game.");
        var foundGame = FindLobbyGame(ctx, gameMode, gameType);

        if (foundGame != null)
        {
            Log.Info($"Player {ctx.Sender} joined game {foundGame.Value.Id}");
            InsertPlayerProgress(ctx, foundGame.Value.Id, joinCode);

            int playerCount = CountPlayersInGame(ctx, foundGame.Value.Id);
            int requiredPlayers = GetMaxPlayerCount(foundGame.Value.GameType);
            
            if (playerCount >= requiredPlayers)
            {
                CancelBotFillTrigger(ctx, foundGame.Value.Id);

                var updatedGame = foundGame.Value;
                updatedGame.State = GameState.Countdown;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {foundGame.Value.Id} reached {requiredPlayers} players, transitioning to Countdown state");

                long countdownDuration = GetCountdownDuration(foundGame.Value.GameType);
                var countdownTime = new TimeDuration { Microseconds = countdownDuration };
                var scheduledTime = ctx.Timestamp + countdownTime;

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
            var newGame = InsertGame(ctx, gameMode, gameType);

            Log.Info($"Player {ctx.Sender} created and joined game {newGame.Id}");
            InsertPlayerProgress(ctx, newGame.Id, joinCode);

            int playerCount = CountPlayersInGame(ctx, newGame.Id);
            int requiredPlayers = GetMaxPlayerCount(gameType);

            if (playerCount >= requiredPlayers)
            {
                if (gameType == GameType.Practice)
                {
                    var startDelay = new TimeDuration { Microseconds = PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS };
                    var scheduledTime = ctx.Timestamp + startDelay;

                    ctx.Db.CountdownStart.Insert(new CountdownStart
                    {
                        ScheduledId = 0,
                        GameId = newGame.Id,
                        ScheduledAt = new ScheduleAt.Time(scheduledTime)
                    });

                    Log.Info($"Practice game {newGame.Id} scheduled to start countdown in 1 second");
                }
                else
                {
                    var updatedGame = newGame;
                    updatedGame.State = GameState.Countdown;
                    ctx.Db.game.Id.Update(updatedGame);

                    Log.Info($"Game {newGame.Id} reached {requiredPlayers} players, transitioning to Countdown state");

                    long countdownDuration = GetCountdownDuration(gameType);
                    var countdownTime = new TimeDuration { Microseconds = countdownDuration };
                    var scheduledTime = ctx.Timestamp + countdownTime;

                    ctx.Db.GameStart.Insert(new GameStart
                    {
                        ScheduledId = 0,
                        GameId = newGame.Id,
                        ScheduledAt = new ScheduleAt.Time(scheduledTime)
                    });
                }
            }
            else if (gameType == GameType.Public)
            {
                var botFillDelay = new TimeDuration { Microseconds = BOT_FILL_DELAY_MICROSECONDS };
                var futureTimestamp = ctx.Timestamp + botFillDelay;

                ctx.Db.BotFillTrigger.Insert(new BotFillTrigger
                {
                    ScheduledId = 0,
                    GameId = newGame.Id,
                    ScheduledAt = new ScheduleAt.Time(futureTimestamp)
                });
            }
        }
    }

    private static Game? FindLobbyGame(ReducerContext ctx, GameMode gameMode, GameType gameType)
    {
        foreach (var game in ctx.Db.game.State.Filter(GameState.Lobby))
        {
            if (game.GameMode == gameMode && game.GameType == gameType)
            {
                if (CountPlayersInGame(ctx, game.Id) < GetMaxPlayerCount(gameType))
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

    private static int GetMaxPlayerCount(GameType gameType)
    {
        return gameType == GameType.Practice ? 1 : 3;
    }

    private static long GetCountdownDuration(GameType gameType)
    {
        return gameType switch
        {
            GameType.Public => PUBLIC_GAME_COUNTDOWN_MICROSECONDS,
            GameType.Private => PRIVATE_GAME_COUNTDOWN_MICROSECONDS,
            GameType.Practice => PRACTICE_GAME_COUNTDOWN_MICROSECONDS,
            _ => PRIVATE_GAME_COUNTDOWN_MICROSECONDS
        };
    }

    private static Game InsertGame(ReducerContext ctx, GameMode gameMode, GameType gameType)
    {
        long countdownDurationMicros = GetCountdownDuration(gameType);
        long countdownDurationMs = countdownDurationMicros / 1000;
        
        return ctx.Db.game.Insert(new Game
        {
            Id = IdGenerator.Generate("game_", ctx.Rng),
            Phrase = PhraseGenerator.GeneratePhraseForMode(gameMode, ctx.Rng),
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            RacingStartedAt = 0,
            CountdownDurationMs = countdownDurationMs,
            State = GameState.Lobby,
            GameMode = gameMode,
            GameType = gameType,
            Placements = new List<Identity>()
        });
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

    private static void InsertPlayerProgress(ReducerContext ctx, string gameId, string joinCode)
    {
        var player = ctx.Db.player.Id.Find(ctx.Sender);
        var playerName = player?.Name ?? "Unknown";
        var playerLevel = player?.Level ?? 1;

        ctx.Db.playerprogress.Insert(new PlayerProgress
        {
            Id = IdGenerator.Generate("pp_", ctx.Rng),
            PlayerId = ctx.Sender,
            GameId = gameId,
            PlayerName = playerName,
            PlayerLevel = playerLevel,
            ProgressIndex = 0,
            IsBot = false,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            CharacterHistory = new List<CharacterEvent>(),
            Time = 0,
            Placement = -1,
            JoinCode = joinCode
        });
    }

    [Reducer]
    public static void FillGameWithBots(ReducerContext ctx, BotFillTrigger args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby && game.Value.GameType == GameType.Public)
        {
            int currentPlayerCount = CountPlayersInGame(ctx, args.GameId);

            int botsToAdd = 3 - currentPlayerCount;

            var availableBots = new List<Player>();
            foreach (var player in ctx.Db.player.IsBot.Filter(true))
            {
                availableBots.Add(player);
            }

            if (availableBots.Count == 0)
            {
                Log.Info($"No bot players available to fill game {args.GameId}");
                return;
            }

            for (int i = 0; i < botsToAdd; i++)
            {
                var botIndex = ctx.Rng.Next(availableBots.Count);
                var selectedBot = availableBots[botIndex];

                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = selectedBot.Id,
                    GameId = args.GameId,
                    PlayerName = selectedBot.Name,
                    PlayerLevel = selectedBot.Level,
                    ProgressIndex = 0,
                    IsBot = true,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                    CharacterHistory = new List<CharacterEvent>(),
                    Time = 0,
                    Placement = -1,
                    JoinCode = ""
                });

                Log.Info($"Added bot {selectedBot.Name} to game {args.GameId}");
            }

            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} filled with {botsToAdd} bots and transitioned to Countdown state");

            long countdownDuration = GetCountdownDuration(game.Value.GameType);
            var countdownTime = new TimeDuration { Microseconds = countdownDuration };
            var scheduledTime = ctx.Timestamp + countdownTime;

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
                var botPlayer = ctx.Db.player.Id.Find(progress.Value.PlayerId);
                if (botPlayer == null || botPlayer.Value.BotConfig == null)
                {
                    Log.Info($"Bot player {progress.Value.PlayerId} not found or missing BotConfig");
                    return;
                }

                var botConfig = botPlayer.Value.BotConfig.Value;
                var shouldError = ctx.Rng.NextDouble() < botConfig.ErrorRate;

                var updatedProgress = progress.Value;
                
                if (shouldError)
                {
                    updatedProgress.CharacterHistory.Add(new CharacterEvent
                    {
                        Timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                        EventType = CharacterEventType.Incorrect
                    });
                    updatedProgress.CharacterHistory.Add(new CharacterEvent
                    {
                        Timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                        EventType = CharacterEventType.Backspace
                    });
                    ctx.Db.playerprogress.Id.Update(updatedProgress);
                    
                    var errorDelay = new TimeDuration { Microseconds = (long)(botConfig.TypingRate * 0.5) };
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = args.PlayerProgressId,
                        PhraseLength = args.PhraseLength,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + errorDelay)
                    });
                }
                else
                {
                    updatedProgress.ProgressIndex += 1;
                    updatedProgress.CharacterHistory.Add(new CharacterEvent
                    {
                        Timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                        EventType = CharacterEventType.Correct
                    });
                    ctx.Db.playerprogress.Id.Update(updatedProgress);

                    if (updatedProgress.ProgressIndex >= args.PhraseLength)
                    {
                        var updatedGame = game.Value;
                        updatedGame.Placements.Add(progress.Value.PlayerId);
                        var placement = updatedGame.Placements.Count;
                        ctx.Db.game.Id.Update(updatedGame);

                        var timeElapsed = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.Value.RacingStartedAt;
                        updatedProgress.Time = timeElapsed;
                        updatedProgress.Placement = placement;
                        ctx.Db.playerprogress.Id.Update(updatedProgress);

                        Log.Info($"Bot {progress.Value.PlayerId} finished game {game.Value.Id} in place {placement}");
                    }
                    else
                    {
                        var delay = new TimeDuration { Microseconds = GenerateBotDelayWithVariance(ctx.Rng, botConfig.TypingRate) };
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
    }

    private static long GenerateBotDelayWithVariance(Random rng, double baseTypingRate)
    {
        var variance = 0.2;
        var randomFactor = 1.0 + (rng.NextDouble() * 2.0 - 1.0) * variance;
        return (long)(baseTypingRate * randomFactor);
    }

    private static long GenerateBotDelay(Random rng)
    {
        return 100_000 + rng.Next(150_000);
    }

    [Reducer]
    public static void StartCountdown(ReducerContext ctx, CountdownStart args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Countdown state");

            long countdownDuration = GetCountdownDuration(game.Value.GameType);
            var countdownTime = new TimeDuration { Microseconds = countdownDuration };
            var scheduledTime = ctx.Timestamp + countdownTime;

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
            updatedGame.RacingStartedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Racing state");

            foreach (var progress in ctx.Db.playerprogress.GameId.Filter(args.GameId))
            {
                if (progress.IsBot)
                {
                    var botPlayer = ctx.Db.player.Id.Find(progress.PlayerId);
                    long delayMicroseconds;
                    
                    if (botPlayer != null && botPlayer.Value.BotConfig != null)
                    {
                        var botConfig = botPlayer.Value.BotConfig.Value;
                        delayMicroseconds = GenerateBotDelayWithVariance(ctx.Rng, botConfig.TypingRate);
                    }
                    else
                    {
                        delayMicroseconds = GenerateBotDelay(ctx.Rng);
                    }
                    
                    var delay = new TimeDuration { Microseconds = delayMicroseconds };
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
    public static void StartPrivateGame(ReducerContext ctx, string gameId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType == GameType.Public)
        {
            Log.Info($"Game {gameId} is not a private or practice game");
            return;
        }

        if (game.Value.State != GameState.Lobby)
        {
            Log.Info($"Game {gameId} is not in Lobby state");
            return;
        }

        var updatedGame = game.Value;
        updatedGame.State = GameState.Countdown;
        ctx.Db.game.Id.Update(updatedGame);

        Log.Info($"Private/practice game {gameId} transitioned to Countdown state");

        long countdownDuration = GetCountdownDuration(game.Value.GameType);
        var countdownTime = new TimeDuration { Microseconds = countdownDuration };
        var scheduledTime = ctx.Timestamp + countdownTime;

        ctx.Db.GameStart.Insert(new GameStart
        {
            ScheduledId = 0,
            GameId = gameId,
            ScheduledAt = new ScheduleAt.Time(scheduledTime)
        });
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

                var progressToDelete = new List<string>();
                foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
                {
                    progressToDelete.Add(progress.Id);
                }

                foreach (var progressId in progressToDelete)
                {
                    ctx.Db.playerprogress.Id.Delete(progressId);
                }

                Log.Info($"Game {game.Id} transitioned to Archived state and deleted {progressToDelete.Count} player progress records");
            }
        }
    }

    private static void UpdatePlayerStatsForGame(ReducerContext ctx, PlayerProgress progress, Game game, int placement, long timeElapsed)
    {
        var updatedProgress = progress;
        updatedProgress.Time = timeElapsed;
        updatedProgress.Placement = placement;
        ctx.Db.playerprogress.Id.Update(updatedProgress);

        var player = ctx.Db.player.Id.Find(progress.PlayerId);
        if (player == null) return;

        var timeMs = timeElapsed / 1000;

        var timeMinutes = timeMs / 60000.0;
        var wpm = game.Phrase.Length / 5.0 / timeMinutes;

        var statsId = IdGenerator.Generate("gr_", ctx.Rng);

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var year = dateTime.Year;
        var month = dateTime.Month;

        ctx.Db.gamerecord.Insert(new GameRecord
        {
            Id = statsId,
            PlayerId = progress.PlayerId,
            GameMode = game.GameMode,
            Year = year,
            Month = month,
            Date = timestamp,
            TimeMs = timeMs,
            Placement = placement,
            Wpm = wpm
        });

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
            updatedPlayer.Xp -= XpRequiredForLevel(updatedPlayer.Level + 1);
            updatedPlayer.Level += 1;
        }

        ctx.Db.player.Id.Update(updatedPlayer);

        Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}, earned {xpEarned} XP");
    }

    private static int CalculateXpForPlacement(int placement)
    {
        return placement switch
        {
            1 => 50,
            2 => 25,
            3 => 13,
            4 => 5,
            _ => 3
        };
    }

    private static int XpRequiredForLevel(int level)
    {
        if (level <= 1)
        {
            return 0;
        }
        
        if (level > 100)
        {
            return 5000;
        }
        
        double baseXp = 100.0;
        double maxXp = 5000.0;
        double growthRate = Math.Log(maxXp / baseXp) / (100.0 - 2.0);
        
        return (int)Math.Round(baseXp * Math.Exp(growthRate * (level - 2)));
    }

    [Reducer]
    public static void UpdateProgress(ReducerContext ctx, string gameId, int newIndex, CharacterEventType eventType)
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

        var characterEvent = new CharacterEvent
        {
            Timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            EventType = eventType
        };
        updatedProgress.CharacterHistory.Add(characterEvent);

        ctx.Db.playerprogress.Id.Update(updatedProgress);

        if (newIndex >= game.Value.Phrase.Length)
        {
            var updatedGame = game.Value;
            updatedGame.Placements.Add(playerId);
            var placement = updatedGame.Placements.Count;
            ctx.Db.game.Id.Update(updatedGame);

            var timeElapsed = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.Value.RacingStartedAt;

            if (!existingProgress.Value.IsBot)
            {
                UpdatePlayerStatsForGame(ctx, updatedProgress, updatedGame, placement, timeElapsed);
            }
            else
            {
                updatedProgress.Time = timeElapsed;
                updatedProgress.Placement = placement;
                ctx.Db.playerprogress.Id.Update(updatedProgress);
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