using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "playertimezone")]
    public partial struct PlayerTimezone
    {
        [PrimaryKey]
        public Identity PlayerId;
        public int UtcOffsetMinutes;
    }
}
