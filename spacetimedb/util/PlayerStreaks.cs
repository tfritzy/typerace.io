using System.Globalization;
using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const string StreakDayFormat = "yyyy-MM-dd";
    private const string NoStreakCheckDay = "9999-12-31";

    private static void UpdatePlayerStreak(ReducerContext ctx, Identity playerId, string activeDay)
    {
        if (!TryParseStreakDay(activeDay, out var currentDay))
        {
            return;
        }

        var existing = ctx.Db.playerstreak.PlayerId.Find(playerId);
        if (existing == null)
        {
            ctx.Db.playerstreak.Insert(CreatePlayerStreak(playerId, currentDay));
            return;
        }

        if (!TryParseStreakDay(existing.Value.LastActiveDay, out var lastActiveDay)
            || currentDay < lastActiveDay)
        {
            return;
        }

        var updated = ApplyCompletedGame(existing.Value, currentDay);
        ctx.Db.playerstreak.PlayerId.Update(updated);
    }

    private static PlayerStreak CreatePlayerStreak(Identity playerId, DateOnly activeDay)
    {
        return ApplyStreakState(
            new PlayerStreak { PlayerId = playerId },
            StreakRules.Start(activeDay)
        );
    }

    private static PlayerStreak ApplyCompletedGame(PlayerStreak streak, DateOnly activeDay)
    {
        if (!TryGetStreakState(streak, out var state))
        {
            return streak;
        }

        return ApplyStreakState(streak, StreakRules.CompleteGame(state, activeDay));
    }

    private static PlayerStreak ApplyMissedDaysBefore(PlayerStreak streak, DateOnly endExclusive)
    {
        if (!TryGetStreakState(streak, out var state))
        {
            return streak;
        }

        return ApplyStreakState(
            streak,
            StreakRules.ApplyMissedDaysBefore(state, endExclusive)
        );
    }

    private static bool TryGetStreakState(PlayerStreak streak, out StreakState state)
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

        state = new StreakState(
            Count: streak.Streak,
            LastActiveDay: lastActiveDay,
            Protections: streak.Protections,
            NextCheckDay: nextCheckDay
        );
        return true;
    }

    private static PlayerStreak ApplyStreakState(PlayerStreak streak, StreakState state)
    {
        streak.Streak = state.Count;
        streak.LastActiveDay = state.LastActiveDay.ToString(
            StreakDayFormat,
            CultureInfo.InvariantCulture
        );
        streak.Protections = state.Protections;
        if (state.NextCheckDay is DateOnly nextCheckDay)
        {
            streak.NextCheckDay = nextCheckDay.ToString(
                StreakDayFormat,
                CultureInfo.InvariantCulture
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
