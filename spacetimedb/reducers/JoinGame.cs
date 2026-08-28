using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void joinGame(ReducerContext ctx, GameMode gameMode, string joinCode, GameType gameType)
    {
        Log.Info($"Player {ctx.Sender} looking for game.");
        var foundGame = FindLobbyGame(ctx, gameMode, gameType);

        if (foundGame != null)
        {
            Log.Info($"Player {ctx.Sender} joined game {foundGame.Value.Id}");
            InsertPlayerProgress(ctx, foundGame.Value.Id, joinCode);

            int playerCount = CountPlayersInGame(ctx, foundGame.Value.Id);
            int requiredPlayers = GetMaxPlayerCount(foundGame.Value.GameType);

            if (playerCount >= requiredPlayers)
            {
                CancelBotFillTrigger(ctx, foundGame.Value.Id);

                var updatedGame = foundGame.Value;
                updatedGame.State = GameState.Countdown;
                ctx.Db.game.Id.Update(updatedGame);

                Log.Info($"Game {foundGame.Value.Id} reached {requiredPlayers} players, transitioning to Countdown state");

                long countdownDuration = GetCountdownDuration(foundGame.Value.GameType);
                var countdownTime = new TimeDuration { Microseconds = countdownDuration };
                var scheduledTime = ctx.Timestamp + countdownTime;

                ctx.Db.GameStart.Insert(new GameStart
                {
                    ScheduledId = 0,
                    GameId = foundGame.Value.Id,
                    ScheduledAt = new ScheduleAt.Time(scheduledTime)
                });
            }
        }
        else
        {
            var newGame = InsertGame(ctx, gameMode, gameType);

            Log.Info($"Player {ctx.Sender} created and joined game {newGame.Id}");
            InsertPlayerProgress(ctx, newGame.Id, joinCode);

            int playerCount = CountPlayersInGame(ctx, newGame.Id);
            int requiredPlayers = GetMaxPlayerCount(gameType);

            if (playerCount >= requiredPlayers)
            {
                if (gameType == GameType.Practice)
                {
                    var startDelay = new TimeDuration { Microseconds = PRACTICE_GAME_COUNTDOWN_START_DELAY_MICROSECONDS };
                    var scheduledTime = ctx.Timestamp + startDelay;

                    ctx.Db.CountdownStart.Insert(new CountdownStart
                    {
                        ScheduledId = 0,
                        GameId = newGame.Id,
                        ScheduledAt = new ScheduleAt.Time(scheduledTime)
                    });

                    Log.Info($"Practice game {newGame.Id} scheduled to start countdown in 1 second");
                }
                else
                {
                    var updatedGame = newGame;
                    updatedGame.State = GameState.Countdown;
                    ctx.Db.game.Id.Update(updatedGame);

                    Log.Info($"Game {newGame.Id} reached {requiredPlayers} players, transitioning to Countdown state");

                    long countdownDuration = GetCountdownDuration(gameType);
                    var countdownTime = new TimeDuration { Microseconds = countdownDuration };
                    var scheduledTime = ctx.Timestamp + countdownTime;

                    ctx.Db.GameStart.Insert(new GameStart
                    {
                        ScheduledId = 0,
                        GameId = newGame.Id,
                        ScheduledAt = new ScheduleAt.Time(scheduledTime)
                    });
                }
            }
            else if (gameType == GameType.Public)
            {
                var botFillDelay = new TimeDuration { Microseconds = BOT_FILL_DELAY_MICROSECONDS };
                var futureTimestamp = ctx.Timestamp + botFillDelay;

                ctx.Db.BotFillTrigger.Insert(new BotFillTrigger
                {
                    ScheduledId = 0,
                    GameId = newGame.Id,
                    ScheduledAt = new ScheduleAt.Time(futureTimestamp)
                });
            }
        }
    }
}
