using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Scheduled = nameof(StartGame))]
    public partial struct GameStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }
}
