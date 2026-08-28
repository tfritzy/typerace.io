using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "xpgain", Public = true)]
    public partial struct XpGain
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string GameId;
        [SpacetimeDB.Index.BTree]
        public long Timestamp;
        public int BaseXp;
        public List<XpMultiplier> Multipliers;
        public int TotalXp;
    }
}
