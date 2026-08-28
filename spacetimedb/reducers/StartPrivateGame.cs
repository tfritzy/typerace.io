using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void startPrivateGame(ReducerContext ctx, string gameId)
    {
        var game = ctx.Db.game.Id.Find(gameId);

        if (game == null)
        {
            Log.Info($"Game {gameId} not found");
            return;
        }

        if (game.Value.GameType == GameType.Public)
        {
            Log.Info($"Game {gameId} is not a private or practice game");
            return;
        }

        if (game.Value.State != GameState.Lobby)
        {
            Log.Info($"Game {gameId} is not in Lobby state");
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

        var updatedGame = game.Value;
        updatedGame.State = GameState.Countdown;
        ctx.Db.game.Id.Update(updatedGame);

        Log.Info($"Private/practice game {gameId} transitioned to Countdown state");

        long countdownDuration = GetCountdownDuration(game.Value.GameType);
        var countdownTime = new TimeDuration { Microseconds = countdownDuration };
        var scheduledTime = ctx.Timestamp + countdownTime;

        ctx.Db.GameStart.Insert(new GameStart
        {
            ScheduledId = 0,
            GameId = gameId,
            ScheduledAt = new ScheduleAt.Time(scheduledTime)
        });
    }

}
