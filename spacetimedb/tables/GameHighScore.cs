using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "game_highscore", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameId), nameof(Language) })]
    public partial struct GameHighScore
    {
        [PrimaryKey]
        public string Id;
        public string GameId;
        public string Language;
        public Identity PlayerId;
        public string PlayerName;
        public int Value;
        public long Timestamp;
        public long TimeMs;
    }
}
