using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "abandonedgames", Public = true)]
    public partial struct AbandonedGame
    {
        [PrimaryKey]
        public string GameId;
        public GameMode GameMode;
        public long CreatedAt;
        [SpacetimeDB.Index.BTree]
        public long ArchivedAt;
        public int PlacementCount;
    }
}
