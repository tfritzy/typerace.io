using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Scheduled = nameof(CleanupOldScores))]
    public partial struct ScoreCleaner
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }
}
