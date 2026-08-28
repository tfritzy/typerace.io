using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "personalrecord", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(PlayerId), nameof(GameMode), nameof(PhraseLength) })]
    public partial struct PersonalRecord
    {
        [PrimaryKey]
        public string Id;
        public Identity PlayerId;
        public GameMode GameMode;
        public string GameRecordId;
        public double Wpm;
        [Default(null!)]
        public int? PhraseLength;
        [Default("")]
        public string GameId;
        [Default(0)]
        public double Accuracy;
    }
}
