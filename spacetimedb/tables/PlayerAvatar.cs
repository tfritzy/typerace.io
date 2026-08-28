using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "playeravatar", Public = true)]
    public partial struct PlayerAvatar
    {
        [PrimaryKey]
        public Identity Identity;
        public string PhotoUrl;
    }
}
