using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void acknowledgeXpAward(ReducerContext ctx, string awardId)
    {
        var award = ctx.Db.xpaward.Id.Find(awardId);
        if (award == null) return;

        if (award.Value.PlayerId != ctx.Sender)
        {
            throw new Exception("Cannot acknowledge another player's XP award");
        }

        ctx.Db.xpaward.Id.Delete(awardId);
    }
}
