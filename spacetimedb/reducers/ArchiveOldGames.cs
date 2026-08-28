using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void ArchiveOldGames(ReducerContext ctx, GameArchiver args)
    {
        var fiveMinutesAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 300_000_000;

        foreach (var game in ctx.Db.game.State.Filter(GameState.Racing))
        {
            if (game.CreatedAt < fiveMinutesAgo)
            {
                UpdateGlobalStatsForGame(ctx, game);
                RecordAbandonedGame(ctx, game);

                var updatedGame = game;
                updatedGame.State = GameState.Archived;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {game.Id} transitioned to Archived state");
            }
        }

        var thirtySecondsAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 30_000_000;
        var oneHourAgo = ctx.Timestamp.MicrosecondsSinceUnixEpoch - 3_600_000_000;

        foreach (var game in ctx.Db.game.State.Filter(GameState.Lobby))
        {
            bool shouldDelete =
                (game.GameType == GameType.Public && game.CreatedAt < thirtySecondsAgo) ||
                (game.GameType == GameType.Private && game.CreatedAt < oneHourAgo);

            if (shouldDelete)
            {
                foreach (var pp in ctx.Db.playerprogress.GameId.Filter(game.Id))
                {
                    ctx.Db.playerprogress.Id.Delete(pp.Id);
                }

                ctx.Db.game.Id.Delete(game.Id);
                Log.Info($"Deleted stale {game.GameType} lobby game {game.Id}");
            }
        }
    }
}
