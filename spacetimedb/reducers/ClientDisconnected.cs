using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer(ReducerKind.ClientDisconnected)]
    public static void clientDisconnected(ReducerContext ctx)
    {
    }

}
