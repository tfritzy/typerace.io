using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int MaxStreakChecksPerRun = 1_000;

    [Reducer]
    public static void CheckPlayerStreaks(ReducerContext ctx, StreakChecker args)
    {
        var now = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var nowKey = StreakTime.FormatUtcTimestamp(now);

        var dueStreaks = ctx.Db.playerstreak.NextCheckDay
            .Filter((string.Empty, nowKey))
            .Where(streak => string.CompareOrdinal(streak.NextCheckDay, nowKey) <= 0)
            .Take(MaxStreakChecksPerRun)
            .ToList();

        foreach (var streak in dueStreaks)
        {
            var utcOffsetMinutes = GetPlayerUtcOffsetMinutes(ctx, streak.PlayerId);
            var localDay = StreakTime.GetLocalDay(now, utcOffsetMinutes);
            var updated = ApplyMissedDaysBefore(streak, localDay, utcOffsetMinutes);
            ctx.Db.playerstreak.PlayerId.Update(updated);
        }

        if (dueStreaks.Count == MaxStreakChecksPerRun)
        {
            Log.Info($"Processed {dueStreaks.Count} due streaks; more may remain for the next run");
        }
    }
}
