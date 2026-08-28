using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static void UpdateGlobalStatsForGame(ReducerContext ctx, Game game)
    {
        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var dateKey = dateTime.ToString("yyyy-MM-dd");

        Log.Info($"[UpdateGlobalStats] Processing game {game.Id} for date {dateKey}");

        var existingStats = ctx.Db.globalstats.Date.Find(dateKey);
        List<GameModeCount> statsList;
        GameModeCount total;
        int dailyActivePlayers;

        if (existingStats == null)
        {
            statsList = new List<GameModeCount>();
            total = new GameModeCount
            {
                GameType = GameType.Public,
                GameMode = GameMode.English500,
                FinishedGames = 0,
                NonLonelyGames = 0,
                StartedGames = 0,
                TotalWpm = 0,
                MinWpm = double.MaxValue,
                MaxWpm = 0,
                GameCount = 0
            };
            dailyActivePlayers = 0;
            Log.Info($"[UpdateGlobalStats] Creating NEW global stats for {dateKey}");
        }
        else
        {
            statsList = existingStats.Value.Stats;
            total = existingStats.Value.Total;
            dailyActivePlayers = existingStats.Value.DailyActivePlayers;
            Log.Info($"[UpdateGlobalStats] Updating EXISTING global stats for {dateKey}, DailyActivePlayers={dailyActivePlayers}");
        }

        GameModeCount? existingCount = null;
        int existingIndex = -1;
        for (int i = 0; i < statsList.Count; i++)
        {
            if (statsList[i].GameType == game.GameType && statsList[i].GameMode == game.GameMode)
            {
                existingCount = statsList[i];
                existingIndex = i;
                break;
            }
        }

        GameModeCount count;
        if (existingCount == null)
        {
            count = new GameModeCount
            {
                GameType = game.GameType,
                GameMode = game.GameMode,
                FinishedGames = 0,
                NonLonelyGames = 0,
                StartedGames = 0,
                TotalWpm = 0,
                MinWpm = double.MaxValue,
                MaxWpm = 0,
                GameCount = 0
            };
        }
        else
        {
            count = existingCount.Value;
        }

        count.StartedGames++;
        total.StartedGames++;

        var finishedHumanCount = 0;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (progress.Placement > 0)
            {
                if (!progress.IsBot)
                {
                    finishedHumanCount++;
                    var wpm = progress.Wpm;
                    if (wpm > 0)
                    {
                        count.TotalWpm += wpm;
                        count.GameCount++;
                        total.TotalWpm += wpm;
                        total.GameCount++;

                        if (wpm < count.MinWpm)
                        {
                            count.MinWpm = wpm;
                        }
                        if (wpm > count.MaxWpm)
                        {
                            count.MaxWpm = wpm;
                        }

                        if (wpm < total.MinWpm)
                        {
                            total.MinWpm = wpm;
                        }
                        if (wpm > total.MaxWpm)
                        {
                            total.MaxWpm = wpm;
                        }
                    }
                }
            }
        }

        if (finishedHumanCount > 0)
        {
            count.FinishedGames++;
            total.FinishedGames++;

            if (finishedHumanCount > 1)
            {
                count.NonLonelyGames++;
                total.NonLonelyGames++;
            }
        }

        if (count.GameCount == 0)
        {
            count.MinWpm = 0;
        }

        if (total.GameCount == 0)
        {
            total.MinWpm = 0;
        }

        if (existingIndex >= 0)
        {
            statsList[existingIndex] = count;
        }
        else
        {
            statsList.Add(count);
        }

        Log.Info($"[UpdateGlobalStats] Game {game.Id} stats: FinishedHumans={finishedHumanCount}, TotalGames={count.StartedGames}, FinishedGames={count.FinishedGames}");

        if (existingStats == null)
        {
            ctx.Db.globalstats.Insert(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }
        else
        {
            ctx.Db.globalstats.Date.Update(new GlobalStats
            {
                Date = dateKey,
                Stats = statsList,
                Total = total,
                DailyActivePlayers = dailyActivePlayers
            });
        }

        Log.Info($"Updated global stats for date {dateKey}, GameType {game.GameType}, GameMode {game.GameMode}");
    }

    private static void RecordAbandonedGame(ReducerContext ctx, Game game)
    {
        if (game.GameType != GameType.Public || game.Placements.Count >= GetMaxPlayerCount(game.GameType))
        {
            return;
        }

        var hasHumanTypingData = false;
        foreach (var progress in ctx.Db.playerprogress.GameId.Filter(game.Id))
        {
            if (!progress.IsBot && progress.CharacterHistory.Length > 0)
            {
                hasHumanTypingData = true;
                break;
            }
        }

        if (!hasHumanTypingData)
        {
            return;
        }

        AbandonedGame? oldestGame = null;
        var abandonedGameCount = 0;
        foreach (var abandonedGame in ctx.Db.abandonedgames.Iter())
        {
            abandonedGameCount++;
            if (
                oldestGame == null ||
                abandonedGame.ArchivedAt < oldestGame.Value.ArchivedAt ||
                (
                    abandonedGame.ArchivedAt == oldestGame.Value.ArchivedAt &&
                    (
                        abandonedGame.CreatedAt < oldestGame.Value.CreatedAt ||
                        (
                            abandonedGame.CreatedAt == oldestGame.Value.CreatedAt &&
                            string.CompareOrdinal(abandonedGame.GameId, oldestGame.Value.GameId) < 0
                        )
                    )
                )
            )
            {
                oldestGame = abandonedGame;
            }
        }

        if (abandonedGameCount >= MAX_ABANDONED_GAMES && oldestGame != null)
        {
            ctx.Db.abandonedgames.GameId.Delete(oldestGame.Value.GameId);
        }

        ctx.Db.abandonedgames.Insert(new AbandonedGame
        {
            GameId = game.Id,
            GameMode = game.GameMode,
            CreatedAt = game.CreatedAt,
            ArchivedAt = ctx.Timestamp.MicrosecondsSinceUnixEpoch,
            PlacementCount = game.Placements.Count
        });
    }
}
