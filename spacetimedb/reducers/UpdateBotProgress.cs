using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void UpdateBotProgress(ReducerContext ctx, BotProgressUpdate args)
    {
        var progress = ctx.Db.playerprogress.Id.Find(args.PlayerProgressId);

        if (progress != null && progress.Value.IsBot)
        {
            var game = ctx.Db.game.Id.Find(progress.Value.GameId);

            if (game != null && game.Value.State == GameState.Racing)
            {
                var botPlayer = ctx.Db.player.Identity.Find(progress.Value.PlayerId);
                if (botPlayer == null || botPlayer.Value.BotConfig == null)
                {
                    Log.Info($"Bot player {progress.Value.PlayerId} not found or missing BotConfig");
                    return;
                }

                var botConfig = botPlayer.Value.BotConfig.Value;
                var langModifier = GetLanguageTypingSpeedModifier(game.Value.GameMode);
                var adjustedTypingRate = botConfig.TypingRate * langModifier;
                var shouldError = ctx.Rng.NextDouble() < botConfig.ErrorRate / 4;

                if (shouldError)
                {
                    var phrase = game.Value.Phrase;
                    var progressIndex = progress.Value.ProgressIndex;

                    int wordStart = progressIndex;
                    while (wordStart > 0 && phrase[wordStart - 1] != ' ')
                    {
                        wordStart--;
                    }
                    int charsToDelete = progressIndex - wordStart;

                    var updatedProgress = progress.Value;
                    CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, ctx.Timestamp.MicrosecondsSinceUnixEpoch, CharacterEventType.Incorrect);

                    long recognitionDelay = BOT_RECOGNITION_DELAY_MIN_MICROSECONDS + (long)(ctx.Rng.NextDouble() * BOT_RECOGNITION_DELAY_RANGE_MICROSECONDS);
                    long backspaceInterval = (long)(adjustedTypingRate * BOT_BACKSPACE_SPEED_MULTIPLIER);

                    for (int i = 0; i <= charsToDelete; i++)
                    {
                        long eventTime = ctx.Timestamp.MicrosecondsSinceUnixEpoch + recognitionDelay + i * backspaceInterval;
                        CharacterHistoryUtils.Append(ref updatedProgress.CharacterHistory, game.Value.RacingStartedAt, eventTime, CharacterEventType.Backspace);
                    }

                    updatedProgress.ProgressIndex = wordStart;
                    ctx.Db.playerprogress.Id.Update(updatedProgress);

                    long totalBackspaceTime = recognitionDelay + (charsToDelete + 1) * backspaceInterval;
                    long recoveryDelay = (long)(adjustedTypingRate * (BOT_RECOVERY_DELAY_MIN_MULTIPLIER + ctx.Rng.NextDouble() * BOT_RECOVERY_DELAY_RANGE_MULTIPLIER));
                    ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                    {
                        ScheduledId = 0,
                        PlayerProgressId = args.PlayerProgressId,
                        PhraseLength = args.PhraseLength,
                        ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + new TimeDuration { Microseconds = totalBackspaceTime + recoveryDelay })
                    });
                }
                else
                {
                    var newIndex = progress.Value.ProgressIndex + 1;
                    ProcessProgressUpdate(ctx, progress.Value, game.Value, newIndex, CharacterEventType.Correct);

                    if (newIndex < args.PhraseLength)
                    {
                        bool justTypedSpace = progress.Value.ProgressIndex < game.Value.Phrase.Length &&
                                              game.Value.Phrase[progress.Value.ProgressIndex] == ' ';

                        var delay = GenerateRealisticBotDelay(ctx.Rng, adjustedTypingRate, justTypedSpace);
                        ctx.Db.BotProgressUpdate.Insert(new BotProgressUpdate
                        {
                            ScheduledId = 0,
                            PlayerProgressId = args.PlayerProgressId,
                            PhraseLength = args.PhraseLength,
                            ScheduledAt = new ScheduleAt.Time(ctx.Timestamp + new TimeDuration { Microseconds = delay })
                        });
                    }
                }
            }
        }
    }
}
