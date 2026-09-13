using Xunit;

namespace StdbModule;

public sealed class StreakTimeTests
{
    [Fact]
    public void ResolvesThePlayersLocalDayAtMidnight()
    {
        var beforeMidnight = DateTimeOffset.Parse("2026-09-12T05:59:59Z")
            .ToUnixTimeMilliseconds() * 1_000;
        var atMidnight = DateTimeOffset.Parse("2026-09-12T06:00:00Z")
            .ToUnixTimeMilliseconds() * 1_000;

        Assert.Equal(
            new DateOnly(2026, 9, 11),
            StreakTime.GetLocalDay(beforeMidnight, -360)
        );
        Assert.Equal(
            new DateOnly(2026, 9, 12),
            StreakTime.GetLocalDay(atMidnight, -360)
        );
    }

    [Fact]
    public void LocalMidnightsBecomeSortableUtcKeysAndRoundTrip()
    {
        var earlier = StreakTime.GetUtcMidnightMicros(
            new DateOnly(2026, 9, 12),
            840
        );
        var later = StreakTime.GetUtcMidnightMicros(
            new DateOnly(2026, 9, 12),
            -360
        );

        var earlierKey = StreakTime.FormatUtcTimestamp(earlier);
        var laterKey = StreakTime.FormatUtcTimestamp(later);

        Assert.Equal("2026-09-11T10:00:00Z", earlierKey);
        Assert.Equal("2026-09-12T06:00:00Z", laterKey);
        Assert.True(string.CompareOrdinal(earlierKey, laterKey) < 0);
        Assert.True(StreakTime.TryParseUtcTimestamp(laterKey, out var parsed));
        Assert.Equal(later, parsed);
    }
}
