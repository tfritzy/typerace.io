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
    Red,
    Orange,
    Amber,
    Yellow,
    Lime,
    Green,
    Emerald,
    Teal,
    Cyan,
    Sky,
    Blue,
    Indigo,
    Violet,
    Purple,
    Fuchsia,
    Pink,
    Rose
}



[Type]
public partial struct XpMultiplier
{
    public string Label;
    public string Value;
    public string Type;
}

[Type]
public partial struct BotConfig
{
    public double TypingRate;
    public double ErrorRate;
}

[Type]
public partial struct GameModeCount
{
    public GameType GameType;
    public GameMode GameMode;
    public int FinishedGames;
    public int NonLonelyGames;
    public int StartedGames;
    public double TotalWpm;
    public double MinWpm;
    public double MaxWpm;
    public int GameCount;
}

public static partial class Module
{
    private const long PUBLIC_GAME_COUNTDOWN_MICROSECONDS = 3_000_000;
    private const long PRIVATE_GAME_COUNTDOWN_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_MICROSECONDS = 5_000_000;
    private const long BOT_FILL_DELAY_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS = 1_000_000;
    private const int EVENT_SIZE_BYTES = 3;
    private const ushort MAX_DECISECONDS = ushort.MaxValue;

    private static byte[] EncodeCharacterEvent(long gameStartMicros, long eventMicros, CharacterEventType eventType)
    {
        var elapsedMicros = eventMicros - gameStartMicros;
        var deciseconds = (ushort)Math.Min(elapsedMicros / 100_000, MAX_DECISECONDS);

        return new byte[]
        {
            (byte)(deciseconds & 0xFF),
            (byte)((deciseconds >> 8) & 0xFF),
            (byte)eventType
        };
    }

    private static void AppendCharacterEvent(ref byte[] history, long gameStartMicros, long eventMicros, CharacterEventType eventType)
    {
        var eventBytes = EncodeCharacterEvent(gameStartMicros, eventMicros, eventType);
        var newHistory = new byte[history.Length + EVENT_SIZE_BYTES];
        Array.Copy(history, newHistory, history.Length);
        Array.Copy(eventBytes, 0, newHistory, history.Length, EVENT_SIZE_BYTES);
        history = newHistory;
    }

    private static int CountEventsByType(byte[] history, CharacterEventType eventType)
    {
        int count = 0;
        for (int i = 0; i <= history.Length - EVENT_SIZE_BYTES; i += EVENT_SIZE_BYTES)
        {
            var type = (CharacterEventType)history[i + 2];
            if (type == eventType)
            {
                count++;
            }
        }
        return count;
    }

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
        public int XpRequiredForNextLevel;
        public int TotalWordsTyped;
        public long TotalTimeMs;
        [SpacetimeDB.Index.BTree]
        public bool IsBot;
        public BotConfig? BotConfig;
        public PlayerColor Color;
        public bool IsAnonymous;
        public long LastGameDate;
    }

    [Table(Name = "game", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(State), nameof(GameType) })]
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
        public Identity? Owner;
    }

    [Table(Name = "gamerecord", Public = true)]
    public partial struct GameRecord
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string GameId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        [SpacetimeDB.Index.BTree]
        public GameType GameType;
        [SpacetimeDB.Index.BTree]
        public int Year;
        [SpacetimeDB.Index.BTree]
        public int Month;
        public long Date;
        public long TimeMs;
        public int Placement;
        public double Wpm;
        public int XpGained;
        public int EloChange;
    }

    [Table(Name = "personalrecord", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(PlayerId), nameof(GameMode) })]
    public partial struct PersonalRecord
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        public string GameRecordId;
        public double Wpm;
    }

    [Table(Name = "xpgain", Public = true)]
    public partial struct XpGain
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string GameId;
        [SpacetimeDB.Index.BTree]
        public long Timestamp;
        public int BaseXp;
        public List<XpMultiplier> Multipliers;
        public int TotalXp;
    }

    [Table(Name = "elo", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(PlayerId), nameof(GameMode) })]
    public partial struct Elo
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        public int Rating;
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

    [Table(Scheduled = nameof(CleanupOldXpGains))]
    public partial struct XpGainCleaner
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Name = "globalstats", Public = true)]
    public partial struct GlobalStats
    {
        [PrimaryKey]
        public string Date;
        public List<GameModeCount> Stats;
        public GameModeCount Total;
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
        public bool IsAnonymous;
        public long CreatedAt;
        public byte[] CharacterHistory;
        public long Time;
        public int Placement;
        public string JoinCode;
        public double Wpm;
        public PlayerColor PlayerColor;
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

        ctx.Db.XpGainCleaner.Insert(new XpGainCleaner
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(fiveMinutes)
        });

        Log.Info("Initialized XP gain cleaner with 5-minute interval");

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
                XpRequiredForNextLevel = XpRequiredForLevel(2),
                TotalWordsTyped = 0,
                TotalTimeMs = 0,
                IsBot = true,
                BotConfig = new BotConfig
                {
                    TypingRate = typingRate,
                    ErrorRate = errorRate
                },
                Color = GenerateRandomColor(ctx.Rng),
                IsAnonymous = false,
                LastGameDate = 0
            });
        }

        Log.Info("Initialized 100 bot players");
    }

    private static double GenerateTypingRate(Random rng)
    {
        var meanWpm = 70.0;
        var stdDev = 20.0;
        var wpm = GenerateNormalDistribution(rng, meanWpm, stdDev);
        wpm = Math.Max(35.0, Math.Min(120.0, wpm));
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
        var colors = Enum.GetValues<PlayerColor>();
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
                XpRequiredForNextLevel = XpRequiredForLevel(2),
                TotalWordsTyped = 0,
                TotalTimeMs = 0,
                IsBot = false,
                BotConfig = null,
                Color = PlayerColor.Amber,
                IsAnonymous = true,
                LastGameDate = 0
            });
            Log.Info($"Created player record for new client {ctx.Sender}");
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnected(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void SyncAnonymousStatus(ReducerContext ctx, bool isAnonymous)
    {
        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.IsAnonymous = isAnonymous;

            if (!isAnonymous && updatedPlayer.Name.StartsWith("Anonymous "))
            {
                var newAdjective = GenerateNonAnonymousAdjective(ctx.Rng);
                updatedPlayer.Name = updatedPlayer.Name.Replace("Anonymous", newAdjective);
                Log.Info($"Updated player name from Anonymous to {newAdjective} for {ctx.Sender}");
            }

            ctx.Db.player.Id.Update(updatedPlayer);
            Log.Info($"Updated anonymous status for {ctx.Sender} to {isAnonymous}");
        }
    }

    private static string GenerateNonAnonymousAdjective(Random rng)
    {
        string[] adjectives = { "Shiny", "Sparkly", "Exothermic", "Exuberant" };
        return adjectives[rng.Next(adjectives.Length)];
    }

    [Reducer]
    public static void SetPlayerName(ReducerContext ctx, string name)
    {
        const int MinNameLength = 1;
        const int MaxNameLength = 30;

        if (string.IsNullOrWhiteSpace(name))
        {
            Log.Info($"Player {ctx.Sender} attempted to set empty name");
            return;
        }

        var trimmedName = name.Trim();

        if (trimmedName.Length < MinNameLength || trimmedName.Length > MaxNameLength)
        {
            Log.Info($"Player {ctx.Sender} attempted to set name with invalid length: {trimmedName.Length}");
            return;
        }

        var existingPlayer = ctx.Db.player.Id.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Name = trimmedName;
            ctx.Db.player.Id.Update(updatedPlayer);
            Log.Info($"Updated player name for {ctx.Sender} to {trimmedName}");
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
        if (gameType != GameType.Public)
        {
            return null;
        }

        foreach (var game in ctx.Db.game.State_GameType.Filter((GameState.Lobby, GameType.Public)))
        {
            if (CountPlayersInGame(ctx, game.Id) < GetMaxPlayerCount(gameType))
            {
                if (FindPlayerProgress(ctx, ctx.Sender, game.Id) == null)
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
            Placements = new List<Identity>(),
            Owner = ctx.Sender
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
        var isAnonymous = player?.IsAnonymous ?? true;
        var playerColor = player?.Color ?? PlayerColor.Amber;

        ctx.Db.playerprogress.Insert(new PlayerProgress
        {
            Id = IdGenerator.Generate("pp_", ctx.Rng),
            PlayerId = ctx.Sender,
            GameId = gameId,
            PlayerName = playerName,
            PlayerLevel = playerLevel,
            ProgressIndex = 0,
            IsBot = false,
            IsAnonymous = isAnonymous,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            CharacterHistory = new byte[0],
            Time = 0,
            Placement = -1,
            JoinCode = joinCode,
            PlayerColor = playerColor
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

            var humanPlayerElos = new List<int>();
            foreach (var progress in ctx.Db.playerprogress.GameId.Filter(args.GameId))
            {
                if (!progress.IsBot)
                {
                    var playerElo = GetOrCreatePlayerElo(ctx, progress.PlayerId, game.Value.GameMode);
                    humanPlayerElos.Add(playerElo.Rating);
                }
            }

            int targetElo = humanPlayerElos.Count > 0 ? (int)humanPlayerElos.Average() : 1000;

            var eligibleBots = GetEligibleBots(ctx, game.Value.GameMode, targetElo, args.GameId);

            if (eligibleBots.Count == 0)
            {
                Log.Info($"No eligible bot players available to fill game {args.GameId}");
                return;
            }

            var selectedBots = new List<Player>();
            for (int i = 0; i < botsToAdd && eligibleBots.Count > 0; i++)
            {
                var botIndex = ctx.Rng.Next(eligibleBots.Count);
                var selectedBot = eligibleBots[botIndex];
                selectedBots.Add(selectedBot);
                eligibleBots.RemoveAt(botIndex);
            }

            foreach (var selectedBot in selectedBots)
            {
                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = selectedBot.Id,
                    GameId = args.GameId,
                    PlayerName = selectedBot.Name,
                    PlayerLevel = selectedBot.Level,
                    ProgressIndex = 0,
                    IsBot = true,
                    IsAnonymous = false,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                    CharacterHistory = new byte[0],
                    Time = 0,
                    Placement = -1,
                    JoinCode = "",
                    PlayerColor = selectedBot.Color
                });

                Log.Info($"Added bot {selectedBot.Name} (ELO: {GetBotElo(ctx, selectedBot.Id, game.Value.GameMode)}) to game {args.GameId} (target ELO: {targetElo})");
            }

            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} filled with {selectedBots.Count} bots and transitioned to Countdown state");

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

    private static List<Player> GetEligibleBots(ReducerContext ctx, GameMode gameMode, int targetElo, string gameId)
    {
        var botsWithElo = new List<(Player bot, int elo)>();
        foreach (var bot in ctx.Db.player.IsBot.Filter(true))
        {
            int botElo = GetBotElo(ctx, bot.Id, gameMode);
            botsWithElo.Add((bot, botElo));
        }

        botsWithElo.Sort((a, b) => a.elo.CompareTo(b.elo));

        int targetIndex = botsWithElo.Count / 2;
        for (int i = 0; i < botsWithElo.Count; i++)
        {
            if (botsWithElo[i].elo >= targetElo)
            {
                targetIndex = i;
                break;
            }
        }

        int startIndex = Math.Max(0, targetIndex - 10);
        int endIndex = Math.Min(botsWithElo.Count - 1, targetIndex + 10);

        var eligibleBots = new List<Player>();
        for (int i = startIndex; i <= endIndex; i++)
        {
            eligibleBots.Add(botsWithElo[i].bot);
        }

        return eligibleBots;
    }

    private static int GetBotElo(ReducerContext ctx, Identity botId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.elo.PlayerId_GameMode.Filter((botId, gameMode)))
        {
            return elo.Rating;
        }
        return 1000;
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

                if (shouldError)
                {
                    var updatedProgress = progress.Value;
                    AppendCharacterEvent(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, CharacterEventType.Incorrect);
                    AppendCharacterEvent(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, CharacterEventType.Backspace);
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
                    var newIndex = progress.Value.ProgressIndex + 1;
                    ProcessProgressUpdate(ctx, progress.Value, game.Value, newIndex, CharacterEventType.Correct);

                    if (newIndex < args.PhraseLength)
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

        if (game.Value.GameType == GameType.Private && game.Value.Owner != ctx.Sender)
        {
            Log.Info($"Player {ctx.Sender} is not the owner of private game {gameId}");
            return;
        }

        var senderProgress = FindPlayerProgress(ctx, ctx.Sender, gameId);
        if (senderProgress == null)
        {
            Log.Info($"Player {ctx.Sender} is not in game {gameId}");
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
    public static void JoinPrivateGame(ReducerContext ctx, string gameId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType != GameType.Private)
        {
            Log.Info($"Game {gameId} is not a private game");
            return;
        }

        if (game.Value.State != GameState.Lobby)
        {
            Log.Info($"Cannot join game {gameId} - game is not in lobby state");
            return;
        }

        var existingProgress = FindPlayerProgress(ctx, ctx.Sender, gameId);
        if (existingProgress != null)
        {
            Log.Info($"Player {ctx.Sender} is already in game {gameId}");
            return;
        }

        InsertPlayerProgress(ctx, gameId, "");
        Log.Info($"Player {ctx.Sender} joined private game {gameId}");
    }

    [Reducer]
    public static void Rematch(ReducerContext ctx, string gameId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType == GameType.Private && game.Value.Owner != ctx.Sender)
        {
            Log.Info($"Player {ctx.Sender} is not the owner of private game {gameId}");
            return;
        }

        var senderProgress = FindPlayerProgress(ctx, ctx.Sender, gameId);
        if (senderProgress == null)
        {
            Log.Info($"Player {ctx.Sender} is not in game {gameId}");
            return;
        }

        var newGame = InsertGame(ctx, game.Value.GameMode, game.Value.GameType);

        Log.Info($"Created rematch game {newGame.Id} for original game {gameId}");

        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            if (!progress.IsBot)
            {
                var player = ctx.Db.player.Id.Find(progress.PlayerId);
                var playerName = player?.Name ?? "Unknown";
                var playerLevel = player?.Level ?? 1;
                var isAnonymous = player?.IsAnonymous ?? true;
                var playerColor = player?.Color ?? PlayerColor.Amber;

                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = progress.PlayerId,
                    GameId = newGame.Id,
                    PlayerName = playerName,
                    PlayerLevel = playerLevel,
                    ProgressIndex = 0,
                    IsBot = false,
                    IsAnonymous = isAnonymous,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                    CharacterHistory = new byte[0],
                    Time = 0,
                    Placement = -1,
                    JoinCode = gameId,
                    PlayerColor = playerColor
                });

                Log.Info($"Added player {progress.PlayerId} to rematch game {newGame.Id} with join code {gameId}");
            }
        }
    }

    private static void UpdateGlobalStatsForGame(ReducerContext ctx, Game game)
    {
        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var dateKey = dateTime.ToString("yyyy-MM-dd");

        var existingStats = ctx.Db.globalstats.Date.Find(dateKey);
        List<GameModeCount> statsList;
        GameModeCount total;

        if (existingStats == null)
        {
            statsList = new List<GameModeCount>();
            total = new GameModeCount
            {
                GameType = GameType.Public,
                GameMode = GameMode.English500,
                FinishedGames = 0,
                NonLonelyGames = 0,
                StartedGames = 0,
                TotalWpm = 0,
                MinWpm = double.MaxValue,
                MaxWpm = 0,
                GameCount = 0
            };
        }
        else
        {
            statsList = existingStats.Value.Stats;
            total = existingStats.Value.Total;
        }

        GameModeCount? existingCount = null;
        int existingIndex = -1;
        for (int i = 0; i < statsList.Count; i++)
        {
            if (statsList[i].GameType == game.GameType && statsList[i].GameMode == game.GameMode)
            {
                existingCount = statsList[i];
                existingIndex = i;
                break;
            }
        }

        GameModeCount count;
        if (existingCount == null)
        {
            count = new GameModeCount
            {
                GameType = game.GameType,
                GameMode = game.GameMode,
                FinishedGames = 0,
                NonLonelyGames = 0,
                StartedGames = 0,
                TotalWpm = 0,
                MinWpm = double.MaxValue,
                MaxWpm = 0,
                GameCount = 0
            };
        }
        else
        {
            count = existingCount.Value;
        }

        count.StartedGames++;
        total.StartedGames++;

        var hasFinishedPlayers = false;
        var finishedHumanCount = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (progress.Placement > 0)
            {
                hasFinishedPlayers = true;

                if (!progress.IsBot)
                {
                    finishedHumanCount++;
                    var wpm = progress.Wpm;
                    if (wpm > 0)
                    {
                        count.TotalWpm += wpm;
                        count.GameCount++;
                        total.TotalWpm += wpm;
                        total.GameCount++;

                        if (wpm < count.MinWpm)
                        {
                            count.MinWpm = wpm;
                        }
                        if (wpm > count.MaxWpm)
                        {
                            count.MaxWpm = wpm;
                        }

                        if (wpm < total.MinWpm)
                        {
                            total.MinWpm = wpm;
                        }
                        if (wpm > total.MaxWpm)
                        {
                            total.MaxWpm = wpm;
                        }
                    }
                }
            }
        }

        if (hasFinishedPlayers)
        {
            count.FinishedGames++;
            total.FinishedGames++;
            
            if (finishedHumanCount > 1)
            {
                count.NonLonelyGames++;
                total.NonLonelyGames++;
            }
        }

        if (count.GameCount == 0)
        {
            count.MinWpm = 0;
        }

        if (total.GameCount == 0)
        {
            total.MinWpm = 0;
        }

        if (existingIndex >= 0)
        {
            statsList[existingIndex] = count;
        }
        else
        {
            statsList.Add(count);
        }

        if (existingStats == null)
        {
            ctx.Db.globalstats.Insert(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total
            });
        }
        else
        {
            ctx.Db.globalstats.Date.Update(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total
            });
        }

        Log.Info($"Updated global stats for date {dateKey}, GameType {game.GameType}, GameMode {game.GameMode}");
    }

    [Reducer]
    public static void ArchiveOldGames(ReducerContext ctx, GameArchiver args)
    {
        var fiveMinutesAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;

        foreach (var game in ctx.Db.game.State.Filter(GameState.Racing))
        {
            if (game.CreatedAt < fiveMinutesAgo)
            {
                UpdateGlobalStatsForGame(ctx, game);

                var updatedGame = game;
                updatedGame.State = GameState.Archived;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {game.Id} transitioned to Archived state");
            }
        }
    }

    [Reducer]
    public static void CleanupOldXpGains(ReducerContext ctx, XpGainCleaner args)
    {
        var fiveMinutesAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;
        var deletedCount = 0;

        foreach (var xpGain in ctx.Db.xpgain.Iter())
        {
            if (xpGain.Timestamp < fiveMinutesAgo)
            {
                ctx.Db.xpgain.Id.Delete(xpGain.Id);
                deletedCount++;
            }
        }

        if (deletedCount > 0)
        {
            Log.Info($"Cleaned up {deletedCount} XP gain records older than 5 minutes");
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

        var wpm = CalculateWpm(game.Phrase.Length, timeElapsed);

        var wordsTyped = game.Phrase.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;

        var updatedPlayer = player.Value;
        var xpGained = AwardXpForGame(ctx, ref updatedPlayer, progress, game, placement, wordsTyped);
        UpdatePlayerStats(ref updatedPlayer, placement, wordsTyped, timeElapsed);
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.player.Id.Update(updatedPlayer);

        var eloChange = UpdatePlayerElo(ctx, progress.PlayerId, game, placement);

        var statsId = IdGenerator.Generate("gr_", ctx.Rng);

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var year = dateTime.Year;
        var month = dateTime.Month;

        ctx.Db.gamerecord.Insert(new GameRecord
        {
            Id = statsId,
            PlayerId = progress.PlayerId,
            GameId = game.Id,
            GameMode = game.GameMode,
            GameType = game.GameType,
            Year = year,
            Month = month,
            Date = timestamp,
            TimeMs = timeElapsed / 1000,
            Placement = placement,
            Wpm = wpm,
            XpGained = xpGained,
            EloChange = eloChange
        });

        UpdatePersonalRecord(ctx, progress.PlayerId, game.GameMode, statsId, wpm);

        Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}, typed {wordsTyped} words");
    }

    private static void UpdatePlayerStats(ref Player player, int placement, int wordsTyped, long timeElapsed)
    {
        player.TotalGames += 1;
        if (placement == 1)
        {
            player.Wins += 1;
        }
        player.TotalWordsTyped += wordsTyped;
        player.TotalTimeMs += timeElapsed / 1000;
    }

    private static void LevelUpPlayer(ref Player player)
    {
        while (true)
        {
            var xpRequired = XpRequiredForLevel(player.Level + 1);
            if (player.Xp < xpRequired)
            {
                player.XpRequiredForNextLevel = xpRequired;
                break;
            }
            player.Xp -= xpRequired;
            player.Level += 1;
        }
    }

    private static void UpdatePersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, string gameRecordId, double wpm)
    {
        PersonalRecord? existingRecord = null;
        foreach (var record in ctx.Db.personalrecord.PlayerId_GameMode.Filter((playerId, gameMode)))
        {
            existingRecord = record;
            break;
        }

        if (existingRecord == null || wpm > existingRecord.Value.Wpm)
        {
            if (existingRecord != null)
            {
                ctx.Db.personalrecord.Id.Delete(existingRecord.Value.Id);
            }

            ctx.Db.personalrecord.Insert(new PersonalRecord
            {
                Id = IdGenerator.Generate("pr_", ctx.Rng),
                PlayerId = playerId,
                GameMode = gameMode,
                GameRecordId = gameRecordId,
                Wpm = wpm
            });

            Log.Info($"Updated personal record for player {playerId} in mode {gameMode}: {wpm} WPM");
        }
    }

    private static int AwardXpForGame(ReducerContext ctx, ref Player player, PlayerProgress progress, Game game, int placement, int wordsTyped)
    {
        if (player.IsAnonymous)
        {
            return 0;
        }

        var currentTimestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var isFirstGameToday = IsFirstGameOfDay(player.LastGameDate, currentTimestamp);

        var totalPlayers = ctx.Db.playerprogress.GameId.Filter(game.Id).Count();
        var (baseXp, placementMultiplier, accuracyMultiplier, accuracy, xpBeforeBonus) = CalculateXpBreakdown(wordsTyped, placement, progress);
        
        if (totalPlayers <= 2)
        {
            placementMultiplier = 1.0;
            xpBeforeBonus = (int)(baseXp * placementMultiplier * accuracyMultiplier);
        }
        
        var xpEarned = xpBeforeBonus;

        var multipliers = new List<XpMultiplier>
        {
            new XpMultiplier
            {
                Label = $"Base ({wordsTyped} words)",
                Value = $"{baseXp} XP",
                Type = "base"
            }
        };

        if (totalPlayers > 2)
        {
            multipliers.Add(new XpMultiplier
            {
                Label = $"{GetPlacementLabel(placement)} Place",
                Value = $"×{placementMultiplier:F1}",
                Type = "multiplier"
            });
        }

        multipliers.Add(new XpMultiplier
        {
            Label = $"{Math.Round(accuracy * 100)}% Accuracy",
            Value = $"×{accuracyMultiplier:F2}",
            Type = "multiplier"
        });

        if (isFirstGameToday)
        {
            xpEarned += 100;
            multipliers.Add(new XpMultiplier
            {
                Label = "First Game Today! 🎉",
                Value = "+100 XP",
                Type = "bonus"
            });
        }

        ctx.Db.xpgain.Insert(new XpGain
        {
            Id = IdGenerator.Generate("xpg_", ctx.Rng),
            PlayerId = progress.PlayerId,
            GameId = game.Id,
            Timestamp = currentTimestamp,
            BaseXp = baseXp,
            Multipliers = multipliers,
            TotalXp = xpEarned
        });

        player.Xp += xpEarned;
        player.LastGameDate = currentTimestamp;

        Log.Info($"Player {progress.PlayerId} earned {xpEarned} XP");

        return xpEarned;
    }

    private static (int baseXp, double placementMultiplier, double accuracyMultiplier, double accuracy, int xpBeforeBonus) CalculateXpBreakdown(int wordsTyped, int placement, PlayerProgress progress)
    {
        var baseXp = wordsTyped;

        var placementMultiplier = placement switch
        {
            1 => 2.0,
            2 => 1.5,
            _ => 1.0
        };

        var correctEvents = CountEventsByType(progress.CharacterHistory, CharacterEventType.Correct);
        var incorrectEvents = CountEventsByType(progress.CharacterHistory, CharacterEventType.Incorrect);
        var totalEvents = correctEvents + incorrectEvents;

        var accuracy = totalEvents > 0 ? (double)correctEvents / totalEvents : 0.0;
        var accuracyMultiplier = 0.5 + accuracy;

        var xpBeforeBonus = (int)(baseXp * placementMultiplier * accuracyMultiplier);

        return (baseXp, placementMultiplier, accuracyMultiplier, accuracy, xpBeforeBonus);
    }

    private static string GetPlacementLabel(int placement)
    {
        return placement switch
        {
            1 => "1st",
            2 => "2nd",
            3 => "3rd",
            _ => $"{placement}th"
        };
    }

    private static bool IsFirstGameOfDay(long lastGameDate, long currentDate)
    {
        if (lastGameDate == 0)
        {
            return true;
        }

        var lastGameDay = DateTimeOffset.FromUnixTimeMilliseconds(lastGameDate / 1000).Date;
        var currentDay = DateTimeOffset.FromUnixTimeMilliseconds(currentDate / 1000).Date;

        return currentDay > lastGameDay;
    }

    private static int XpRequiredForLevel(int level)
    {
        if (level <= 1)
        {
            return 0;
        }

        if (level > 1000)
        {
            return 10000;
        }

        double baseXp = 500.0;
        double maxXp = 10000.0;
        double growthRate = Math.Log(maxXp / baseXp) / (1000.0 - 2.0);

        return (int)Math.Round(baseXp * Math.Exp(growthRate * (level - 2)));
    }

    private static int UpdatePlayerElo(ReducerContext ctx, Identity playerId, Game game, int placement)
    {
        if (game.GameType == GameType.Private || game.GameType == GameType.Practice)
        {
            return 0;
        }

        var currentElo = GetOrCreatePlayerElo(ctx, playerId, game.GameMode);

        var totalEloChange = 0;
        var opponentCount = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (progress.PlayerId != playerId)
            {
                opponentCount++;
                var opponentElo = GetOrCreatePlayerElo(ctx, progress.PlayerId, game.GameMode);
                var actualScore = (progress.Placement == -1 || progress.Placement > placement) ? 1.0 : 0.0;
                var eloChange = CalculateEloChange(currentElo.Rating, opponentElo.Rating, actualScore);
                totalEloChange += eloChange;
            }
        }

        if (opponentCount == 0)
        {
            return 0;
        }

        var updatedElo = currentElo;
        updatedElo.Rating += totalEloChange;
        updatedElo.Rating = Math.Max(0, updatedElo.Rating);
        ctx.Db.elo.Id.Update(updatedElo);

        Log.Info($"Player {playerId} ELO updated: {currentElo.Rating} -> {updatedElo.Rating} (change: {totalEloChange:+0;-0}) in mode {game.GameMode}");

        return totalEloChange;
    }

    private static Elo GetOrCreatePlayerElo(ReducerContext ctx, Identity playerId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.elo.PlayerId_GameMode.Filter((playerId, gameMode)))
        {
            return elo;
        }

        var newElo = ctx.Db.elo.Insert(new Elo
        {
            Id = IdGenerator.Generate("elo_", ctx.Rng),
            PlayerId = playerId,
            GameMode = gameMode,
            Rating = 1000
        });

        Log.Info($"Created initial ELO for player {playerId} in mode {gameMode}: 1000");
        return newElo;
    }

    private static int CalculateEloChange(int playerElo, int opponentElo, double actualScore)
    {
        var kFactor = 32.0;

        var expectedScore = 1.0 / (1.0 + Math.Pow(10.0, (opponentElo - playerElo) / 400.0));

        var eloChange = kFactor * (actualScore - expectedScore);

        return (int)Math.Round(eloChange);
    }

    private static double CalculateWpm(int characterCount, long timeMicroseconds)
    {
        if (timeMicroseconds <= 0 || characterCount <= 0)
        {
            return 0;
        }

        var charsPerWord = 5.0;
        var timeSeconds = timeMicroseconds / 1_000_000.0;
        var timeMinutes = timeSeconds / 60.0;
        return characterCount / charsPerWord / timeMinutes;
    }

    private static void ProcessProgressUpdate(
        ReducerContext ctx,
        PlayerProgress progress,
        Game game,
        int newIndex,
        CharacterEventType eventType)
    {
        var updatedProgress = progress;
        updatedProgress.ProgressIndex = newIndex;
        AppendCharacterEvent(ref updatedProgress.CharacterHistory, game.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, eventType);

        var elapsedMicros = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;
        updatedProgress.Wpm = CalculateWpm(newIndex, elapsedMicros);

        ctx.Db.playerprogress.Id.Update(updatedProgress);

        if (newIndex >= game.Phrase.Length)
        {
            var updatedGame = game;
            updatedGame.Placements.Add(progress.PlayerId);
            var placement = updatedGame.Placements.Count;
            ctx.Db.game.Id.Update(updatedGame);

            var timeElapsed = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;

            UpdatePlayerStatsForGame(ctx, updatedProgress, updatedGame, placement, timeElapsed);

            Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}");
        }
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

        ProcessProgressUpdate(ctx, existingProgress.Value, game.Value, newIndex, eventType);
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