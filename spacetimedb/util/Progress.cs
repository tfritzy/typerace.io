using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static double CalculateWpm(int characterCount, long timeMicroseconds)
    {
        if (timeMicroseconds <= 0 || characterCount <= 0)
        {
            return 0;
        }

        var charsPerWord = 5.0;
        var timeSeconds = timeMicroseconds / 1_000_000.0;
        var timeMinutes = timeSeconds / 60.0;
        return characterCount / charsPerWord / timeMinutes;
    }

    private static void AwardXpForCorrectCharacter(ReducerContext ctx, PlayerProgress progress)
    {
        var player = ctx.Db.player.Identity.Find(progress.PlayerId);
        if (player == null || player.Value.IsAnonymous)
        {
            return;
        }

        var updatedPlayer = player.Value;
        updatedPlayer.Xp += 1;
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.player.Identity.Update(updatedPlayer);
    }

    private static void ProcessProgressUpdate(
        ReducerContext ctx,
        PlayerProgress progress,
        Game game,
        int newIndex,
        CharacterEventType eventType)
    {
        if (progress.Placement > 0 || game.Placements.Contains(progress.PlayerId))
        {
            Log.Info($"Ignoring progress update for player {progress.PlayerId}: already finished game {game.Id}");
            return;
        }

        var updatedProgress = progress;
        updatedProgress.ProgressIndex = newIndex;
        CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, eventType);

        var elapsedMicros = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;
        updatedProgress.Wpm = CalculateWpm(newIndex, elapsedMicros);

        if (newIndex > updatedProgress.HighestProgress)
        {
            updatedProgress.HighestProgress = newIndex;

            if (eventType == CharacterEventType.Correct)
            {
                AwardXpForCorrectCharacter(ctx, progress);
            }
        }

        ctx.Db.playerprogress.Id.Update(updatedProgress);

        if (newIndex >= game.Phrase.Length)
        {
            var updatedGame = game;
            updatedGame.Placements.Add(progress.PlayerId);
            var placement = updatedGame.Placements.Count;
            ctx.Db.game.Id.Update(updatedGame);

            var timeElapsed = ctx.Timestamp.MicrosecondsSinceUnixEpoch - game.RacingStartedAt;

            UpdatePlayerStatsForGame(ctx, updatedProgress, updatedGame, placement, timeElapsed);

            Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}");
        }
    }
}
