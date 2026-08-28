using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "gamerecord", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(GameRecord.PlayerId), nameof(GameRecord.Day) })]
    public partial struct GameRecord
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string GameId;
        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;
        [SpacetimeDB.Index.BTree]
        public GameType GameType;
        [SpacetimeDB.Index.BTree]
        public int Year;
        [SpacetimeDB.Index.BTree]
        public int Month;
        public long Date;
        public long TimeMs;
        public int Placement;
        public double Wpm;
        public int XpGained;
        public int EloChange;
        [SpacetimeDB.Index.BTree]
        [Default("")]
        public string Day;
        [Default(0)]
        public double Accuracy;
        [Default(0)]
        public int PhraseLength;
        [Default(false)]
        public bool IsPersonalBest;
    }
}
