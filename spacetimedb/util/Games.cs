using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static Game? FindLobbyGame(ReducerContext ctx, GameMode gameMode, GameType gameType)
    {
        if (gameType != GameType.Public)
        {
            return null;
        }

        foreach (var game in ctx.Db.game.State_GameType.Filter((GameState.Lobby, GameType.Public)))
        {
            if (game.GameMode == gameMode)
            {
                if (CountPlayersInGame(ctx, game.Id) < GetMaxPlayerCount(gameType))
                {
                    if (FindPlayerProgress(ctx, ctx.Sender, game.Id) == null)
                    {
                        return game;
                    }
                }
            }
        }

        return null;
    }

    private static int CountPlayersInGame(ReducerContext ctx, string gameId)
    {
        int count = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            count++;
        }
        return count;
    }

    private static int GetMaxPlayerCount(GameType gameType)
    {
        return gameType switch
        {
            GameType.Practice => 1,
            GameType.Public => 3,
            GameType.Private => 6,
            _ => 3
        };
    }

    private static long GetCountdownDuration(GameType gameType)
    {
        return gameType switch
        {
            GameType.Public => PUBLIC_GAME_COUNTDOWN_MICROSECONDS,
            GameType.Private => PRIVATE_GAME_COUNTDOWN_MICROSECONDS,
            GameType.Practice => PRACTICE_GAME_COUNTDOWN_MICROSECONDS,
            _ => PRIVATE_GAME_COUNTDOWN_MICROSECONDS
        };
    }

    private static Game InsertGame(ReducerContext ctx, GameMode gameMode, GameType gameType)
    {
        long countdownDurationMicros = GetCountdownDuration(gameType);
        long countdownDurationMs = countdownDurationMicros / 1000;

        var phrase = PhraseGenerator.GeneratePhraseForMode(gameMode, ctx.Rng);

        return ctx.Db.game.Insert(new Game
        {
            Id = IdGenerator.Generate("game_", ctx.Rng),
            Phrase = phrase.Text,
            Attribution = phrase.Attribution,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            RacingStartedAt = 0,
            CountdownDurationMs = countdownDurationMs,
            State = GameState.Lobby,
            GameMode = gameMode,
            GameType = gameType,
            Placements = new List<Identity>(),
            Owner = ctx.Sender,
            AllowedErrors = GetAllowedErrorCount(phrase.Text)
        });
    }

    private static void CancelBotFillTrigger(ReducerContext ctx, string gameId)
    {
        var triggersToDelete = new List<BotFillTrigger>();
        foreach (var trigger in ctx.Db.BotFillTrigger.GameId.Filter(gameId))
        {
            triggersToDelete.Add(trigger);
        }

        foreach (var trigger in triggersToDelete)
        {
            ctx.Db.BotFillTrigger.ScheduledId.Delete(trigger.ScheduledId);
            Log.Info($"Cancelled bot fill trigger for game {gameId}");
        }
    }

    private static void InsertPlayerProgress(ReducerContext ctx, string gameId, string joinCode)
    {
        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        var playerName = player?.Name ?? "Unknown";
        var playerLevel = player?.Level ?? 1;
        var isAnonymous = player?.IsAnonymous ?? true;
        var playerPublicId = player?.PlayerId ?? "";

        ctx.Db.playerprogress.Insert(new PlayerProgress
        {
            Id = IdGenerator.Generate("pp_", ctx.Rng),
            PlayerId = ctx.Sender,
            PlayerPublicId = playerPublicId,
            GameId = gameId,
            PlayerName = playerName,
            PlayerLevel = playerLevel,
            ProgressIndex = 0,
            IsBot = false,
            IsAnonymous = isAnonymous,
            CreatedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            CharacterHistory = new byte[0],
            Time = 0,
            Placement = -1,
            JoinCode = joinCode,
            PlayerColor = GenerateRandomColor(ctx.Rng)
        });
    }

    private static int GetAllowedErrorCount(string phrase)
    {
        return (int)Math.Ceiling(phrase.Length * 0.075);
    }

    private static PlayerProgress? FindPlayerProgress(ReducerContext ctx, Identity playerId, string gameId)
    {
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(gameId))
        {
            if (progress.PlayerId == playerId)
            {
                return progress;
            }
        }
        return null;
    }
}
