using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [View(Name = "topplayersbylevel", Public = true)]
    public static List<Player> topPlayersByLevel(AnonymousViewContext ctx)
    {
        return ctx.Db.player.IsBot.Filter(false)
            .Where(player => !player.IsBot && !player.IsAnonymous)
            .OrderByDescending(player => player.Level)
            .ThenByDescending(player => player.Xp)
            .ThenBy(player => player.PlayerId)
            .Take(100)
            .ToList();
    }
}
