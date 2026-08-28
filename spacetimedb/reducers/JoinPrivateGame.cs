using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void joinPrivateGame(ReducerContext ctx, string gameId)
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

        if (game.Value.State != GameState.Lobby)
        {
            Log.Info($"Cannot join game {gameId} - game is not in lobby state");
            return;
        }

        var existingProgress = FindPlayerProgress(ctx, ctx.Sender, gameId);
        if (existingProgress != null)
        {
            Log.Info($"Player {ctx.Sender} is already in game {gameId}");
            return;
        }

        InsertPlayerProgress(ctx, gameId, "");
        Log.Info($"Player {ctx.Sender} joined private game {gameId}");
    }

}
