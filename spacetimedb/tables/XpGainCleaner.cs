using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Scheduled = nameof(CleanupOldXpGains))]
    public partial struct XpGainCleaner
    {
        [AutoInc]
        [PrimaryKey]
        public ulong ScheduledId;
        public ScheduleAt ScheduledAt;
    }
}
