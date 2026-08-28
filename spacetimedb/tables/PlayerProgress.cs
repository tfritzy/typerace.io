using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "playerprogress", Public = true)]
    public partial struct PlayerProgress
    {
        [PrimaryKey]
        public string Id;
        [SpacetimeDB.Index.BTree]
        public Identity PlayerId;
        public string PlayerPublicId;
        [SpacetimeDB.Index.BTree]
        public string GameId;
        public string PlayerName;
        public int PlayerLevel;
        public int ProgressIndex;
        public bool IsBot;
        public bool IsAnonymous;
        public long CreatedAt;
        public byte[] CharacterHistory;
        public long Time;
        public int Placement;
        [SpacetimeDB.Index.BTree]
        public string JoinCode;
        public double Wpm;
        public PlayerColor PlayerColor;
        [Default(0)]
        public int HighestProgress;
        [Default(0)]
        public int AutofixesRemaining;
    }
}
