namespace StdbModule;

internal readonly record struct StreakState(
    int Count,
    DateOnly LastActiveDay,
    int Protections,
    DateOnly? NextCheckDay
);

internal static class StreakRules
{
    internal const int MaxProtections = 2;

    internal static StreakState Start(DateOnly activeDay)
    {
        return new StreakState(
            Count: 1,
            LastActiveDay: activeDay,
            Protections: 1,
            NextCheckDay: activeDay.AddDays(1)
        );
    }

    internal static StreakState CompleteGame(StreakState state, DateOnly activeDay)
    {
        if (activeDay < state.LastActiveDay)
        {
            return state;
        }

        state = AddProtection(state);
        if (activeDay == state.LastActiveDay)
        {
            return state;
        }

        return state with
        {
            Count = state.Count + 1,
            LastActiveDay = activeDay,
            NextCheckDay = activeDay.AddDays(1)
        };
    }

    private static StreakState AddProtection(StreakState state)
    {
        return state with
        {
            Protections = Math.Min(state.Protections + 1, MaxProtections)
        };
    }

    internal static StreakState ApplyMissedDaysBefore(
        StreakState state,
        DateOnly endExclusive
    )
    {
        if (endExclusive < state.LastActiveDay)
        {
            return state;
        }

        if (state.Count == 0)
        {
            return state with { NextCheckDay = null };
        }

        var day = state.NextCheckDay?.AddDays(-1) ?? state.LastActiveDay;
        while (day < endExclusive)
        {
            if (day != state.LastActiveDay && !IsWeekend(day))
            {
                if (state.Protections == 0)
                {
                    return state with { Count = 0, NextCheckDay = null };
                }

                state = state with { Protections = state.Protections - 1 };
            }

            day = day.AddDays(1);
        }

        return state with { NextCheckDay = endExclusive.AddDays(1) };
    }

    private static bool IsWeekend(DateOnly day)
    {
        return day.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
    }
}
