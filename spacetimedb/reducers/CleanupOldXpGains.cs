using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void CleanupOldXpGains(ReducerContext ctx, XpGainCleaner args)
    {
        var cutoff = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;
        ctx.Db.xpgain.Timestamp.Delete((long.MinValue, cutoff));
        ctx.Db.xpaward.Timestamp.Delete((long.MinValue, cutoff));
    }
}
