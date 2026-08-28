using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "game", Public = true)]
    [SpacetimeDB.Index.BTree(Columns = new[] { nameof(State), nameof(GameType) })]
    public partial struct Game
    {
        [PrimaryKey]
        public string Id;
        public string Phrase;
        public long CreatedAt;
        public long RacingStartedAt;
        public long CountdownDurationMs;

        [SpacetimeDB.Index.BTree]
        public GameState State;

        [SpacetimeDB.Index.BTree]
        public GameMode GameMode;

        [SpacetimeDB.Index.BTree]
        public GameType GameType;

        public List<Identity> Placements;
        public Identity? Owner;
        [Default("")]
        public string? Attribution;
        [Default(0)]
        public int AllowedErrors;
    }
}
