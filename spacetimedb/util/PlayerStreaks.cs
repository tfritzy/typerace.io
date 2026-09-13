using System.Globalization;
using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const string StreakDayFormat = "yyyy-MM-dd";
    private const string NoStreakCheckDay = "9999-12-31";

    private static void UpdatePlayerStreak(ReducerContext ctx, Identity playerId, long timestampMicros)
    {
        var utcOffsetMinutes = GetPlayerUtcOffsetMinutes(ctx, playerId);
        var currentDay = StreakTime.GetLocalDay(timestampMicros, utcOffsetMinutes);

        var existing = ctx.Db.playerstreak.PlayerId.Find(playerId);
        if (existing == null)
        {
            ctx.Db.playerstreak.Insert(
                CreatePlayerStreak(playerId, currentDay, utcOffsetMinutes)
            );
            return;
        }

        if (!TryParseStreakDay(existing.Value.LastActiveDay, out var lastActiveDay)
            || currentDay < lastActiveDay)
        {
            return;
        }

        var updated = ApplyCompletedGame(existing.Value, currentDay, utcOffsetMinutes);
        ctx.Db.playerstreak.PlayerId.Update(updated);
    }

    private static int GetPlayerUtcOffsetMinutes(ReducerContext ctx, Identity playerId)
    {
        return ctx.Db.playertimezone.PlayerId.Find(playerId)?.UtcOffsetMinutes ?? 0;
    }

    private static PlayerStreak CreatePlayerStreak(
        Identity playerId,
        DateOnly activeDay,
        int utcOffsetMinutes = 0
    )
    {
        return ApplyStreakState(
            new PlayerStreak { PlayerId = playerId },
            StreakRules.Start(activeDay),
            utcOffsetMinutes
        );
    }

    private static PlayerStreak ApplyCompletedGame(
        PlayerStreak streak,
        DateOnly activeDay,
        int utcOffsetMinutes = 0
    )
    {
        if (!TryGetStreakState(streak, utcOffsetMinutes, out var state))
        {
            return streak;
        }

        return ApplyStreakState(
            streak,
            StreakRules.CompleteGame(state, activeDay),
            utcOffsetMinutes
        );
    }

    private static PlayerStreak ApplyMissedDaysBefore(
        PlayerStreak streak,
        DateOnly endExclusive,
        int utcOffsetMinutes = 0,
        int? storedUtcOffsetMinutes = null
    )
    {
        if (!TryGetStreakState(
            streak,
            storedUtcOffsetMinutes ?? utcOffsetMinutes,
            out var state
        ))
        {
            return streak;
        }

        return ApplyStreakState(
            streak,
            StreakRules.ApplyMissedDaysBefore(state, endExclusive),
            utcOffsetMinutes
        );
    }

    private static bool TryGetStreakState(
        PlayerStreak streak,
        int utcOffsetMinutes,
        out StreakState state
    )
    {
        if (!TryParseStreakDay(streak.LastActiveDay, out var lastActiveDay))
        {
            state = default;
            return false;
        }

        DateOnly? nextCheckDay = null;
        if (TryParseStreakDay(streak.NextCheckDay, out var parsedNextCheckDay))
        {
            nextCheckDay = parsedNextCheckDay;
        }
        else if (StreakTime.TryParseUtcTimestamp(
            streak.NextCheckDay,
            out var nextCheckAt
        ))
        {
            nextCheckDay = StreakTime.GetLocalDay(nextCheckAt, utcOffsetMinutes);
        }

        state = new StreakState(
            Count: streak.Streak,
            LastActiveDay: lastActiveDay,
            Protections: streak.Protections,
            NextCheckDay: nextCheckDay
        );
        return true;
    }

    private static PlayerStreak ApplyStreakState(
        PlayerStreak streak,
        StreakState state,
        int utcOffsetMinutes
    )
    {
        streak.Streak = state.Count;
        streak.LastActiveDay = state.LastActiveDay.ToString(
            StreakDayFormat,
            CultureInfo.InvariantCulture
        );
        streak.Protections = state.Protections;
        if (state.NextCheckDay is DateOnly nextCheckDay)
        {
            streak.NextCheckDay = StreakTime.FormatUtcTimestamp(
                StreakTime.GetUtcMidnightMicros(nextCheckDay, utcOffsetMinutes)
            );
        }
        else
        {
            streak.NextCheckDay = NoStreakCheckDay;
        }

        return streak;
    }

    private static bool TryParseStreakDay(string value, out DateOnly day)
    {
        return DateOnly.TryParseExact(
            value,
            StreakDayFormat,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out day
        );
    }
}
