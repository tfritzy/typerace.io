using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void rematch(ReducerContext ctx, string gameId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType == GameType.Private && game.Value.Owner != ctx.Sender)
        {
            Log.Info($"Player {ctx.Sender} is not the owner of private game {gameId}");
            return;
        }

        var senderProgress = FindPlayerProgress(ctx, ctx.Sender, gameId);
        if (senderProgress == null)
        {
            Log.Info($"Player {ctx.Sender} is not in game {gameId}");
            return;
        }

        var newGame = InsertGame(ctx, game.Value.GameMode, game.Value.GameType);
        Log.Info($"Created rematch game {newGame.Id} for original game {gameId}");

        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            if (!progress.IsBot)
            {
                var player = ctx.Db.player.Identity.Find(progress.PlayerId);
                var playerName = player?.Name ?? "Unknown";
                var playerLevel = player?.Level ?? 1;
                var isAnonymous = player?.IsAnonymous ?? true;
                var playerPublicId = player?.PlayerId ?? "";

                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = progress.PlayerId,
                    PlayerPublicId = playerPublicId,
                    GameId = newGame.Id,
                    PlayerName = playerName,
                    PlayerLevel = playerLevel,
                    ProgressIndex = 0,
                    IsBot = false,
                    IsAnonymous = isAnonymous,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                    CharacterHistory = new byte[0],
                    Time = 0,
                    Placement = -1,
                    JoinCode = gameId,
                    PlayerColor = GenerateRandomColor(ctx.Rng)
                });

                Log.Info($"Added player {progress.PlayerId} to rematch game {newGame.Id} with join code {gameId}");
            }
        }
    }

}
