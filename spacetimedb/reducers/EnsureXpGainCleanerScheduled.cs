using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static void EnsureXpGainCleanerScheduled(ReducerContext ctx)
    {
        if (ctx.Db.XpGainCleaner.Iter().Any()) return;

        ctx.Db.XpGainCleaner.Insert(new XpGainCleaner
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(
                new TimeDuration { Microseconds = 60_000_000 }
            )
        });
    }
}
