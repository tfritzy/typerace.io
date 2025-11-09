using SpacetimeDB.Module;
using static SpacetimeDB.Module.Runtime;

public enum GameState
{
    Lobby,
    Starting,
    Racing,
    Finished
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
            ProgressIndex = 0
        });
    }

    [SpacetimeDB.Reducer]
    public static void StartGameCountdown(ReducerContext ctx, ulong gameId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);

        if (game != null && game.Value.State == GameState.Lobby.ToString())
        {
            var updatedGame = game.Value;
            updatedGame.State = GameState.Starting.ToString();
            ctx.Db.Game.Id.Update(updatedGame);
            Log($"Game {gameId} transitioned to Starting state");

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

        if (game != null && game.Value.State == GameState.Starting.ToString())
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
            updatedGame.State = GameState.Finished.ToString();
            ctx.Db.Game.Id.Update(updatedGame);
            Log($"Game {gameId} transitioned to Finished state");
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
        ctx.Db.PlayerProgress.Id.Update(updatedProgress);
        Log($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }
}
