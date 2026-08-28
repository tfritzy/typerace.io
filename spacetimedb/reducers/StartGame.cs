using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void StartGame(ReducerContext ctx, GameStart args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Countdown)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Racing;
            updatedGame.RacingStartedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Racing state");

            foreach (var progress in ctx.Db.playerprogress.GameId.Filter(args.GameId))
            {
                if (progress.IsBot)
                {
                    var botPlayer = ctx.Db.player.Identity.Find(progress.PlayerId);
                    long delayMicroseconds;

                    if (botPlayer != null && botPlayer.Value.BotConfig != null)
                    {
                        var botConfig = botPlayer.Value.BotConfig.Value;
                        var langModifier = GetLanguageTypingSpeedModifier(updatedGame.GameMode);
                        var adjustedRate = botConfig.TypingRate * langModifier;
                        delayMicroseconds = GenerateBotDelayWithVariance(ctx.Rng, adjustedRate);
                    }
                    else
                    {
                        delayMicroseconds = GenerateBotDelay(ctx.Rng);
                    }

                    var delay = new TimeDuration { Microseconds = delayMicroseconds };
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = progress.Id,
                        PhraseLength = updatedGame.Phrase.Length,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + delay)
                    });
                }
            }
        }
    }

}
