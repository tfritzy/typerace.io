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
    TurkishQuotes
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
    [SpacetimeDB.Settings]
    public const CaseConversionPolicy CASE_CONVERSION_POLICY = CaseConversionPolicy.None;

    private const long PUBLIC_GAME_COUNTDOWN_MICROSECONDS = 3_000_000;
    private const long PRIVATE_GAME_COUNTDOWN_MICROSECONDS = 5_000_000;
    private const long PRACTICE_GAME_COUNTDOWN_MICROSECONDS = 3_000_000;
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

    [Table(Accessor = "playerLegacy", Name = "player")]
    public partial struct PlayerLegacy
    {
        public Identity Identity;
        public string PlayerId;
        public string Name;
        public int TotalGames;
        public int Wins;
        public int Level;
        public int Xp;
        public int XpRequiredForNextLevel;
        public int TotalWordsTyped;
        public long TotalTimeSpentMs;
        public bool IsBot;
        public BotConfig? BotConfig;
        public PlayerColor Color;
        public bool IsAnonymous;
        public long LastGameDate;
    }

    [Table(Accessor = "gameLegacy", Name = "game")]
    public partial struct GameLegacy
    {
        public string Id;
        public string Phrase;
        public long CreatedAt;
        public long RacingStartedAt;
        public long CountdownDurationMs;
        public GameState State;
        public GameMode GameMode;
        public GameType GameType;
        public List<Identity> Placements;
        public Identity? Owner;
        [Default("")]
        public string? Attribution;
    }

    [Table(Accessor = "gamerecordLegacy", Name = "gamerecord")]
    public partial struct GameRecordLegacy
    {
        public string Id;
        public Identity PlayerId;
        public string GameId;
        public GameMode GameMode;
        public GameType GameType;
        public int Year;
        public int Month;
        public long Date;
        public long TimeMs;
        public int Placement;
        public double Wpm;
        public int XpGained;
        public int EloChange;
        [Default("")]
        public string Day;
    }

    [Table(Accessor = "personalrecordLegacy", Name = "personalrecord")]
    public partial struct PersonalRecordLegacy
    {
        public string Id;
        public Identity PlayerId;
        public GameMode GameMode;
        public string GameRecordId;
        public double Wpm;
    }

    [Table(Accessor = "xpgainLegacy", Name = "xpgain")]
    public partial struct XpGainLegacy
    {
        public string Id;
        public Identity PlayerId;
        public string GameId;
        public long Timestamp;
        public int BaseXp;
        public List<XpMultiplier> Multipliers;
        public int TotalXp;
    }

    [Table(Accessor = "eloLegacy", Name = "elo")]
    public partial struct EloLegacy
    {
        public string Id;
        public Identity PlayerId;
        public GameMode GameMode;
        public int Rating;
    }

    [Table(Accessor = "globalstatsLegacy", Name = "globalstats")]
    public partial struct GlobalStatsLegacy
    {
        public string Date;
        public List<GameModeCount> Stats;
        public GameModeCount Total;
        [Default(0)]
        public int DailyActivePlayers;
    }

    [Table(Accessor = "playerprogressLegacy", Name = "playerprogress")]
    public partial struct PlayerProgressLegacy
    {
        public string Id;
        public Identity PlayerId;
        public string PlayerPublicId;
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
        [Default(0)]
        public int HighestProgress;
    }

    [Table(Accessor = "Player", Name = "player_v2", Public = true)]
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

    [Table(Accessor = "Game", Name = "game_v2", Public = true)]
    [SpacetimeDB.Index.BTree(Accessor = "State_GameType", Columns = new[] { nameof(State), nameof(GameType) })]
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
    }

    [Table(Accessor = "GameRecord", Name = "game_record_v2", Public = true)]
    [SpacetimeDB.Index.BTree(Accessor = "PlayerId_Day", Columns = new[] { nameof(GameRecord.PlayerId), nameof(GameRecord.Day) })]
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
    }

    [Table(Accessor = "PersonalRecord", Name = "personal_record_v2", Public = true)]
    [SpacetimeDB.Index.BTree(Accessor = "PlayerId_GameMode", Columns = new[] { nameof(PlayerId), nameof(GameMode) })]
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

    [Table(Accessor = "XpGain", Name = "xp_gain_v2", Public = true)]
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

    [Table(Accessor = "Elo", Name = "elo_v2", Public = true)]
    [SpacetimeDB.Index.BTree(Accessor = "PlayerId_GameMode", Columns = new[] { nameof(PlayerId), nameof(GameMode) })]
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

    [Table(Accessor = "BotFillTrigger", Scheduled = nameof(FillGameWithBots), ScheduledAt = nameof(ScheduledAt))]
    public partial struct BotFillTrigger
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        [SpacetimeDB.Index.BTree]
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Accessor = "CountdownStart", Scheduled = nameof(StartCountdown), ScheduledAt = nameof(ScheduledAt))]
    public partial struct CountdownStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Accessor = "GameStart", Scheduled = nameof(StartGame), ScheduledAt = nameof(ScheduledAt))]
    public partial struct GameStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Accessor = "GameArchiver", Scheduled = nameof(ArchiveOldGames), ScheduledAt = nameof(ScheduledAt))]
    public partial struct GameArchiver
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Accessor = "XpGainCleaner", Scheduled = nameof(CleanupOldXpGains), ScheduledAt = nameof(ScheduledAt))]
    public partial struct XpGainCleaner
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }

    [Table(Accessor = "GlobalStats", Name = "global_stats_v2", Public = true)]
    public partial struct GlobalStats
    {
        [PrimaryKey]
        public string Date;
        public List<GameModeCount> Stats;
        public GameModeCount Total;
        [Default(0)]
        public int DailyActivePlayers;
    }

    [Table(Accessor = "PlayerProgress", Name = "player_progress_v2", Public = true)]
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
        public string JoinCode;
        public double Wpm;
        public PlayerColor PlayerColor;
        [Default(0)]
        public int HighestProgress;
    }

    [Table(Accessor = "BotProgressUpdate", Scheduled = nameof(UpdateBotProgress), ScheduledAt = nameof(ScheduledAt))]
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

            ctx.Db.Player.Insert(new Player
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

    [Reducer]
    public static void MigrateToV2(ReducerContext ctx)
    {
        var playerCount = 0;
        foreach (var legacy in ctx.Db.playerLegacy.Iter())
        {
            if (ctx.Db.Player.Identity.Find(legacy.Identity) != null) continue;
            ctx.Db.Player.Insert(new Player
            {
                Identity = legacy.Identity,
                PlayerId = legacy.PlayerId,
                Name = legacy.Name,
                TotalGames = legacy.TotalGames,
                Wins = legacy.Wins,
                Level = legacy.Level,
                Xp = legacy.Xp,
                XpRequiredForNextLevel = legacy.XpRequiredForNextLevel,
                TotalWordsTyped = legacy.TotalWordsTyped,
                TotalTimeSpentMs = legacy.TotalTimeSpentMs,
                IsBot = legacy.IsBot,
                BotConfig = legacy.BotConfig,
                Color = legacy.Color,
                IsAnonymous = legacy.IsAnonymous,
                LastGameDate = legacy.LastGameDate
            });
            playerCount++;
        }
        Log.Info($"Migrated {playerCount} players to V2");

        var gameCount = 0;
        foreach (var legacy in ctx.Db.gameLegacy.Iter())
        {
            if (ctx.Db.Game.Id.Find(legacy.Id) != null) continue;
            ctx.Db.Game.Insert(new Game
            {
                Id = legacy.Id,
                Phrase = legacy.Phrase,
                CreatedAt = legacy.CreatedAt,
                RacingStartedAt = legacy.RacingStartedAt,
                CountdownDurationMs = legacy.CountdownDurationMs,
                State = legacy.State,
                GameMode = legacy.GameMode,
                GameType = legacy.GameType,
                Placements = legacy.Placements,
                Owner = legacy.Owner,
                Attribution = legacy.Attribution
            });
            gameCount++;
        }
        Log.Info($"Migrated {gameCount} games to V2");

        var gameRecordCount = 0;
        foreach (var legacy in ctx.Db.gamerecordLegacy.Iter())
        {
            if (ctx.Db.GameRecord.Id.Find(legacy.Id) != null) continue;
            ctx.Db.GameRecord.Insert(new GameRecord
            {
                Id = legacy.Id,
                PlayerId = legacy.PlayerId,
                GameId = legacy.GameId,
                GameMode = legacy.GameMode,
                GameType = legacy.GameType,
                Year = legacy.Year,
                Month = legacy.Month,
                Date = legacy.Date,
                TimeMs = legacy.TimeMs,
                Placement = legacy.Placement,
                Wpm = legacy.Wpm,
                XpGained = legacy.XpGained,
                EloChange = legacy.EloChange,
                Day = legacy.Day
            });
            gameRecordCount++;
        }
        Log.Info($"Migrated {gameRecordCount} game records to V2");

        var personalRecordCount = 0;
        foreach (var legacy in ctx.Db.personalrecordLegacy.Iter())
        {
            if (ctx.Db.PersonalRecord.Id.Find(legacy.Id) != null) continue;
            ctx.Db.PersonalRecord.Insert(new PersonalRecord
            {
                Id = legacy.Id,
                PlayerId = legacy.PlayerId,
                GameMode = legacy.GameMode,
                GameRecordId = legacy.GameRecordId,
                Wpm = legacy.Wpm
            });
            personalRecordCount++;
        }
        Log.Info($"Migrated {personalRecordCount} personal records to V2");

        var xpGainCount = 0;
        foreach (var legacy in ctx.Db.xpgainLegacy.Iter())
        {
            if (ctx.Db.XpGain.Id.Find(legacy.Id) != null) continue;
            ctx.Db.XpGain.Insert(new XpGain
            {
                Id = legacy.Id,
                PlayerId = legacy.PlayerId,
                GameId = legacy.GameId,
                Timestamp = legacy.Timestamp,
                BaseXp = legacy.BaseXp,
                Multipliers = legacy.Multipliers,
                TotalXp = legacy.TotalXp
            });
            xpGainCount++;
        }
        Log.Info($"Migrated {xpGainCount} xp gains to V2");

        var eloCount = 0;
        foreach (var legacy in ctx.Db.eloLegacy.Iter())
        {
            if (ctx.Db.Elo.Id.Find(legacy.Id) != null) continue;
            ctx.Db.Elo.Insert(new Elo
            {
                Id = legacy.Id,
                PlayerId = legacy.PlayerId,
                GameMode = legacy.GameMode,
                Rating = legacy.Rating
            });
            eloCount++;
        }
        Log.Info($"Migrated {eloCount} elo records to V2");

        var globalStatsCount = 0;
        foreach (var legacy in ctx.Db.globalstatsLegacy.Iter())
        {
            if (ctx.Db.GlobalStats.Date.Find(legacy.Date) != null) continue;
            ctx.Db.GlobalStats.Insert(new GlobalStats
            {
                Date = legacy.Date,
                Stats = legacy.Stats,
                Total = legacy.Total,
                DailyActivePlayers = legacy.DailyActivePlayers
            });
            globalStatsCount++;
        }
        Log.Info($"Migrated {globalStatsCount} global stats to V2");

        var playerProgressCount = 0;
        foreach (var legacy in ctx.Db.playerprogressLegacy.Iter())
        {
            if (ctx.Db.PlayerProgress.Id.Find(legacy.Id) != null) continue;
            ctx.Db.PlayerProgress.Insert(new PlayerProgress
            {
                Id = legacy.Id,
                PlayerId = legacy.PlayerId,
                PlayerPublicId = legacy.PlayerPublicId,
                GameId = legacy.GameId,
                PlayerName = legacy.PlayerName,
                PlayerLevel = legacy.PlayerLevel,
                ProgressIndex = legacy.ProgressIndex,
                IsBot = legacy.IsBot,
                IsAnonymous = legacy.IsAnonymous,
                CreatedAt = legacy.CreatedAt,
                CharacterHistory = legacy.CharacterHistory,
                Time = legacy.Time,
                Placement = legacy.Placement,
                JoinCode = legacy.JoinCode,
                Wpm = legacy.Wpm,
                PlayerColor = legacy.PlayerColor,
                HighestProgress = legacy.HighestProgress
            });
            playerProgressCount++;
        }
        Log.Info($"Migrated {playerProgressCount} player progress records to V2");
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
        var existingPlayer = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (existingPlayer == null)
        {
            var animalName = AnimalNameGenerator.Generate(ctx.Rng);
            ctx.Db.Player.Insert(new Player
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
        var existingPlayer = ctx.Db.Player.Identity.Find(ctx.Sender);

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

            ctx.Db.Player.Identity.Update(updatedPlayer);
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

        var existingPlayer = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Name = trimmedName;
            ctx.Db.Player.Identity.Update(updatedPlayer);
            Log.Info($"Updated player name for {ctx.Sender} to {trimmedName}");
        }
    }

    [Reducer]
    public static void SetPlayerColor(ReducerContext ctx, PlayerColor color)
    {
        var existingPlayer = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Color = color;
            ctx.Db.Player.Identity.Update(updatedPlayer);
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
                ctx.Db.Game.Id.Update(updatedGame);

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
                    ctx.Db.Game.Id.Update(updatedGame);

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

        foreach (var game in ctx.Db.Game.State_GameType.Filter((GameState.Lobby, GameType.Public)))
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
        foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(gameId))
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

        var phrase = PhraseGenerator.GeneratePhraseForMode(gameMode, ctx.Rng);

        return ctx.Db.Game.Insert(new Game
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
        var player = ctx.Db.Player.Identity.Find(ctx.Sender);
        var playerName = player?.Name ?? "Unknown";
        var playerLevel = player?.Level ?? 1;
        var isAnonymous = player?.IsAnonymous ?? true;
        var playerColor = player?.Color ?? PlayerColor.Amber;
        var playerPublicId = player?.PlayerId ?? "";

        ctx.Db.PlayerProgress.Insert(new PlayerProgress
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
            PlayerColor = playerColor
        });
    }

    [Reducer]
    public static void FillGameWithBots(ReducerContext ctx, BotFillTrigger args)
    {
        var game = ctx.Db.Game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby && game.Value.GameType == GameType.Public)
        {
            int currentPlayerCount = CountPlayersInGame(ctx, args.GameId);

            int botsToAdd = 3 - currentPlayerCount;

            var humanPlayerElos = new List<int>();
            foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(args.GameId))
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
                ctx.Db.PlayerProgress.Insert(new PlayerProgress
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
                    PlayerColor = selectedBot.Color
                });

                Log.Info($"Added bot {selectedBot.Name} (ELO: {GetBotElo(ctx, selectedBot.Identity, game.Value.GameMode)}) to game {args.GameId} (target ELO: {targetElo})");
            }

            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.Game.Id.Update(updatedGame);

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
        foreach (var bot in ctx.Db.Player.IsBot.Filter(true))
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
        foreach (var elo in ctx.Db.Elo.PlayerId_GameMode.Filter((botId, gameMode)))
        {
            return elo.Rating;
        }
        return 1000;
    }

    [Reducer]
    public static void UpdateBotProgress(ReducerContext ctx, BotProgressUpdate args)
    {
        var progress = ctx.Db.PlayerProgress.Id.Find(args.PlayerProgressId);

        if (progress != null && progress.Value.IsBot)
        {
            var game = ctx.Db.Game.Id.Find(progress.Value.GameId);

            if (game != null && game.Value.State == GameState.Racing)
            {
                var botPlayer = ctx.Db.Player.Identity.Find(progress.Value.PlayerId);
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
                    ctx.Db.PlayerProgress.Id.Update(updatedProgress);

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
        var game = ctx.Db.Game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.Game.Id.Update(updatedGame);

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
        var game = ctx.Db.Game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Countdown)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Racing;
            updatedGame.RacingStartedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
            ctx.Db.Game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Racing state");

            foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(args.GameId))
            {
                if (progress.IsBot)
                {
                    var botPlayer = ctx.Db.Player.Identity.Find(progress.PlayerId);
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
        var game = ctx.Db.Game.Id.Find(gameId);

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
        ctx.Db.Game.Id.Update(updatedGame);

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
        var game = ctx.Db.Game.Id.Find(gameId);

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
        var game = ctx.Db.Game.Id.Find(gameId);

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

        foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(gameId))
        {
            if (!progress.IsBot)
            {
                var player = ctx.Db.Player.Identity.Find(progress.PlayerId);
                var playerName = player?.Name ?? "Unknown";
                var playerLevel = player?.Level ?? 1;
                var isAnonymous = player?.IsAnonymous ?? true;
                var playerColor = player?.Color ?? PlayerColor.Amber;
                var playerPublicId = player?.PlayerId ?? "";

                ctx.Db.PlayerProgress.Insert(new PlayerProgress
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

        Log.Info($"[UpdateGlobalStats] Processing game {game.Id} for date {dateKey}");

        var existingStats = ctx.Db.GlobalStats.Date.Find(dateKey);
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
        foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(game.Id))
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
            ctx.Db.GlobalStats.Insert(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }
        else
        {
            ctx.Db.GlobalStats.Date.Update(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }

        Log.Info($"Updated global stats for date {dateKey}, GameType {game.GameType}, GameMode {game.GameMode}");
    }

    [Reducer]
    public static void ArchiveOldGames(ReducerContext ctx, GameArchiver args)
    {
        var fiveMinutesAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;

        foreach (var game in ctx.Db.Game.State.Filter(GameState.Racing))
        {
            if (game.CreatedAt < fiveMinutesAgo)
            {
                UpdateGlobalStatsForGame(ctx, game);

                var updatedGame = game;
                updatedGame.State = GameState.Archived;
                ctx.Db.Game.Id.Update(updatedGame);

                Log.Info($"Game {game.Id} transitioned to Archived state");
            }
        }
    }

    [Reducer]
    public static void CleanupOldXpGains(ReducerContext ctx, XpGainCleaner args)
    {
    }

    private static void UpdateDailyActivePlayerCount(ReducerContext ctx, Identity playerId, string dateKey)
    {
        var gamesPlayedToday = ctx.Db.GameRecord.PlayerId_Day.Filter((playerId, dateKey)).Count();

        Log.Info($"[DailyActivePlayers] Player {playerId} finished game on {dateKey}, GamesToday={gamesPlayedToday}");

        if (gamesPlayedToday == 1)
        {
            var existingStats = ctx.Db.GlobalStats.Date.Find(dateKey);

            if (existingStats == null)
            {
                ctx.Db.GlobalStats.Insert(new GlobalStats
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
                ctx.Db.GlobalStats.Date.Update(updatedStats);
                Log.Info($"[DailyActivePlayers] Player {playerId} is NEW today, incremented count to {updatedStats.DailyActivePlayers}");
            }
        }
    }

    private static void UpdatePlayerStatsForGame(ReducerContext ctx, PlayerProgress progress, Game game, int placement, long timeElapsed)
    {
        var updatedProgress = progress;
        updatedProgress.Time = timeElapsed;
        updatedProgress.Placement = placement;
        ctx.Db.PlayerProgress.Id.Update(updatedProgress);

        var player = ctx.Db.Player.Identity.Find(progress.PlayerId);
        if (player == null) return;

        var wpm = CalculateWpm(game.Phrase.Length, timeElapsed);

        var wordsTyped = game.Phrase.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;

        var updatedPlayer = player.Value;
        UpdatePlayerStats(ref updatedPlayer, placement, wordsTyped, timeElapsed / 1000);
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.Player.Identity.Update(updatedPlayer);

        var eloChange = UpdatePlayerElo(ctx, progress.PlayerId, game, placement);

        var statsId = IdGenerator.Generate("gr_", ctx.Rng);

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var year = dateTime.Year;
        var month = dateTime.Month;
        var day = dateTime.ToString("yyyy-MM-dd");

        ctx.Db.GameRecord.Insert(new GameRecord
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
            EloChange = eloChange
        });

        UpdatePersonalRecord(ctx, progress.PlayerId, game.GameMode, statsId, wpm);

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

    private static void UpdatePersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, string gameRecordId, double wpm)
    {
        PersonalRecord? existingRecord = null;
        foreach (var record in ctx.Db.PersonalRecord.PlayerId_GameMode.Filter((playerId, gameMode)))
        {
            existingRecord = record;
            break;
        }

        if (existingRecord == null || wpm > existingRecord.Value.Wpm)
        {
            if (existingRecord != null)
            {
                ctx.Db.PersonalRecord.Id.Delete(existingRecord.Value.Id);
            }

            ctx.Db.PersonalRecord.Insert(new PersonalRecord
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
        foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(game.Id))
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
        ctx.Db.Elo.Id.Update(updatedElo);

        Log.Info($"Player {playerId} ELO updated: {currentElo.Rating} -> {updatedElo.Rating} (change: {totalEloChange:+0;-0}) in mode {game.GameMode}");

        return totalEloChange;
    }

    private static Elo GetOrCreatePlayerElo(ReducerContext ctx, Identity playerId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.Elo.PlayerId_GameMode.Filter((playerId, gameMode)))
        {
            return elo;
        }

        var newElo = ctx.Db.Elo.Insert(new Elo
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

    private static void AwardInstantXpForProgress(ReducerContext ctx, PlayerProgress progress, Game game, int newIndex)
    {
        var player = ctx.Db.Player.Identity.Find(progress.PlayerId);
        if (player == null || player.Value.IsAnonymous)
        {
            return;
        }

        if (newIndex > 0 && newIndex <= game.Phrase.Length)
        {
            var currentChar = game.Phrase[newIndex - 1];
            if (currentChar == ' ' || newIndex == game.Phrase.Length)
            {
                var wordStart = newIndex - 1;
                while (wordStart > 0 && game.Phrase[wordStart - 1] != ' ')
                {
                    wordStart--;
                }

                var wordLength = newIndex - wordStart;
                if (currentChar == ' ')
                {
                    wordLength--;
                }

                if (wordLength > 0)
                {
                    var xpToAward = wordLength;
                    var updatedPlayer = player.Value;
                    updatedPlayer.Xp += xpToAward;
                    LevelUpPlayer(ref updatedPlayer);
                    ctx.Db.Player.Identity.Update(updatedPlayer);
                }
            }
        }
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

        if (newIndex > updatedProgress.HighestProgress)
        {
            updatedProgress.HighestProgress = newIndex;

            if (eventType == CharacterEventType.Correct)
            {
                AwardInstantXpForProgress(ctx, progress, game, newIndex);
            }
        }

        ctx.Db.PlayerProgress.Id.Update(updatedProgress);

        if (newIndex >= game.Phrase.Length)
        {
            var updatedGame = game;
            updatedGame.Placements.Add(progress.PlayerId);
            var placement = updatedGame.Placements.Count;
            ctx.Db.Game.Id.Update(updatedGame);

            var timeElapsed = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;

            UpdatePlayerStatsForGame(ctx, updatedProgress, updatedGame, placement, timeElapsed);

            Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}");
        }
    }

    [Reducer]
    public static void UpdateProgress(ReducerContext ctx, string gameId, int newIndex, CharacterEventType eventType)
    {
        var playerId = ctx.Sender;
        var game = ctx.Db.Game.Id.Find(gameId);

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
        foreach (var progress in ctx.Db.PlayerProgress.GameId.Filter(gameId))
        {
            if (progress.PlayerId == playerId)
            {
                return progress;
            }
        }
        return null;
    }
}