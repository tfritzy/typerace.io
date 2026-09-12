using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static void MigratePlayerStreaks(ReducerContext ctx)
    {
        var migratedPlayers = 0;

        foreach (var player in ctx.Db.player.Iter())
        {
            if (player.IsBot || player.IsAnonymous)
            {
                continue;
            }

            BackfillPlayerStreak(ctx, player.Identity);
            migratedPlayers++;
        }

        Log.Info($"Backfilled streaks for {migratedPlayers} players");
    }

    private static void BackfillPlayerStreak(ReducerContext ctx, Identity playerId)
    {
        var activeDays = ctx.Db.gamerecord.PlayerId.Filter(playerId)
            .Select(GetGameRecordDay)
            .Where(day => day != null)
            .Select(day => day!.Value)
            .Distinct()
            .OrderBy(day => day)
            .ToList();

        if (activeDays.Count == 0)
        {
            return;
        }

        var streak = CreatePlayerStreak(playerId, activeDays[0]);

        for (var index = 1; index < activeDays.Count; index++)
        {
            streak = ApplyMissedDaysBefore(streak, activeDays[index]);
            streak = ApplyCompletedGame(streak, activeDays[index]);
        }

        var today = DateOnly.FromDateTime(
            DateTimeOffset.FromUnixTimeMilliseconds(
                ctx.Timestamp.MicrosecondsSinceUnixEpoch / 1_000
            ).UtcDateTime
        );
        streak = ApplyMissedDaysBefore(streak, today);

        if (ctx.Db.playerstreak.PlayerId.Find(playerId) == null)
        {
            ctx.Db.playerstreak.Insert(streak);
        }
        else
        {
            ctx.Db.playerstreak.PlayerId.Update(streak);
        }
    }

    private static DateOnly? GetGameRecordDay(GameRecord record)
    {
        if (TryParseStreakDay(record.Day, out var day))
        {
            return day;
        }

        if (record.Date <= 0)
        {
            return null;
        }

        var timestamp = DateTimeOffset.FromUnixTimeMilliseconds(record.Date / 1_000);
        return DateOnly.FromDateTime(timestamp.UtcDateTime);
    }
}
