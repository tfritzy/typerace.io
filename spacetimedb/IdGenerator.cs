using System;
using System.Security.Cryptography;
using System.Text;

namespace SpacetimeDB;

public static class IdGenerator
{
    private static readonly char[] Base62Chars = 
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();

    public static string Generate(string prefix)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var randomBytes = RandomNumberGenerator.GetBytes(10);
        
        var timestampEncoded = EncodeBase62((ulong)timestamp);
        var randomEncoded = EncodeBase62(BitConverter.ToUInt64(randomBytes, 0));
        
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
