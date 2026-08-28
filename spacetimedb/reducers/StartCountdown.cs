using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void StartCountdown(ReducerContext ctx, CountdownStart args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby)
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} transitioned to Countdown state");

            long countdownDuration = GetCountdownDuration(game.Value.GameType);
            var countdownTime = new TimeDuration { Microseconds = countdownDuration };
            var scheduledTime = ctx.Timestamp + countdownTime;

            ctx.Db.GameStart.Insert(new GameStart
            {
                ScheduledId = 0,
                GameId = args.GameId,
                ScheduledAt = new ScheduleAt.Time(scheduledTime)
            });
        }
    }

}
