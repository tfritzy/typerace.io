using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void EnsureStreakCheckerScheduled(ReducerContext ctx)
    {
        if (ctx.Db.StreakChecker.Iter().Any())
        {
            return;
        }

        ctx.Db.StreakChecker.Insert(new StreakChecker
        {
            ScheduledId = 0,
            ScheduledAt = new ScheduleAt.Interval(
                new TimeDuration { Microseconds = 300_000_000 }
            )
        });
    }
}
