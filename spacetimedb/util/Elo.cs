using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int INITIAL_PLAYER_ELO = 800;
    private const int INITIAL_BOT_ELO = 1000;

    private static int UpdatePlayerElo(ReducerContext ctx, Identity playerId, Game game, int placement)
    {
        if (game.GameType == GameType.Private || game.GameType == GameType.Practice)
        {
            return 0;
        }

        var currentElo = GetOrCreatePlayerElo(ctx, playerId, game.GameMode);

        var totalEloChange = 0;
        var opponentCount = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (progress.PlayerId != playerId)
            {
                opponentCount++;
                var opponentElo = GetOrCreatePlayerElo(ctx, progress.PlayerId, game.GameMode);
                var actualScore = (progress.Placement == -1 || progress.Placement > placement) ? 1.0 : 0.0;
                var eloChange = CalculateEloChange(currentElo.Rating, opponentElo.Rating, actualScore);
                totalEloChange += eloChange;
            }
        }

        if (opponentCount == 0)
        {
            return 0;
        }

        var updatedElo = currentElo;
        updatedElo.Rating += totalEloChange;
        updatedElo.Rating = Math.Max(0, updatedElo.Rating);
        ctx.Db.elo.Id.Update(updatedElo);

        Log.Info($"Player {playerId} ELO updated: {currentElo.Rating} -> {updatedElo.Rating} (change: {totalEloChange:+0;-0}) in mode {game.GameMode}");

        return totalEloChange;
    }

    private static Elo GetOrCreatePlayerElo(ReducerContext ctx, Identity playerId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.elo.PlayerId_GameMode.Filter((playerId, gameMode)))
        {
            return elo;
        }

        var player = ctx.Db.player.Identity.Find(playerId);
        var initialElo = player != null && player.Value.IsBot
            ? INITIAL_BOT_ELO
            : INITIAL_PLAYER_ELO;

        var newElo = ctx.Db.elo.Insert(new Elo
        {
            Id = IdGenerator.Generate("elo_", ctx.Rng),
            PlayerId = playerId,
            GameMode = gameMode,
            Rating = initialElo
        });

        Log.Info($"Created initial ELO for player {playerId} in mode {gameMode}: {initialElo}");
        return newElo;
    }

    private static int CalculateEloChange(int playerElo, int opponentElo, double actualScore)
    {
        var kFactor = 32.0;

        var expectedScore = 1.0 / (1.0 + Math.Pow(10.0, (opponentElo - playerElo) / 400.0));

        var eloChange = kFactor * (actualScore - expectedScore);

        return (int)Math.Round(eloChange);
    }
}
