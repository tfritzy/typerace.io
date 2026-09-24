using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void RunMigrations(ReducerContext ctx)
    {
        RunMigration(
            ctx,
            "init-stat-distributions-v1",
            InitializeStatDistributions
        );
    }

    private static void InitializeStatDistributions(ReducerContext ctx)
    {
        var statTypes = new[]
        {
            StatType.GamesPlayed,
            StatType.Streaks,
            StatType.WordsTyped,
            StatType.Levels
        };
        var bucketsByType = statTypes.ToDictionary(
            statType => statType,
            _ => new Dictionary<long, long>()
        );

        foreach (var player in ctx.Db.player.Iter())
        {
            if (player.IsBot || player.IsAnonymous || player.TotalGames == 0)
            {
                continue;
            }

            var streak = ctx.Db.playerstreak.PlayerId.Find(player.Identity)?.Streak ?? 0;
            foreach (var statType in statTypes)
            {
                var value = statType switch
                {
                    StatType.GamesPlayed => (long)player.TotalGames,
                    StatType.Streaks => (long)streak,
                    StatType.WordsTyped => (long)player.TotalWordsTyped,
                    StatType.Levels => (long)player.Level,
                    _ => throw new InvalidOperationException($"No stat value mapping configured for stat type {statType}")
                };

                var buckets = bucketsByType[statType];
                var bucketIndex = StatDistributionUtils.GetBucket(value, StatDistributionUtils.BucketSize(statType));
                buckets[bucketIndex] = buckets.GetValueOrDefault(bucketIndex) + 1;
            }
        }

        foreach (var statType in statTypes)
        {
            var key = statType.ToString();
            var existing = ctx.Db.statdistribution.StatType.Find(key);
            if (existing != null)
            {
                ctx.Db.statdistribution.StatType.Delete(existing.Value.StatType);
            }

            var buckets = bucketsByType[statType];
            var counts = buckets.OrderBy(pair => pair.Key).ToList();
            var list = new List<long>();
            if (counts.Count > 0)
            {
                var lastIndex = counts[^1].Key;
                var byIndex = counts.ToDictionary(pair => pair.Key, pair => pair.Value);
                for (var i = 0; i <= lastIndex; i++)
                {
                    list.Add(byIndex.GetValueOrDefault(i));
                }
            }

            ctx.Db.statdistribution.Insert(new StatDistribution
            {
                StatType = key,
                BucketSize = StatDistributionUtils.BucketSize(statType),
                Buckets = list
            });
        }
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
