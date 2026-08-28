using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Scheduled = nameof(ArchiveOldGames))]
    public partial struct GameArchiver
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }
}
