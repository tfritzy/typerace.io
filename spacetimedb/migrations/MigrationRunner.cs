using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void RunMigrations(ReducerContext ctx)
    {
    }

    private static void RunMigration(
        ReducerContext ctx,
        string name,
        Action<ReducerContext> migration
    )
    {
        if (ctx.Db.migrations.Name.Find(name) != null)
        {
            return;
        }

        migration(ctx);
        ctx.Db.migrations.Insert(new Migration
        {
            Name = name,
            CompletedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch
        });
        Log.Info($"Completed migration {name}");
    }
}
