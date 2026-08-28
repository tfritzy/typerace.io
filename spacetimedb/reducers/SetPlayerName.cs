using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void setPlayerName(ReducerContext ctx, string name)
    {
        const int MinNameLength = 1;
        const int MaxNameLength = 30;

        if (string.IsNullOrWhiteSpace(name))
        {
            Log.Info($"Player {ctx.Sender} attempted to set empty name");
            return;
        }

        var trimmedName = name.Trim();

        if (trimmedName.Length < MinNameLength || trimmedName.Length > MaxNameLength)
        {
            Log.Info($"Player {ctx.Sender} attempted to set name with invalid length: {trimmedName.Length}");
            return;
        }

        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.Name = trimmedName;
            ctx.Db.player.Identity.Update(updatedPlayer);
            Log.Info($"Updated player name for {ctx.Sender} to {trimmedName}");
        }
    }

}
