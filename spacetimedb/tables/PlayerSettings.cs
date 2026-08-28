using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "playersettings")]
    public partial struct PlayerSettings
    {
        [PrimaryKey]
        public Identity Identity;
        public string Value;
    }
}
