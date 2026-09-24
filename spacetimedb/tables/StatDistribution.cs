using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "statdistribution", Public = true)]
    public partial struct StatDistribution
    {
        [PrimaryKey]
        public string StatType;
        public long BucketSize;
        public List<long> Buckets;
    }
}
