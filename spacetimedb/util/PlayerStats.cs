using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static void UpdateDailyActivePlayerCount(ReducerContext ctx, Identity playerId, string dateKey)
    {
        var gamesPlayedToday = ctx.Db.gamerecord.PlayerId_Day.Filter((playerId, dateKey)).Count();

        Log.Info($"[DailyActivePlayers] Player {playerId} finished game on {dateKey}, GamesToday={gamesPlayedToday}");

        if (gamesPlayedToday == 1)
        {
            var existingStats = ctx.Db.globalstats.Date.Find(dateKey);

            if (existingStats == null)
            {
                ctx.Db.globalstats.Insert(new GlobalStats
                {
                    Date = dateKey,
                    Stats = new List<GameModeCount>(),
                    Total = new GameModeCount
                    {
                        GameType = GameType.Public,
                        GameMode = GameMode.English500,
                        FinishedGames = 0,
                        NonLonelyGames = 0,
                        StartedGames = 0,
                        TotalWpm = 0,
                        MinWpm = 0,
                        MaxWpm = 0,
                        GameCount = 0
                    },
                    DailyActivePlayers = 1
                });
                Log.Info($"[DailyActivePlayers] Created global stats for {dateKey} with player {playerId} as first active player");
            }
            else
            {
                var updatedStats = existingStats.Value;
                updatedStats.DailyActivePlayers++;
                ctx.Db.globalstats.Date.Update(updatedStats);
                Log.Info($"[DailyActivePlayers] Player {playerId} is NEW today, incremented count to {updatedStats.DailyActivePlayers}");
            }
        }
    }

    private static void UpdatePlayerStatsForGame(ReducerContext ctx, PlayerProgress progress, Game game, int placement, long timeElapsed)
    {
        var updatedProgress = progress;
        updatedProgress.Time = timeElapsed;
        updatedProgress.Placement = placement;
        ctx.Db.playerprogress.Id.Update(updatedProgress);

        var player = ctx.Db.player.Identity.Find(progress.PlayerId);
        if (player == null) return;

        var wpm = CalculateWpm(game.Phrase.Length, timeElapsed);

        var wordsTyped = game.Phrase.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        var phraseLength = game.Phrase.Contains(' ') ? wordsTyped : game.Phrase.Length;
        var accuracy = CharacterHistoryUtils.CalculateAccuracy(progress.CharacterHistory);

        var updatedPlayer = player.Value;
        UpdatePlayerStats(ref updatedPlayer, placement, wordsTyped, timeElapsed / 1000);
        LevelUpPlayer(ref updatedPlayer);
        ctx.Db.player.Identity.Update(updatedPlayer);

        var eloChange = UpdatePlayerElo(ctx, progress.PlayerId, game, placement);

        var statsId = IdGenerator.Generate("gr_", ctx.Rng);

        var timestamp = ctx.Timestamp.MicrosecondsSinceUnixEpoch;
        var dateTime = DateTimeOffset.FromUnixTimeMilliseconds(timestamp / 1000);
        var year = dateTime.Year;
        var month = dateTime.Month;
        var day = dateTime.ToString("yyyy-MM-dd");
        var storesPersonalRecords = !player.Value.IsAnonymous;
        var isPersonalBest = storesPersonalRecords
            && IsPersonalRecord(ctx, progress.PlayerId, game.GameMode, phraseLength, wpm);

        ctx.Db.gamerecord.Insert(new GameRecord
        {
            Id = statsId,
            PlayerId = progress.PlayerId,
            GameId = game.Id,
            GameMode = game.GameMode,
            GameType = game.GameType,
            Year = year,
            Month = month,
            Day = day,
            Date = timestamp,
            TimeMs = timeElapsed / 1000,
            Placement = placement,
            Wpm = wpm,
            XpGained = 0,
            EloChange = eloChange,
            Accuracy = accuracy,
            PhraseLength = phraseLength,
            IsPersonalBest = isPersonalBest
        });

        if (storesPersonalRecords)
        {
            UpdatePersonalRecord(ctx, progress.PlayerId, game.GameMode, phraseLength, statsId, game.Id, wpm, accuracy);
        }

        if (!progress.IsBot)
        {
            UpdateDailyActivePlayerCount(ctx, progress.PlayerId, day);
        }

        Log.Info($"Player {progress.PlayerId} finished game {game.Id} in place {placement}, typed {wordsTyped} words");
    }

    private static void UpdatePlayerStats(ref Player player, int placement, int wordsTyped, long timeElapsedMs)
    {
        player.TotalGames += 1;
        if (placement == 1)
        {
            player.Wins += 1;
        }
        player.TotalWordsTyped += wordsTyped;
        player.TotalTimeSpentMs += timeElapsedMs;
    }

    private static void LevelUpPlayer(ref Player player)
    {
        while (true)
        {
            var xpRequired = XpRequiredForLevel(player.Level + 1);
            if (player.Xp < xpRequired)
            {
                player.XpRequiredForNextLevel = xpRequired;
                break;
            }
            player.Xp -= xpRequired;
            player.Level += 1;
        }
    }

    private static PersonalRecord? FindPersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength)
    {
        foreach (var record in ctx.Db.personalrecord.PlayerId_GameMode_PhraseLength.Filter((playerId, gameMode, phraseLength)))
        {
            return record;
        }

        return null;
    }

    private static bool IsPersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength, double wpm)
    {
        var existingRecord = FindPersonalRecord(ctx, playerId, gameMode, phraseLength);
        return existingRecord == null || wpm > existingRecord.Value.Wpm;
    }

    private static void UpdatePersonalRecord(ReducerContext ctx, Identity playerId, GameMode gameMode, int? phraseLength, string gameRecordId, string gameId, double wpm, double accuracy)
    {
        var existingRecord = FindPersonalRecord(ctx, playerId, gameMode, phraseLength);

        if (existingRecord == null || wpm > existingRecord.Value.Wpm)
        {
            if (existingRecord != null)
            {
                ctx.Db.personalrecord.Id.Delete(existingRecord.Value.Id);
            }

            ctx.Db.personalrecord.Insert(new PersonalRecord
            {
                Id = IdGenerator.Generate("pr_", ctx.Rng),
                PlayerId = playerId,
                GameMode = gameMode,
                PhraseLength = phraseLength,
                GameRecordId = gameRecordId,
                GameId = gameId,
                Wpm = wpm,
                Accuracy = accuracy
            });

            Log.Info($"Updated personal record for player {playerId} in mode {gameMode}: {wpm} WPM");
        }
    }

    private static bool IsFirstGameOfDay(long lastGameDate, long currentDate)
    {
        if (lastGameDate == 0)
        {
            return true;
        }

        var lastGameDay = DateTimeOffset.FromUnixTimeMilliseconds(lastGameDate / 1000).Date;
        var currentDay = DateTimeOffset.FromUnixTimeMilliseconds(currentDate / 1000).Date;

        return currentDay > lastGameDay;
    }

    private static int XpRequiredForLevel(int level)
    {
        if (level <= 1)
        {
            return 0;
        }

        if (level >= 20)
        {
            return 500;
        }

        int startXp = 200;
        int endXp = 500;
        int startLevel = 2;
        int endLevel = 20;

        double progress = (double)(level - startLevel) / (endLevel - startLevel);
        return (int)Math.Round(startXp + (endXp - startXp) * progress);
    }
}
