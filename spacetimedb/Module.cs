using SpacetimeDB.Module;
using static SpacetimeDB.Module.Runtime;

public enum GameState
{
    Lobby,
    Countdown,
    Racing,
    Archived
}

public enum GameMode
{
    English500
}

[SpacetimeDB.Table]
public partial struct Person
{
    public string Name;
}

[SpacetimeDB.Table]
[SpacetimeDB.Index(nameof(State), nameof(GameMode))]
public partial struct Game
{
    [SpacetimeDB.AutoInc]
    [SpacetimeDB.PrimaryKey]
    public ulong Id;
    public string Phrase;
    public ulong CreatedAt;
    public string State;
    public string GameMode;
}

[SpacetimeDB.Table(Scheduled = nameof(StartGameCountdown))]
public partial struct GameCountdown
{
    public ulong GameId;
    public SpacetimeDB.ScheduleAt ScheduledAt;
}

[SpacetimeDB.Table(Scheduled = nameof(StartGame))]
public partial struct GameStart
{
    public ulong GameId;
    public SpacetimeDB.ScheduleAt ScheduledAt;
}

[SpacetimeDB.Table(Scheduled = nameof(CompleteGame))]
public partial struct GameCompletion
{
    public ulong GameId;
    public SpacetimeDB.ScheduleAt ScheduledAt;
}

[SpacetimeDB.Table]
[SpacetimeDB.Index(nameof(PlayerId), nameof(GameId))]
public partial struct PlayerProgress
{
    [SpacetimeDB.AutoInc]
    [SpacetimeDB.PrimaryKey]
    public ulong Id;
    public SpacetimeDB.Identity PlayerId;
    public ulong GameId;
    public ulong ProgressIndex;
    public ulong CompletedAt; // Timestamp when player completed the game (0 if not completed)
}

[SpacetimeDB.Table]
[SpacetimeDB.Index(nameof(PlayerId))]
public partial struct Player
{
    [SpacetimeDB.PrimaryKey]
    public SpacetimeDB.Identity PlayerId;
    public ulong TotalGames;
    public ulong WinCount;
    public ulong Level;
    public ulong Xp;
}

[SpacetimeDB.Table]
[SpacetimeDB.Index(nameof(PlayerId), nameof(Month), nameof(GameMode))]
public partial struct PlayerStats
{
    [SpacetimeDB.AutoInc]
    [SpacetimeDB.PrimaryKey]
    public ulong Id;
    public SpacetimeDB.Identity PlayerId;
    public ulong Month; // Unix timestamp of the start of the month (YYYY-MM-01 00:00:00)
    public string GameMode;
    public string CompletedGames; // JSON array of game stats: [{wordCount, time, placement}]
}

public static partial class Module
{
    [SpacetimeDB.Reducer]
    public static void Init(ReducerContext ctx)
    {
    }

    [SpacetimeDB.Reducer]
    public static void ClientConnected(ReducerContext ctx)
    {
    }

    [SpacetimeDB.Reducer]
    public static void ClientDisconnected(ReducerContext ctx)
    {
    }

    [SpacetimeDB.Reducer]
    public static void Add(ReducerContext ctx, string name)
    {
        ctx.Db.Person.Insert(new Person { Name = name });
    }

    [SpacetimeDB.Reducer]
    public static void SayHello(ReducerContext ctx)
    {
        foreach (var person in ctx.Db.Person.Iter())
        {
            Log($"Hello, {person.Name}!");
        }
        Log("Hello, World!");
    }

    [SpacetimeDB.Reducer]
    public static void JoinGame(ReducerContext ctx, string player, string gameMode)
    {
        var foundGame = ctx.Db.Game.State.GameMode.Find(GameState.Lobby.ToString(), gameMode);

        if (foundGame != null)
        {
            Log($"Player {player} joined game {foundGame.Value.Id}");
            InsertPlayerProgress(ctx, foundGame.Value.Id);
        }
        else
        {
            var newGame = ctx.Db.Game.Insert(new Game
            {
                Id = 0,
                Phrase = "The quick brown fox jumps over the lazy dog",
                CreatedAt = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                State = GameState.Lobby.ToString(),
                GameMode = gameMode
            });
            Log($"Player {player} created and joined game {newGame.Id}");

            InsertPlayerProgress(ctx, newGame.Id);

            var fiveSecondsInMicros = 5UL * 1000000UL;
            var scheduledTime = newGame.CreatedAt * 1000UL + fiveSecondsInMicros;
            ctx.Db.GameCountdown.Insert(new GameCountdown
            {
                GameId = newGame.Id,
                ScheduledAt = SpacetimeDB.ScheduleAt.Time(scheduledTime)
            });
        }
    }

    private static void InsertPlayerProgress(ReducerContext ctx, ulong gameId)
    {
        ctx.Db.PlayerProgress.Insert(new PlayerProgress
        {
            PlayerId = ctx.Sender,
            GameId = gameId,
            ProgressIndex = 0,
            CompletedAt = 0
        });
    }

    [SpacetimeDB.Reducer]
    public static void StartGameCountdown(ReducerContext ctx, ulong gameId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);

        if (game != null && game.Value.State == GameState.Lobby.ToString())
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Countdown.ToString();
            ctx.Db.Game.Id.Update(updatedGame);
            Log($"Game {gameId} transitioned to Countdown state");

            // Schedule the game to start after 3 seconds
            var threeSecondsInMicros = 3UL * 1000000UL;
            var currentTime = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() * 1000UL;
            var scheduledTime = currentTime + threeSecondsInMicros;
            ctx.Db.GameStart.Insert(new GameStart
            {
                GameId = gameId,
                ScheduledAt = SpacetimeDB.ScheduleAt.Time(scheduledTime)
            });
        }
    }

    [SpacetimeDB.Reducer]
    public static void StartGame(ReducerContext ctx, ulong gameId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);

        if (game != null && game.Value.State == GameState.Countdown.ToString())
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Racing.ToString();
            ctx.Db.Game.Id.Update(updatedGame);
            Log($"Game {gameId} transitioned to Racing state");

            // Schedule the game to complete after 5 minutes
            var fiveMinutesInMicros = 5UL * 60UL * 1000000UL;
            var currentTime = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() * 1000UL;
            var scheduledTime = currentTime + fiveMinutesInMicros;
            ctx.Db.GameCompletion.Insert(new GameCompletion
            {
                GameId = gameId,
                ScheduledAt = SpacetimeDB.ScheduleAt.Time(scheduledTime)
            });
        }
    }

    [SpacetimeDB.Reducer]
    public static void CompleteGame(ReducerContext ctx, ulong gameId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);

        if (game != null && game.Value.State == GameState.Racing.ToString())
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Archived.ToString();
            ctx.Db.Game.Id.Update(updatedGame);
            Log($"Game {gameId} transitioned to Archived state");

            // Process player stats for all players who participated in the game
            var allProgress = ctx.Db.PlayerProgress.GameId.Filter(gameId);
            
            // Find all completed players and sort by completion time
            var completedPlayers = new System.Collections.Generic.List<PlayerProgress>();
            foreach (var progress in allProgress)
            {
                if (progress.CompletedAt > 0)
                {
                    completedPlayers.Add(progress);
                }
            }
            
            // Sort by completion time to determine placement
            completedPlayers.Sort((a, b) => a.CompletedAt.CompareTo(b.CompletedAt));
            
            // Calculate word count from phrase
            var wordCount = (ulong)game.Value.Phrase.Split(new[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries).Length;
            
            // Calculate month timestamp (start of current month)
            var now = DateTimeOffset.UtcNow;
            var monthStart = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
            var monthTimestamp = (ulong)monthStart.ToUnixTimeMilliseconds();
            
            // Update stats for each completed player
            for (int i = 0; i < completedPlayers.Count; i++)
            {
                var progress = completedPlayers[i];
                var placement = (ulong)(i + 1); // 1-indexed placement
                var completionTime = progress.CompletedAt - game.Value.CreatedAt;
                
                // Calculate XP based on placement (1st = 100, 2nd = 75, 3rd = 50, rest = 25)
                ulong xpGained = placement switch
                {
                    1 => 100,
                    2 => 75,
                    3 => 50,
                    _ => 25
                };
                
                // Update or create Player record
                var player = ctx.Db.Player.PlayerId.Find(progress.PlayerId);
                if (player != null)
                {
                    var updatedPlayer = player.Value;
                    updatedPlayer.TotalGames++;
                    if (placement == 1)
                    {
                        updatedPlayer.WinCount++;
                    }
                    updatedPlayer.Xp += xpGained;
                    // Simple leveling: level = XP / 1000
                    updatedPlayer.Level = updatedPlayer.Xp / 1000;
                    ctx.Db.Player.PlayerId.Update(updatedPlayer);
                }
                else
                {
                    ctx.Db.Player.Insert(new Player
                    {
                        PlayerId = progress.PlayerId,
                        TotalGames = 1,
                        WinCount = placement == 1 ? 1UL : 0UL,
                        Level = xpGained / 1000,
                        Xp = xpGained
                    });
                }
                
                // Update or create PlayerStats record for this month
                var existingStats = ctx.Db.PlayerStats.PlayerId.Month.GameMode.Find(
                    progress.PlayerId, monthTimestamp, game.Value.GameMode);
                
                if (existingStats != null)
                {
                    var updatedStats = existingStats.Value;
                    // Append new game stats to JSON array
                    // Format: [{wordCount, time, placement}, ...]
                    var newGameData = $"{{\"wordCount\":{wordCount},\"time\":{completionTime},\"placement\":{placement}}}";
                    if (string.IsNullOrEmpty(updatedStats.CompletedGames))
                    {
                        updatedStats.CompletedGames = $"[{newGameData}]";
                    }
                    else
                    {
                        // Remove closing bracket, add comma, add new data, add closing bracket
                        updatedStats.CompletedGames = updatedStats.CompletedGames.Substring(0, updatedStats.CompletedGames.Length - 1) 
                            + $",{newGameData}]";
                    }
                    ctx.Db.PlayerStats.Id.Update(updatedStats);
                }
                else
                {
                    var newGameData = $"{{\"wordCount\":{wordCount},\"time\":{completionTime},\"placement\":{placement}}}";
                    ctx.Db.PlayerStats.Insert(new PlayerStats
                    {
                        PlayerId = progress.PlayerId,
                        Month = monthTimestamp,
                        GameMode = game.Value.GameMode,
                        CompletedGames = $"[{newGameData}]"
                    });
                }
                
                Log($"Updated stats for player {progress.PlayerId}: placement={placement}, xp={xpGained}, time={completionTime}ms");
            }
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateProgress(ReducerContext ctx, ulong gameId, ulong newIndex)
    {
        var playerId = ctx.Sender;

        var game = ctx.Db.Game.Id.Find(gameId);

        if (game == null || game.Value.State != GameState.Racing.ToString())
        {
            Log($"Cannot update progress: game {gameId} is not in Racing state");
            return;
        }

        var existingProgress = ctx.Db.PlayerProgress.PlayerId.GameId.Find(playerId, gameId);

        if (existingProgress == null)
        {
            Log($"No progress found for player {playerId} in game {gameId}");
            return;
        }

        var updatedProgress = existingProgress.Value;
        updatedProgress.ProgressIndex = newIndex;
        
        // Check if player just completed the game (reached the end of the phrase)
        var phraseLength = (ulong)game.Value.Phrase.Length;
        if (newIndex >= phraseLength && updatedProgress.CompletedAt == 0)
        {
            updatedProgress.CompletedAt = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Log($"Player {playerId} completed game {gameId} at {updatedProgress.CompletedAt}");
        }
        
        ctx.Db.PlayerProgress.Id.Update(updatedProgress);
        Log($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }
}
