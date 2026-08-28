using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "player", Public = true)]
    public partial struct Player
    {
        [PrimaryKey]
        public Identity Identity;
        [SpacetimeDB.Index.BTree]
        public string PlayerId;
        public string Name;
        public int TotalGames;
        public int Wins;
        public int Level;
        public int Xp;
        public int XpRequiredForNextLevel;
        public int TotalWordsTyped;
        public long TotalTimeSpentMs;
        [SpacetimeDB.Index.BTree]
        public bool IsBot;
        public BotConfig? BotConfig;
        public PlayerColor Color;
        public bool IsAnonymous;
        public long LastGameDate;
    }
}
