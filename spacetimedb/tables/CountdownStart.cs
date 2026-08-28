using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Scheduled = nameof(StartCountdown))]
    public partial struct CountdownStart
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public string GameId;
        public ScheduleAt ScheduledAt;
    }
}
