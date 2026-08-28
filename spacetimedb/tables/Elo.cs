using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "elo", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(PlayerId), nameof(GameMode) })]
    public partial struct Elo
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        public int Rating;
    }
}
