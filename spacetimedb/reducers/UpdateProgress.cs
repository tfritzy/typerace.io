using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void updateProgress(ReducerContext ctx, string gameId, int newIndex, CharacterEventType eventType)
    {
        var playerId = ctx.Sender;
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null || game.Value.State != GameState.Racing)
        {
            Log.Info($"Cannot update progress: game {gameId} is not in Racing state");
            return;
        }

        var existingProgress = FindPlayerProgress(ctx, playerId, gameId);

        if (existingProgress == null)
        {
            Log.Info($"No progress found for player {playerId} in game {gameId}");
            return;
        }

        ProcessProgressUpdate(ctx, existingProgress.Value, game.Value, newIndex, eventType);
    }
}
