using SpacetimeDB;

namespace StdbModule;
[Type]
public partial struct GameModeCount
{
    public GameType GameType;
    public GameMode GameMode;
    public int FinishedGames;
    public int NonLonelyGames;
    public int StartedGames;
    public double TotalWpm;
    public double MinWpm;
    public double MaxWpm;
    public int GameCount;
}
