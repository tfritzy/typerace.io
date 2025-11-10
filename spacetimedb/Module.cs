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

public partial struct CompletedGameStats
{
    public ulong WordCount;
    public ulong Time;
    public ulong Placement;
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
    public SpacetimeDB.List<SpacetimeDB.Identity> FinishedPlayers;
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
    public ulong CompletedAt;
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
    public ulong Month;
    public string GameMode;
    public SpacetimeDB.List<CompletedGameStats> CompletedGames;
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
                GameMode = gameMode,
                FinishedPlayers = new SpacetimeDB.List<SpacetimeDB.Identity>()
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
        }
    }

    private static void PlayerCompleted(ReducerContext ctx, ulong gameId, SpacetimeDB.Identity playerId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);
        if (game == null)
        {
            Log($"Game {gameId} not found");
            return;
        }

        var updatedGame = game.Value;
        updatedGame.FinishedPlayers.Add(playerId);
        ctx.Db.Game.Id.Update(updatedGame);

        var placement = (ulong)updatedGame.FinishedPlayers.Count;

        var progress = ctx.Db.PlayerProgress.PlayerId.GameId.Find(playerId, gameId);
        if (progress == null)
        {
            Log($"No progress found for player {playerId}");
            return;
        }

        var completionTime = progress.Value.CompletedAt - game.Value.CreatedAt;

        ulong xpGained = placement switch
        {
            1 => 100,
            2 => 75,
            3 => 50,
            _ => 25
        };

        var player = ctx.Db.Player.PlayerId.Find(playerId);
        if (player != null)
        {
            var updatedPlayer = player.Value;
            updatedPlayer.TotalGames++;
            if (placement == 1)
            {
                updatedPlayer.WinCount++;
            }
            updatedPlayer.Xp += xpGained;
            updatedPlayer.Level = updatedPlayer.Xp / 1000;
            ctx.Db.Player.PlayerId.Update(updatedPlayer);
        }
        else
        {
            ctx.Db.Player.Insert(new Player
            {
                PlayerId = playerId,
                TotalGames = 1,
                WinCount = placement == 1 ? 1UL : 0UL,
                Level = xpGained / 1000,
                Xp = xpGained
            });
        }

        var wordCount = (ulong)game.Value.Phrase.Split(new[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries).Length;

        var now = DateTimeOffset.UtcNow;
        var monthStart = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
        var monthTimestamp = (ulong)monthStart.ToUnixTimeMilliseconds();

        var existingStats = ctx.Db.PlayerStats.PlayerId.Month.GameMode.Find(
            playerId, monthTimestamp, game.Value.GameMode);

        var newGameStats = new CompletedGameStats
        {
            WordCount = wordCount,
            Time = completionTime,
            Placement = placement
        };

        if (existingStats != null)
        {
            var updatedStats = existingStats.Value;
            updatedStats.CompletedGames.Add(newGameStats);
            ctx.Db.PlayerStats.Id.Update(updatedStats);
        }
        else
        {
            var newStatsList = new SpacetimeDB.List<CompletedGameStats>();
            newStatsList.Add(newGameStats);
            ctx.Db.PlayerStats.Insert(new PlayerStats
            {
                PlayerId = playerId,
                Month = monthTimestamp,
                GameMode = game.Value.GameMode,
                CompletedGames = newStatsList
            });
        }

        Log($"Updated stats for player {playerId}: placement={placement}, xp={xpGained}, time={completionTime}ms");
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
        
        var phraseLength = (ulong)game.Value.Phrase.Length;
        if (newIndex >= phraseLength && updatedProgress.CompletedAt == 0)
        {
            updatedProgress.CompletedAt = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Log($"Player {playerId} completed game {gameId} at {updatedProgress.CompletedAt}");
            
            ctx.Db.PlayerProgress.Id.Update(updatedProgress);
            
            PlayerCompleted(ctx, gameId, playerId);
        }
        else
        {
            ctx.Db.PlayerProgress.Id.Update(updatedProgress);
        }
        
        Log($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }
}
