using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void CleanupOldXpGains(ReducerContext ctx, XpGainCleaner args)
    {
    }

}
