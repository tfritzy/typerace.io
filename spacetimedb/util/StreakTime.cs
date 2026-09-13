using System.Globalization;

namespace StdbModule;

internal static class StreakTime
{
    private const string UtcTimestampFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    internal const int MinimumUtcOffsetMinutes = -12 * 60;
    internal const int MaximumUtcOffsetMinutes = 14 * 60;

    internal static bool IsValidUtcOffset(int utcOffsetMinutes)
    {
        return utcOffsetMinutes is >= MinimumUtcOffsetMinutes
            and <= MaximumUtcOffsetMinutes;
    }

    internal static DateOnly GetLocalDay(long timestampMicros, int utcOffsetMinutes)
    {
        var utc = DateTimeOffset.FromUnixTimeMilliseconds(timestampMicros / 1_000);
        return DateOnly.FromDateTime(utc.UtcDateTime.AddMinutes(utcOffsetMinutes));
    }

    internal static long GetUtcMidnightMicros(DateOnly localDay, int utcOffsetMinutes)
    {
        var localMidnight = localDay.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        var utcMidnight = new DateTimeOffset(
            localMidnight,
            TimeSpan.FromMinutes(utcOffsetMinutes)
        );
        return utcMidnight.ToUnixTimeMilliseconds() * 1_000;
    }

    internal static string FormatUtcTimestamp(long timestampMicros)
    {
        return DateTimeOffset.FromUnixTimeMilliseconds(timestampMicros / 1_000)
            .UtcDateTime
            .ToString(UtcTimestampFormat, CultureInfo.InvariantCulture);
    }

    internal static bool TryParseUtcTimestamp(string value, out long timestampMicros)
    {
        if (DateTimeOffset.TryParseExact(
            value,
            UtcTimestampFormat,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
            out var timestamp
        ))
        {
            timestampMicros = timestamp.ToUnixTimeMilliseconds() * 1_000;
            return true;
        }

        timestampMicros = 0;
        return false;
    }
}
