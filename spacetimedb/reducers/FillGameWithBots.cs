using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer]
    public static void FillGameWithBots(ReducerContext ctx, BotFillTrigger args)
    {
        var game = ctx.Db.game.Id.Find(args.GameId);

        if (game != null && game.Value.State == GameState.Lobby && game.Value.GameType == GameType.Public)
        {
            int currentPlayerCount = CountPlayersInGame(ctx, args.GameId);

            int botsToAdd = 3 - currentPlayerCount;

            var humanPlayerElos = new List<int>();
            foreach (var progress in ctx.Db.playerprogress.GameId.Filter(args.GameId))
            {
                if (!progress.IsBot)
                {
                    var playerElo = GetOrCreatePlayerElo(ctx, progress.PlayerId, game.Value.GameMode);
                    humanPlayerElos.Add(playerElo.Rating);
                }
            }

            int targetElo = humanPlayerElos.Count > 0 ? (int)humanPlayerElos.Average() : 1000;

            var eligibleBots = GetEligibleBots(ctx, game.Value.GameMode, targetElo, args.GameId);

            if (eligibleBots.Count == 0)
            {
                Log.Info($"No eligible bot players available to fill game {args.GameId}");
                return;
            }

            var selectedBots = new List<Player>();
            for (int i = 0; i < botsToAdd && eligibleBots.Count > 0; i++)
            {
                var botIndex = ctx.Rng.Next(eligibleBots.Count);
                var selectedBot = eligibleBots[botIndex];
                selectedBots.Add(selectedBot);
                eligibleBots.RemoveAt(botIndex);
            }

            foreach (var selectedBot in selectedBots)
            {
                ctx.Db.playerprogress.Insert(new PlayerProgress
                {
                    Id = IdGenerator.Generate("pp_", ctx.Rng),
                    PlayerId = selectedBot.Identity,
                    PlayerPublicId = selectedBot.PlayerId,
                    GameId = args.GameId,
                    PlayerName = selectedBot.Name,
                    PlayerLevel = selectedBot.Level,
                    ProgressIndex = 0,
                    IsBot = true,
                    IsAnonymous = false,
                    CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
                    CharacterHistory = new byte[0],
                    Time = 0,
                    Placement = -1,
                    JoinCode = "",
                    PlayerColor = GenerateRandomColor(ctx.Rng)
                });

                Log.Info($"Added bot {selectedBot.Name} (ELO: {GetBotElo(ctx, selectedBot.Identity, game.Value.GameMode)}) to game {args.GameId} (target ELO: {targetElo})");
            }

            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown;
            ctx.Db.game.Id.Update(updatedGame);

            Log.Info($"Game {args.GameId} filled with {selectedBots.Count} bots and transitioned to Countdown state");

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
