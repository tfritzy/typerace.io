using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "game_score", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameId), nameof(Language), nameof(Day) })]
    public partial struct GameScore
    {
        [PrimaryKey]
        public string Id;
        public string GameId;
        public string Language;
        public Identity PlayerId;
        public string PlayerName;
        public int Value;
        [SpacetimeDB.Index.BTree]
        public long Timestamp;
        public long TimeMs;
        public string Day;
    }
}
