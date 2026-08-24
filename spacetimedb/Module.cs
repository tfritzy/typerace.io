using SpacetimeDB;

namespace StdbModule;

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
    Turkish500,
    EnglishQuotes,
    SpanishQuotes,
    FrenchQuotes,
    GermanQuotes,
    ItalianQuotes,
    PortugueseQuotes,
    JapaneseQuotes,
    KoreanQuotes,
    ChineseQuotes,
    UkrainianQuotes,
    ArabicQuotes,
    HindiQuotes,
    DutchQuotes,
    SwedishQuotes,
    TurkishQuotes,
    Russian500,
    RussianQuotes,
    Romanian500,
    RomanianQuotes,
    Indonesian500,
    IndonesianQuotes,
    Polish500,
    PolishQuotes,
    Czech500,
    CzechQuotes
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


public struct Quote
{
    public string Id;
    public string Text;
    public string Author;
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
    private const int MAX_ABANDONED_GAMES = 10;
    private const long PUBLIC_GAME_COUNTDOWN_MICROSECONDS = 4_000_000;
    private const long PRIVATE_GAME_COUNTDOWN_MICROSECONDS = 6_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_MICROSECONDS = 4_000_000;
    private const long BOT_FILL_DELAY_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS = 1_000_000;
    private const long BOT_RECOGNITION_DELAY_MIN_MICROSECONDS = 100_000;
    private const long BOT_RECOGNITION_DELAY_RANGE_MICROSECONDS = 300_000;
    private const long BOT_HESITATION_DELAY_MIN_MICROSECONDS = 400_000;
    private const long BOT_HESITATION_DELAY_RANGE_MICROSECONDS = 600_000;
    private const long BOT_MIN_KEYSTROKE_DELAY_MICROSECONDS = 50_000;
    private const double BOT_BURST_PROBABILITY = 0.10;
    private const double BOT_HESITATION_PROBABILITY = 0.04;
    private const double BOT_BURST_SPEED_MULTIPLIER = 0.65;
    private const double BOT_BACKSPACE_SPEED_MULTIPLIER = 0.6;
    private const double BOT_RECOVERY_DELAY_MIN_MULTIPLIER = 0.5;
    private const double BOT_RECOVERY_DELAY_RANGE_MULTIPLIER = 0.5;


    private static double GetLanguageTypingSpeedModifier(GameMode mode)
    {
        switch (mode)
        {
            case GameMode.English500:
            case GameMode.EnglishQuotes:
                return 1.0;
            case GameMode.Spanish500:
            case GameMode.SpanishQuotes:
                return 40.0 / 35.0;
            case GameMode.French500:
            case GameMode.FrenchQuotes:
                return 40.0 / 35.0;
            case GameMode.German500:
            case GameMode.GermanQuotes:
                return 40.0 / 35.0;
            case GameMode.Italian500:
            case GameMode.ItalianQuotes:
                return 40.0 / 35.0;
            case GameMode.Portuguese500:
            case GameMode.PortugueseQuotes:
                return 40.0 / 35.0;
            case GameMode.Japanese500:
            case GameMode.JapaneseQuotes:
                return 40.0 / 30.0 * 5.0;
            case GameMode.Korean500:
            case GameMode.KoreanQuotes:
                return 40.0 / 25.0 * 5.0;
            case GameMode.Chinese500:
            case GameMode.ChineseQuotes:
                return 40.0 / 20.0 * 5.0;
            case GameMode.Ukrainian500:
            case GameMode.UkrainianQuotes:
                return 40.0 / 30.0;
            case GameMode.Arabic500:
            case GameMode.ArabicQuotes:
                return 40.0 / 25.0;
            case GameMode.Hindi500:
            case GameMode.HindiQuotes:
                return 40.0 / 25.0;
            case GameMode.Dutch500:
            case GameMode.DutchQuotes:
                return 40.0 / 38.0;
            case GameMode.Swedish500:
            case GameMode.SwedishQuotes:
                return 40.0 / 38.0;
            case GameMode.Turkish500:
            case GameMode.TurkishQuotes:
                return 40.0 / 32.0;
            case GameMode.Russian500:
            case GameMode.RussianQuotes:
                return 40.0 / 30.0;
            case GameMode.Romanian500:
            case GameMode.RomanianQuotes:
                return 40.0 / 35.0;
            case GameMode.Indonesian500:
            case GameMode.IndonesianQuotes:
                return 40.0 / 35.0;
            case GameMode.Polish500:
            case GameMode.PolishQuotes:
                return 40.0 / 35.0;
            case GameMode.Czech500:
            case GameMode.CzechQuotes:
                return 40.0 / 32.0;
            default:
                return 1.0;
        }
    }

    [Table(Name = "player", Public = true)]
    public partial struct Player
    {
        [PrimaryKey]
        public Identity Identity;
        [SpacetimeDB.Index.BTree]
        public string PlayerId;
        public string Name;
        public int TotalGames;
        public int Wins;
        public int Level;
        public int Xp;
        public int XpRequiredForNextLevel;
        public int TotalWordsTyped;
        public long TotalTimeSpentMs;
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
        [Default("")]
        public string? Attribution;
        [Default(0)]
        public int AllowedErrors;
    }

    [Table(Name = "gamerecord", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameRecord.PlayerId), nameof(GameRecord.Day) })]
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
        [SpacetimeDB.Index.BTree]
        [Default("")]
        public string Day;
        [Default(0)]
        public double Accuracy;
        [Default(0)]
        public int PhraseLength;
        [Default(false)]
        public bool IsPersonalBest;
    }

    [Table(Name = "personalrecord", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(PlayerId), nameof(GameMode), nameof(PhraseLength) })]
    public partial struct PersonalRecord
    {
        [PrimaryKey]
        public string Id;
        public Identity PlayerId;
        public GameMode GameMode;
        public string GameRecordId;
        [Default("")]
        public string GameId;
        public double Wpm;
        [Default(0)]
        public double Accuracy;
        [Default(null!)]
        public int? PhraseLength;
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

    [Table(Name = "game_score", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameId), nameof(Language), nameof(Day) })]
    public partial struct GameScore
    {
        [PrimaryKey]
        public string Id;
        public string GameId;
        public string Language;
        public Identity PlayerId;
        public string PlayerName;
        public int Value;
        [SpacetimeDB.Index.BTree]
        public long Timestamp;
        public long TimeMs;
        public string Day;
    }

    [Table(Name = "game_highscore", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameId), nameof(Language) })]
    public partial struct GameHighScore
    {
        [PrimaryKey]
        public string Id;
        public string GameId;
        public string Language;
        public Identity PlayerId;
        public string PlayerName;
        public int Value;
        public long Timestamp;
        public long TimeMs;
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

    [Table(Scheduled = nameof(CleanupOldScores))]
    public partial struct ScoreCleaner
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
        [Default(0)]
        public int DailyActivePlayers;
    }

    [Table(Name = "abandonedgames", Public = true)]
    public partial struct AbandonedGame
    {
        [PrimaryKey]
        public string GameId;
        public GameMode GameMode;
        public long CreatedAt;
        [SpacetimeDB.Index.BTree]
        public long ArchivedAt;
        public int PlacementCount;
    }

    [Table(Name = "playerprogress", Public = true)]
    public partial struct PlayerProgress
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string PlayerPublicId;
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
        [SpacetimeDB.Index.BTree]
        public string JoinCode;
        public double Wpm;
        public PlayerColor PlayerColor;
        [Default(0)]
        public int HighestProgress;
        [Default(0)]
        public int AutofixesRemaining;
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
    public static void init(ReducerContext ctx)
    {
        var fiveMinutes = new TimeDuration { Microseconds = 300_000_000 };

        ctx.Db.GameArchiver.Insert(new GameArchiver
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(fiveMinutes)
        });

        Log.Info("Initialized game archiver with 5-minute interval");

        ctx.Db.ScoreCleaner.Insert(new ScoreCleaner
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(fiveMinutes)
        });

        Log.Info("Initialized score cleaner with 5-minute interval");

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
                Identity = identity,
                PlayerId = IdGenerator.Generate("plyr_", ctx.Rng),
                Name = botName,
                TotalGames = 0,
                Wins = 0,
                Level = 1,
                Xp = 0,
                XpRequiredForNextLevel = XpRequiredForLevel(2),
                TotalWordsTyped = 0,
                TotalTimeSpentMs = 0,
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
    public static void clientConnected(ReducerContext ctx)
    {
        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

        if (existingPlayer == null)
        {
            var animalName = AnimalNameGenerator.Generate(ctx.Rng);
            ctx.Db.player.Insert(new Player
            {
                Identity = ctx.Sender,
                PlayerId = IdGenerator.Generate("plyr_", ctx.Rng),
                Name = $"Anonymous {animalName}",
                TotalGames = 0,
                Wins = 0,
                Level = 1,
                Xp = 0,
                XpRequiredForNextLevel = XpRequiredForLevel(2),
                TotalWordsTyped = 0,
                TotalTimeSpentMs = 0,
                IsBot = false,
                BotConfig = null,
                Color = GenerateRandomColor(ctx.Rng),
                IsAnonymous = true,
                LastGameDate = 0
            });
            Log.Info($"Created player record for new client {ctx.Sender}");
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void clientDisconnected(ReducerContext ctx)
    {
    }

    [Reducer]
    public static void syncAnonymousStatus(ReducerContext ctx, bool isAnonymous)
    {
        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

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

            ctx.Db.player.Identity.Update(updatedPlayer);
            Log.Info($"Updated anonymous status for {ctx.Sender} to {isAnonymous}");
        }
    }

    [Reducer]
    public static void ping(ReducerContext ctx, ulong nonce)
    {
        // The reducer callback echoes the nonce, which lets the caller measure
        // the database round trip without creating subscription traffic.
    }

    private static string GenerateNonAnonymousAdjective(Random rng)
    {
        string[] adjectives = { "Shiny", "Sparkly", "Exothermic", "Exuberant" };
        return adjectives[rng.Next(adjectives.Length)];
    }

    [Reducer]
    public static void setPlayerName(ReducerContext ctx, string name)
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

        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Name = trimmedName;
            ctx.Db.player.Identity.Update(updatedPlayer);
            Log.Info($"Updated player name for {ctx.Sender} to {trimmedName}");
        }
    }

    [Reducer]
    public static void joinGame(ReducerContext ctx, GameMode gameMode, string joinCode, GameType gameType)
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
            if (game.GameMode == gameMode)
            {
                if (CountPlayersInGame(ctx, game.Id) < GetMaxPlayerCount(gameType))
                {
                    if (FindPlayerProgress(ctx, ctx.Sender, game.Id) == null)
                    {
                        return game;
                    }
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
        return gameType switch
        {
            GameType.Practice => 1,
            GameType.Public => 3,
            GameType.Private => 6,
            _ => 3
        };
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

        var phrase = PhraseGenerator.GeneratePhraseForMode(gameMode, ctx.Rng);

        return ctx.Db.game.Insert(new Game
        {
            Id = IdGenerator.Generate("game_", ctx.Rng),
            Phrase = phrase.Text,
            Attribution = phrase.Attribution,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            RacingStartedAt = 0,
            CountdownDurationMs = countdownDurationMs,
            State = GameState.Lobby,
            GameMode = gameMode,
            GameType = gameType,
            Placements = new List<Identity>(),
            Owner = ctx.Sender,
            AllowedErrors = GetAllowedErrorCount(phrase.Text)
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
        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        var playerName = player?.Name ?? "Unknown";
        var playerLevel = player?.Level ?? 1;
        var isAnonymous = player?.IsAnonymous ?? true;
        var playerPublicId = player?.PlayerId ?? "";

        ctx.Db.playerprogress.Insert(new PlayerProgress
        {
            Id = IdGenerator.Generate("pp_", ctx.Rng),
            PlayerId = ctx.Sender,
            PlayerPublicId = playerPublicId,
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
            PlayerColor = GenerateRandomColor(ctx.Rng)
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
                    PlayerId = selectedBot.Identity,
                    PlayerPublicId = selectedBot.PlayerId,
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
                    PlayerColor = GenerateRandomColor(ctx.Rng)
                });

                Log.Info($"Added bot {selectedBot.Name} (ELO: {GetBotElo(ctx, selectedBot.Identity, game.Value.GameMode)}) to game {args.GameId} (target ELO: {targetElo})");
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
            int botElo = GetBotElo(ctx, bot.Identity, gameMode);
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
                var botPlayer = ctx.Db.player.Identity.Find(progress.Value.PlayerId);
                if (botPlayer == null || botPlayer.Value.BotConfig == null)
                {
                    Log.Info($"Bot player {progress.Value.PlayerId} not found or missing BotConfig");
                    return;
                }

                var botConfig = botPlayer.Value.BotConfig.Value;
                var langModifier = GetLanguageTypingSpeedModifier(game.Value.GameMode);
                var adjustedTypingRate = botConfig.TypingRate * langModifier;
                var shouldError = ctx.Rng.NextDouble() < botConfig.ErrorRate / 4;

                if (shouldError)
                {
                    var phrase = game.Value.Phrase;
                    var progressIndex = progress.Value.ProgressIndex;

                    int wordStart = progressIndex;
                    while (wordStart > 0 && phrase[wordStart - 1] != ' ')
                    {
                        wordStart--;
                    }
                    int charsToDelete = progressIndex - wordStart;

                    var updatedProgress = progress.Value;
                    CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, CharacterEventType.Incorrect);

                    long recognitionDelay = BOT_RECOGNITION_DELAY_MIN_MICROSECONDS + (long)(ctx.Rng.NextDouble() * BOT_RECOGNITION_DELAY_RANGE_MICROSECONDS);
                    long backspaceInterval = (long)(adjustedTypingRate * BOT_BACKSPACE_SPEED_MULTIPLIER);

                    for (int i = 0; i <= charsToDelete; i++)
                    {
                        long eventTime = ctx.Timestamp.MicrosecondsSinceUnixEpoch + recognitionDelay + i * backspaceInterval;
                        CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, eventTime, CharacterEventType.Backspace);
                    }

                    updatedProgress.ProgressIndex = wordStart;
                    ctx.Db.playerprogress.Id.Update(updatedProgress);

                    long totalBackspaceTime = recognitionDelay + (charsToDelete + 1) * backspaceInterval;
                    long recoveryDelay = (long)(adjustedTypingRate * (BOT_RECOVERY_DELAY_MIN_MULTIPLIER + ctx.Rng.NextDouble() * BOT_RECOVERY_DELAY_RANGE_MULTIPLIER));
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = args.PlayerProgressId,
                        PhraseLength = args.PhraseLength,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + new TimeDuration { Microseconds = totalBackspaceTime + recoveryDelay })
                    });
                }
                else
                {
                    var newIndex = progress.Value.ProgressIndex + 1;
                    ProcessProgressUpdate(ctx, progress.Value, game.Value, newIndex, CharacterEventType.Correct);

                    if (newIndex < args.PhraseLength)
                    {
                        bool justTypedSpace = progress.Value.ProgressIndex < game.Value.Phrase.Length &&
                                              game.Value.Phrase[progress.Value.ProgressIndex] == ' ';

                        var delay = GenerateRealisticBotDelay(ctx.Rng, adjustedTypingRate, justTypedSpace);
                        ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                        {
                            ScheduledId = 0,
                            PlayerProgressId = args.PlayerProgressId,
                            PhraseLength = args.PhraseLength,
                            ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + new TimeDuration { Microseconds = delay })
                        });
                    }
                }
            }
        }
    }

    private static long GenerateRealisticBotDelay(Random rng, double baseTypingRate, bool justTypedSpace)
    {
        bool inBurst = rng.NextDouble() < BOT_BURST_PROBABILITY;
        bool hesitate = !inBurst && rng.NextDouble() < BOT_HESITATION_PROBABILITY;

        double rate = baseTypingRate;

        if (inBurst)
        {
            rate *= BOT_BURST_SPEED_MULTIPLIER;
        }

        if (justTypedSpace)
        {
            rate *= 1.5 + rng.NextDouble() * 1.0;
        }

        var variance = 0.2;
        var randomFactor = 1.0 + (rng.NextDouble() * 2.0 - 1.0) * variance;
        long delay = (long)(rate * randomFactor);

        if (hesitate)
        {
            delay += BOT_HESITATION_DELAY_MIN_MICROSECONDS + (long)(rng.NextDouble() * BOT_HESITATION_DELAY_RANGE_MICROSECONDS);
        }

        return Math.Max(delay, BOT_MIN_KEYSTROKE_DELAY_MICROSECONDS);
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
                    var botPlayer = ctx.Db.player.Identity.Find(progress.PlayerId);
                    long delayMicroseconds;

                    if (botPlayer != null && botPlayer.Value.BotConfig != null)
                    {
                        var botConfig = botPlayer.Value.BotConfig.Value;
                        var langModifier = GetLanguageTypingSpeedModifier(updatedGame.GameMode);
                        var adjustedRate = botConfig.TypingRate * langModifier;
                        delayMicroseconds = GenerateBotDelayWithVariance(ctx.Rng, adjustedRate);
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
    public static void startPrivateGame(ReducerContext ctx, string gameId)
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
    public static void joinPrivateGame(ReducerContext ctx, string gameId)
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
    public static void kickPlayer(ReducerContext ctx, string gameId, Identity targetPlayerId)
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

        if (game.Value.Owner != ctx.Sender)
        {
            Log.Info($"Player {ctx.Sender} is not the owner of private game {gameId}");
            return;
        }

        if (targetPlayerId == ctx.Sender)
        {
            Log.Info($"Owner {ctx.Sender} cannot kick themselves from game {gameId}");
            return;
        }

        var targetProgress = FindPlayerProgress(ctx, targetPlayerId, gameId);
        if (targetProgress == null)
        {
            Log.Info($"Target player {targetPlayerId} is not in game {gameId}");
            return;
        }

        ctx.Db.playerprogress.Id.Delete(targetProgress.Value.Id);
        Log.Info($"Player {targetPlayerId} was kicked from game {gameId} by owner {ctx.Sender}");
    }

    [Reducer]
    public static void rematch(ReducerContext ctx, string gameId)
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
                var player = ctx.Db.player.Identity.Find(progress.PlayerId);
                var playerName = player?.Name ?? "Unknown";
                var playerLevel = player?.Level ?? 1;
                var isAnonymous = player?.IsAnonymous ?? true;
                var playerPublicId = player?.PlayerId ?? "";

                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = progress.PlayerId,
                    PlayerPublicId = playerPublicId,
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
                    PlayerColor = GenerateRandomColor(ctx.Rng)
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

        Log.Info($"[UpdateGlobalStats] Processing game {game.Id} for date {dateKey}");

        var existingStats = ctx.Db.globalstats.Date.Find(dateKey);
        List<GameModeCount> statsList;
        GameModeCount total;
        int dailyActivePlayers;

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
            dailyActivePlayers = 0;
            Log.Info($"[UpdateGlobalStats] Creating NEW global stats for {dateKey}");
        }
        else
        {
            statsList = existingStats.Value.Stats;
            total = existingStats.Value.Total;
            dailyActivePlayers = existingStats.Value.DailyActivePlayers;
            Log.Info($"[UpdateGlobalStats] Updating EXISTING global stats for {dateKey}, DailyActivePlayers={dailyActivePlayers}");
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

        var finishedHumanCount = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (progress.Placement > 0)
            {
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

        if (finishedHumanCount > 0)
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

        Log.Info($"[UpdateGlobalStats] Game {game.Id} stats: FinishedHumans={finishedHumanCount}, TotalGames={count.StartedGames}, FinishedGames={count.FinishedGames}");

        if (existingStats == null)
        {
            ctx.Db.globalstats.Insert(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }
        else
        {
            ctx.Db.globalstats.Date.Update(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }

        Log.Info($"Updated global stats for date {dateKey}, GameType {game.GameType}, GameMode {game.GameMode}");
    }

    private static void RecordAbandonedGame(ReducerContext ctx, Game game)
    {
        if (game.GameType != GameType.Public || game.Placements.Count >= GetMaxPlayerCount(game.GameType))
        {
            return;
        }

        var hasHumanTypingData = false;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (!progress.IsBot && progress.CharacterHistory.Length > 0)
            {
                hasHumanTypingData = true;
                break;
            }
        }

        if (!hasHumanTypingData)
        {
            return;
        }

        AbandonedGame? oldestGame = null;
        var abandonedGameCount = 0;
        foreach (var abandonedGame in ctx.Db.abandonedgames.Iter())
        {
            abandonedGameCount++;
            if (
                oldestGame == null ||
                abandonedGame.ArchivedAt < oldestGame.Value.ArchivedAt ||
                (
                    abandonedGame.ArchivedAt == oldestGame.Value.ArchivedAt &&
                    (
                        abandonedGame.CreatedAt < oldestGame.Value.CreatedAt ||
                        (
                            abandonedGame.CreatedAt == oldestGame.Value.CreatedAt &&
                            string.CompareOrdinal(abandonedGame.GameId, oldestGame.Value.GameId) < 0
                        )
                    )
                )
            )
            {
                oldestGame = abandonedGame;
            }
        }

        if (abandonedGameCount >= MAX_ABANDONED_GAMES && oldestGame != null)
        {
            ctx.Db.abandonedgames.GameId.Delete(oldestGame.Value.GameId);
        }

        ctx.Db.abandonedgames.Insert(new AbandonedGame
        {
            GameId = game.Id,
            GameMode = game.GameMode,
            CreatedAt = game.CreatedAt,
            ArchivedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            PlacementCount = game.Placements.Count
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
                UpdateGlobalStatsForGame(ctx, game);
                RecordAbandonedGame(ctx, game);

                var updatedGame = game;
                updatedGame.State = GameState.Archived;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {game.Id} transitioned to Archived state");
            }
        }

        var thirtySecondsAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 30_000_000;
        var oneHourAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 3_600_000_000;

        foreach (var game in ctx.Db.game.State.Filter(GameState.Lobby))
        {
            bool shouldDelete =
                (game.GameType == GameType.Public && game.CreatedAt < thirtySecondsAgo) ||
                (game.GameType == GameType.Private && game.CreatedAt < oneHourAgo);

            if (shouldDelete)
            {
                foreach (var pp in ctx.Db.playerprogress.GameId.Filter(game.Id))
                {
                    ctx.Db.playerprogress.Id.Delete(pp.Id);
                }

                ctx.Db.game.Id.Delete(game.Id);
                Log.Info($"Deleted stale {game.GameType} lobby game {game.Id}");
            }
        }
    }

    [Reducer]
    public static void CleanupOldXpGains(ReducerContext ctx, XpGainCleaner args)
    {
    }

    [Reducer]
    public static void CleanupOldScores(ReducerContext ctx, ScoreCleaner args)
    {
        var cutoff = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 86_400_000_000;
        ctx.Db.game_score.Timestamp.Delete((long.MinValue, cutoff));
    }

    [Reducer]
    public static void publishScore(ReducerContext ctx, string gameId, string language, int score, long scoreProof)
    {
        if (!IsValidScoreGameId(gameId))
        {
            throw new Exception("Invalid game ID");
        }

        if (!IsValidScoreLanguage(language))
        {
            throw new Exception("Invalid language");
        }

        if (score < 0)
        {
            throw new Exception("Score cannot be negative");
        }

        if (!IsValidScoreProof(gameId, language, score, scoreProof))
        {
            throw new Exception("Invalid score proof");
        }

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var day = DateTimeOffset.FromUnixTimeSeconds(timestamp / 1_000_000).ToUniversalTime().ToString("yyyy-MM-dd");
        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        var playerName = player?.Name ?? $"Anonymous {AnimalNameGenerator.Generate(ctx.Rng)}";
        var scoreId = $"{gameId}_{language}_{day}_{ctx.Sender}";
        var existingScore = ctx.Db.game_score.Id.Find(scoreId);
        if (existingScore == null)
        {
            ctx.Db.game_score.Insert(new GameScore
            {
                Id = scoreId,
                GameId = gameId,
                Language = language,
                PlayerId = ctx.Sender,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = 0,
                Day = day
            });
        }
        else if (score > existingScore.Value.Value)
        {
            var currentScore = existingScore.Value;
            ctx.Db.game_score.Id.Update(new GameScore
            {
                Id = currentScore.Id,
                GameId = currentScore.GameId,
                Language = currentScore.Language,
                PlayerId = currentScore.PlayerId,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = currentScore.TimeMs,
                Day = currentScore.Day
            });
        }

        var highScoreId = $"{gameId}_{language}_{ctx.Sender}";
        var existingHighScore = ctx.Db.game_highscore.Id.Find(highScoreId);
        if (existingHighScore == null)
        {
            ctx.Db.game_highscore.Insert(new GameHighScore
            {
                Id = highScoreId,
                GameId = gameId,
                Language = language,
                PlayerId = ctx.Sender,
                PlayerName = playerName,
                Value = score,
                Timestamp = timestamp,
                TimeMs = 0
            });
            return;
        }

        if (score > existingHighScore.Value.Value)
        {
            var updatedHighScore = existingHighScore.Value;
            updatedHighScore.PlayerName = playerName;
            updatedHighScore.Value = score;
            updatedHighScore.Timestamp = timestamp;
            updatedHighScore.TimeMs = 0;
            ctx.Db.game_highscore.Id.Update(updatedHighScore);
        }
    }

    private static bool IsValidScoreGameId(string gameId) =>
        IsValidScoreKey(gameId, 64, c => c == '_' || (c >= '0' && c <= '9'));

    private static bool IsValidScoreLanguage(string language) =>
        IsValidScoreKey(language, 16, c => c == '-');

    private static bool IsValidScoreKey(string value, int maxLength, Func<char, bool> allowExtra) =>
        value.Length > 0 && value.Length <= maxLength && value.All(c => (c >= 'a' && c <= 'z') || allowExtra(c));

    private const long ScoreProofMod = 2_147_483_647;

    private static bool IsValidScoreProof(string gameId, string language, int score, long scoreProof) =>
        scoreProof == CreateScoreProof(gameId, language, score);

    private static long CreateScoreProof(string gameId, string language, int score)
    {
        var proof = (score + 73_210_291L) % ScoreProofMod;
        proof = AddScoreProofText(proof, gameId);
        proof = AddScoreProofText(proof, language);
        return (proof * 97 + score * 13L + 1_664_525L) % ScoreProofMod;
    }

    private static long AddScoreProofText(long proof, string value)
    {
        foreach (var c in value)
        {
            proof = (proof * 31 + c) % ScoreProofMod;
        }
        return proof;
    }

    private static void UpdateDailyActivePlayerCount(ReducerContext ctx, Identity playerId, string dateKey)
    {
        var gamesPlayedToday = ctx.Db.gamerecord.PlayerId_Day.Filter((playerId, dateKey)).Count();

        Log.Info($"[DailyActivePlayers] Player {playerId} finished game on {dateKey}, GamesToday={gamesPlayedToday}");

        if (gamesPlayedToday == 1)
        {
            var existingStats = ctx.Db.globalstats.Date.Find(dateKey);

            if (existingStats == null)
            {
                ctx.Db.globalstats.Insert(new GlobalStats
                {
                    Date = dateKey,
                    Stats = new List<GameModeCount>(),
                    Total = new GameModeCount
                    {
                        GameType = GameType.Public,
                        GameMode = GameMode.English500,
                        FinishedGames = 0,
                        NonLonelyGames = 0,
                        StartedGames = 0,
                        TotalWpm = 0,
                        MinWpm = 0,
                        MaxWpm = 0,
                        GameCount = 0
                    },
                    DailyActivePlayers = 1
                });
                Log.Info($"[DailyActivePlayers] Created global stats for {dateKey} with player {playerId} as first active player");
            }
            else
            {
                var updatedStats = existingStats.Value;
                updatedStats.DailyActivePlayers++;
                ctx.Db.globalstats.Date.Update(updatedStats);
                Log.Info($"[DailyActivePlayers] Player {playerId} is NEW today, incremented count to {updatedStats.DailyActivePlayers}");
            }
        }
    }

    private static void UpdatePlayerStatsForGame(ReducerContext ctx, PlayerProgress progress, Game game, int placement, long timeElapsed)
    {
        var updatedProgress = progress;
        updatedProgress.Time = timeElapsed;
        updatedProgress.Placement = placement;
        ctx.Db.playerprogress.Id.Update(updatedProgress);

        var player = ctx.Db.player.Identity.Find(progress.PlayerId);
        if (player == null) return;

        var wpm = CalculateWpm(game.Phrase.Length, timeElapsed);

        var wordsTyped = game.Phrase.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        var phraseLength = game.Phrase.Contains(' ') ? wordsTyped : game.Phrase.Length;
        var accuracy = CharacterHistoryUtils.CalculateAccuracy(progress.CharacterHistory);

        var updatedPlayer = player.Value;
        UpdatePlayerStats(ref updatedPlayer, placement, wordsTyped, timeElapsed / 1000);
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.player.Identity.Update(updatedPlayer);

        var eloChange = UpdatePlayerElo(ctx, progress.PlayerId, game, placement);

        var statsId = IdGenerator.Generate("gr_", ctx.Rng);

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var year = dateTime.Year;
        var month = dateTime.Month;
        var day = dateTime.ToString("yyyy-MM-dd");
        var storesPersonalRecords = !player.Value.IsAnonymous;
        var isPersonalBest = storesPersonalRecords
            && IsPersonalRecord(ctx, progress.PlayerId, game.GameMode, phraseLength, wpm);

        ctx.Db.gamerecord.Insert(new GameRecord
        {
            Id = statsId,
            PlayerId = progress.PlayerId,
            GameId = game.Id,
            GameMode = game.GameMode,
            GameType = game.GameType,
            Year = year,
            Month = month,
            Day = day,
            Date = timestamp,
            TimeMs = timeElapsed / 1000,
            Placement = placement,
            Wpm = wpm,
            XpGained = 0,
            EloChange = eloChange,
            Accuracy = accuracy,
            PhraseLength = phraseLength,
            IsPersonalBest = isPersonalBest
        });

        if (storesPersonalRecords)
        {
            UpdatePersonalRecord(ctx, progress.PlayerId, game.GameMode, phraseLength, statsId, game.Id, wpm, accuracy);
        }

        if (!progress.IsBot)
        {
            UpdateDailyActivePlayerCount(ctx, progress.PlayerId, day);
        }

        Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}, typed {wordsTyped} words");
    }

    private static void UpdatePlayerStats(ref Player player, int placement, int wordsTyped, long timeElapsedMs)
    {
        player.TotalGames += 1;
        if (placement == 1)
        {
            player.Wins += 1;
        }
        player.TotalWordsTyped += wordsTyped;
        player.TotalTimeSpentMs += timeElapsedMs;
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

    private static PersonalRecord? FindPersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength)
    {
        foreach (var record in ctx.Db.personalrecord.PlayerId_GameMode_PhraseLength.Filter((playerId, gameMode, phraseLength)))
        {
            return record;
        }

        return null;
    }

    private static bool IsPersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength, double wpm)
    {
        var existingRecord = FindPersonalRecord(ctx, playerId, gameMode, phraseLength);
        return existingRecord == null || wpm > existingRecord.Value.Wpm;
    }

    private static void UpdatePersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength, string gameRecordId, string gameId, double wpm, double accuracy)
    {
        var existingRecord = FindPersonalRecord(ctx, playerId, gameMode, phraseLength);

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
                PhraseLength = phraseLength,
                GameRecordId = gameRecordId,
                GameId = gameId,
                Wpm = wpm,
                Accuracy = accuracy
            });

            Log.Info($"Updated personal record for player {playerId} in mode {gameMode}: {wpm} WPM");
        }
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

        if (level >= 20)
        {
            return 500;
        }

        int startXp = 200;
        int endXp = 500;
        int startLevel = 2;
        int endLevel = 20;

        double progress = (double)(level - startLevel) / (endLevel - startLevel);
        return (int)Math.Round(startXp + (endXp - startXp) * progress);
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

    private static void AwardXpForCorrectCharacter(ReducerContext ctx, PlayerProgress progress)
    {
        var player = ctx.Db.player.Identity.Find(progress.PlayerId);
        if (player == null || player.Value.IsAnonymous)
        {
            return;
        }

        var updatedPlayer = player.Value;
        updatedPlayer.Xp += 1;
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.player.Identity.Update(updatedPlayer);
    }

    private static void ProcessProgressUpdate(
        ReducerContext ctx,
        PlayerProgress progress,
        Game game,
        int newIndex,
        CharacterEventType eventType)
    {
        if (progress.Placement > 0 || game.Placements.Contains(progress.PlayerId))
        {
            Log.Info($"Ignoring progress update for player {progress.PlayerId}: already finished game {game.Id}");
            return;
        }

        var updatedProgress = progress;
        updatedProgress.ProgressIndex = newIndex;
        CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, eventType);

        var elapsedMicros = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;
        updatedProgress.Wpm = CalculateWpm(newIndex, elapsedMicros);

        if (newIndex > updatedProgress.HighestProgress)
        {
            updatedProgress.HighestProgress = newIndex;

            if (eventType == CharacterEventType.Correct)
            {
                AwardXpForCorrectCharacter(ctx, progress);
            }
        }

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
    public static void updateProgress(ReducerContext ctx, string gameId, int newIndex, CharacterEventType eventType)
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

    private static int GetAllowedErrorCount(string phrase)
    {
        return (int)Math.Ceiling(phrase.Length * 0.075);
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
