using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "playerstreak", Public = true)]
    public partial struct PlayerStreak
    {
        [PrimaryKey]
        public Identity PlayerId;
        public int Streak;
        public string LastActiveDay;
        public int Protections;
        [SpacetimeDB.Index.BTree]
        public string NextCheckDay;
    }
}
