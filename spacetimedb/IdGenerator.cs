using System;
using System.Text;

namespace SpacetimeDB;

public static class IdGenerator
{
    private static readonly char[] Base62Chars =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();

    public static string Generate(string prefix, Random rng)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var high = (ulong)rng.Next() << 32;
        var low = (ulong)rng.Next();
        var randomValue = high | low;

        var timestampEncoded = EncodeBase62((ulong)timestamp);
        var randomEncoded = EncodeBase62(randomValue);

        return $"{prefix}{timestampEncoded}{randomEncoded}";
    }

    private static string EncodeBase62(ulong value)
    {
        if (value == 0)
            return "0";

        var result = new StringBuilder();
        while (value > 0)
        {
            result.Insert(0, Base62Chars[value % 62]);
            value /= 62;
        }

        return result.ToString();
    }
}