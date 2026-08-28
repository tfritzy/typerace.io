using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void ping(ReducerContext ctx, ulong nonce)
    {
        // The reducer callback echoes the nonce, which lets the caller measure
        // the database round trip without creating subscription traffic.
    }
}
