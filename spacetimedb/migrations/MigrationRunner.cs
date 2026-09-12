using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const string PlayerStreakMigrationName = "2026-09-08-player-streaks";

    [Reducer]
    public static void RunMigrations(ReducerContext ctx)
    {
        RunMigration(ctx, PlayerStreakMigrationName, MigratePlayerStreaks);
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
