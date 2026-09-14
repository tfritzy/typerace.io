using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "xpaward", Public = true)]
    public partial struct XpAward
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string GameId;
        [SpacetimeDB.Index.BTree]
        public long Timestamp;
        public List<XpEffect> Effects;
        public int TotalXp;
    }
}
