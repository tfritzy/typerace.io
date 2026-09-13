using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void syncTimezone(ReducerContext ctx, int utcOffsetMinutes)
    {
        if (!StreakTime.IsValidUtcOffset(utcOffsetMinutes))
        {
            throw new Exception("UTC offset must be between -720 and 840 minutes");
        }

        var existingTimezone = ctx.Db.playertimezone.PlayerId.Find(ctx.Sender);
        var storedUtcOffsetMinutes = existingTimezone?.UtcOffsetMinutes ?? 0;
        var timezone = new PlayerTimezone
        {
            PlayerId = ctx.Sender,
            UtcOffsetMinutes = utcOffsetMinutes
        };

        if (existingTimezone == null)
        {
            ctx.Db.playertimezone.Insert(timezone);
        }
        else
        {
            ctx.Db.playertimezone.PlayerId.Update(timezone);
        }

        var existingStreak = ctx.Db.playerstreak.PlayerId.Find(ctx.Sender);
        if (existingStreak == null)
        {
            return;
        }

        var currentDay = StreakTime.GetLocalDay(
            ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            utcOffsetMinutes
        );
        var updatedStreak = ApplyMissedDaysBefore(
            existingStreak.Value,
            currentDay,
            utcOffsetMinutes,
            storedUtcOffsetMinutes
        );
        ctx.Db.playerstreak.PlayerId.Update(updatedStreak);
    }
}
