using SpacetimeDB;

namespace StdbModule;

public static class StatDistributionUtils
{
    public static long BucketSize(StatType statType) => statType switch
    {
        StatType.GamesPlayed => 5,
        StatType.Streaks => 1,
        StatType.WordsTyped => 100,
        StatType.Levels => 1,
        _ => throw new InvalidOperationException($"No bucket size configured for stat type {statType}")
    };

    public static long GetBucket(long value, long bucketSize)
    {
        return value / bucketSize;
    }

    public static void MovePlayerBetweenBuckets(ReducerContext ctx, StatType statType, long oldValue, long newValue)
    {
        var oldBucket = GetBucket(oldValue, BucketSize(statType));
        var newBucket = GetBucket(newValue, BucketSize(statType));
        if (oldBucket == newBucket)
        {
            return;
        }

        UpdateBuckets(ctx, statType, buckets => Bump(buckets, oldBucket, -1));
        UpdateBuckets(ctx, statType, buckets => Bump(buckets, newBucket, 1));
    }

    public static void AddPlayerToBucket(ReducerContext ctx, StatType statType, long value)
    {
        var bucket = GetBucket(value, BucketSize(statType));
        UpdateBuckets(ctx, statType, buckets => Bump(buckets, bucket, 1));
    }

    private static void UpdateBuckets(ReducerContext ctx, StatType statType, Func<List<long>, List<long>> update)
    {
        var key = statType.ToString();
        var existing = ctx.Db.statdistribution.StatType.Find(key);
        if (existing == null)
        {
            var created = update(new List<long>());
            ctx.Db.statdistribution.Insert(new Module.StatDistribution
            {
                StatType = key,
                BucketSize = BucketSize(statType),
                Buckets = created
            });
            return;
        }

        var updated = existing.Value;
        updated.Buckets = update(new List<long>(updated.Buckets));
        ctx.Db.statdistribution.StatType.Update(updated);
    }

    private static List<long> Bump(List<long> buckets, long bucketIndex, long delta)
    {
        if (bucketIndex >= buckets.Count)
        {
            if (delta <= 0)
            {
                return buckets;
            }

            buckets.AddRange(Enumerable.Repeat(0L, (int)(bucketIndex - buckets.Count + 1)));
        }

        buckets[(int)bucketIndex] = Math.Max(0, buckets[(int)bucketIndex] + delta);
        return buckets;
    }
}
