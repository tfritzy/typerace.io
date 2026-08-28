using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [View(Name = "myplayersettings", Public = true)]
    public static PlayerSettings? myPlayerSettings(ViewContext ctx)
    {
        return ctx.Db.playersettings.Identity.Find(ctx.Sender);
    }
}
