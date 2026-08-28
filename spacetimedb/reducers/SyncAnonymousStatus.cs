using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void syncAnonymousStatus(ReducerContext ctx, bool isAnonymous)
    {
        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

        if (existingPlayer != null)
        {
            var updatedPlayer = existingPlayer.Value;
            updatedPlayer.IsAnonymous = isAnonymous;

            if (!isAnonymous && updatedPlayer.Name.StartsWith("Anonymous "))
            {
                var newAdjective = GenerateNonAnonymousAdjective(ctx.Rng);
                updatedPlayer.Name = updatedPlayer.Name.Replace("Anonymous", newAdjective);
                Log.Info($"Updated player name from Anonymous to {newAdjective} for {ctx.Sender}");
            }

            ctx.Db.player.Identity.Update(updatedPlayer);
            Log.Info($"Updated anonymous status for {ctx.Sender} to {isAnonymous}");
        }
    }

}
