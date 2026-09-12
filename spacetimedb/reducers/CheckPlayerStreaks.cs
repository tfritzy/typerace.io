using System.Globalization;
using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int MaxStreakChecksPerRun = 1_000;

    [Reducer]
    public static void CheckPlayerStreaks(ReducerContext ctx, StreakChecker args)
    {
        var today = DateOnly.FromDateTime(
            DateTimeOffset.FromUnixTimeMilliseconds(
                ctx.Timestamp.MicrosecondsSinceUnixEpoch / 1_000
            ).UtcDateTime
        );
        var todayKey = today.ToString(StreakDayFormat, CultureInfo.InvariantCulture);
        var tomorrowKey = today.AddDays(1).ToString(
            StreakDayFormat,
            CultureInfo.InvariantCulture
        );

        var dueStreaks = ctx.Db.playerstreak.NextCheckDay
            .Filter((string.Empty, tomorrowKey))
            .Where(streak => string.CompareOrdinal(streak.NextCheckDay, todayKey) <= 0)
            .Take(MaxStreakChecksPerRun)
            .ToList();

        foreach (var streak in dueStreaks)
        {
            var updated = ApplyMissedDaysBefore(streak, today);
            ctx.Db.playerstreak.PlayerId.Update(updated);
        }

        if (dueStreaks.Count == MaxStreakChecksPerRun)
        {
            Log.Info($"Processed {dueStreaks.Count} due streaks; more may remain for the next run");
        }
    }
}
