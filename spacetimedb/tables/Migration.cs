using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Table(Name = "migrations")]
    public partial struct Migration
    {
        [PrimaryKey]
        public string Name;
        public long CompletedAt;
    }
}
