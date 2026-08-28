using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void CleanupOldScores(ReducerContext ctx, ScoreCleaner args)
    {
        var cutoff = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 86_400_000_000;
        ctx.Db.game_score.Timestamp.Delete((long.MinValue, cutoff));
    }

}
