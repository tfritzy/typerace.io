using Xunit;

namespace StdbModule;

public sealed class StreakRulesTests
{
    private static readonly DateOnly Monday = new(2026, 9, 7);

    [Fact]
    public void StartCreatesAOneDayStreakWithOneProtection()
    {
        var streak = StreakRules.Start(Monday);

        Assert.Equal(1, streak.Count);
        Assert.Equal(Monday, streak.LastActiveDay);
        Assert.Equal(1, streak.Protections);
        Assert.Equal(Monday.AddDays(1), streak.NextCheckDay);
    }

    [Fact]
    public void CompletingAnotherGameOnTheSameDayOnlyRechargesProtection()
    {
        var streak = StreakRules.Start(Monday) with { Protections = 0 };

        var updated = StreakRules.CompleteGame(streak, Monday);

        Assert.Equal(1, updated.Count);
        Assert.Equal(1, updated.Protections);
        Assert.Equal(Monday, updated.LastActiveDay);
    }

    [Fact]
    public void CompletingAGameDoesNotExceedTwoProtections()
    {
        var streak = StreakRules.Start(Monday) with { Protections = 2 };

        var updated = StreakRules.CompleteGame(streak, Monday);

        Assert.Equal(2, updated.Protections);
    }

    [Fact]
    public void CompletingAGameAdvancesWithoutCheckingMissedDays()
    {
        var streak = StreakRules.Start(Monday) with { Protections = 0 };
        var friday = Monday.AddDays(4);

        var updated = StreakRules.CompleteGame(streak, friday);

        Assert.Equal(2, updated.Count);
        Assert.Equal(1, updated.Protections);
        Assert.Equal(friday, updated.LastActiveDay);
        Assert.Equal(friday.AddDays(1), updated.NextCheckDay);
    }

    [Fact]
    public void MissingAWeekdayConsumesOneProtection()
    {
        var streak = StreakRules.Start(Monday);

        var updated = StreakRules.ApplyMissedDaysBefore(streak, Monday.AddDays(2));

        Assert.Equal(1, updated.Count);
        Assert.Equal(0, updated.Protections);
    }

    [Fact]
    public void WeekendDaysDoNotConsumeProtection()
    {
        var friday = new DateOnly(2026, 9, 4);
        var mondayAfterWeekend = friday.AddDays(3);
        var streak = StreakRules.Start(friday);

        var updated = StreakRules.ApplyMissedDaysBefore(streak, mondayAfterWeekend);

        Assert.Equal(1, updated.Count);
        Assert.Equal(1, updated.Protections);
    }

    [Fact]
    public void MissingAThirdWeekdayBreaksTheStreak()
    {
        var streak = StreakRules.Start(Monday) with { Protections = 2 };

        var updated = StreakRules.ApplyMissedDaysBefore(streak, Monday.AddDays(4));

        Assert.Equal(0, updated.Count);
        Assert.Equal(0, updated.Protections);
        Assert.Null(updated.NextCheckDay);
    }

    [Fact]
    public void CompletingAGameAfterAResetStartsAtOne()
    {
        var broken = StreakRules.ApplyMissedDaysBefore(
            StreakRules.Start(Monday),
            Monday.AddDays(4)
        );
        var friday = Monday.AddDays(4);

        var updated = StreakRules.CompleteGame(broken, friday);

        Assert.Equal(1, updated.Count);
        Assert.Equal(1, updated.Protections);
        Assert.Equal(friday, updated.LastActiveDay);
    }
}
