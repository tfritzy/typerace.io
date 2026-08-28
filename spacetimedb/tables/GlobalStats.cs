using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "globalstats", Public = true)]
    public partial struct GlobalStats
    {
        [PrimaryKey]
        public string Date;
        public List<GameModeCount> Stats;
        public GameModeCount Total;
        [Default(0)]
        public int DailyActivePlayers;
    }
}
