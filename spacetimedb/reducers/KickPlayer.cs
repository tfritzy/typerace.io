using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void kickPlayer(ReducerContext ctx, string gameId, Identity targetPlayerId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType != GameType.Private)
        {
            Log.Info($"Game {gameId} is not a private game");
            return;
        }

        if (game.Value.Owner != ctx.Sender)
        {
            Log.Info($"Player {ctx.Sender} is not the owner of private game {gameId}");
            return;
        }

        if (targetPlayerId == ctx.Sender)
        {
            Log.Info($"Owner {ctx.Sender} cannot kick themselves from game {gameId}");
            return;
        }

        var targetProgress = FindPlayerProgress(ctx, targetPlayerId, gameId);
        if (targetProgress == null)
        {
            Log.Info($"Target player {targetPlayerId} is not in game {gameId}");
            return;
        }

        ctx.Db.playerprogress.Id.Delete(targetProgress.Value.Id);
        Log.Info($"Player {targetPlayerId} was kicked from game {gameId} by owner {ctx.Sender}");
    }

}
