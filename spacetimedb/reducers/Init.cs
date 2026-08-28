using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
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
}
