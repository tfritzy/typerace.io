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
public partial struct Game
{
    [SpacetimeDB.AutoInc]
    [SpacetimeDB.PrimaryKey]
    public ulong Id;
    public string Phrase;
    public ulong CreatedAt;
    [SpacetimeDB.Index]
    public string State;
    [SpacetimeDB.Index]
    public string GameMode;
}

[SpacetimeDB.Table(Scheduled = nameof(StartGameCountdown))]
public partial struct GameCountdown
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
        Game? foundGame = null;
        foreach (var game in ctx.Db.Game.State.Filter(GameState.Lobby.ToString()))
        {
            if (game.GameMode == gameMode)
            {
                foundGame = game;
                break;
            }
        }

        if (foundGame != null)
        {
            Log($"Player {player} joined game {foundGame.Value.Id}");

            ctx.Db.PlayerProgress.Insert(new PlayerProgress
            {
                Id = 0,
                PlayerId = ctx.Sender,
                GameId = foundGame.Value.Id,
                ProgressIndex = 0
            });
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

            ctx.Db.PlayerProgress.Insert(new PlayerProgress
            {
                Id = 0,
                PlayerId = ctx.Sender,
                GameId = newGame.Id,
                ProgressIndex = 0
            });

            var eightSecondsInMicros = 8UL * 1000000UL;
            var scheduledTime = newGame.CreatedAt * 1000UL + eightSecondsInMicros;
            ctx.Db.GameCountdown.Insert(new GameCountdown
            {
                GameId = newGame.Id,
                ScheduledAt = SpacetimeDB.ScheduleAt.Time(scheduledTime)
            });
        }
    }

    [SpacetimeDB.Reducer]
    public static void StartGameCountdown(ReducerContext ctx, ulong gameId)
    {
        var game = ctx.Db.Game.Id.Find(gameId);

        if (game != null && game.Value.State == GameState.Lobby.ToString())
        {
            ctx.Db.Game.Id.Update(new Game
            {
                Id = game.Value.Id,
                Phrase = game.Value.Phrase,
                CreatedAt = game.Value.CreatedAt,
                State = GameState.Starting.ToString(),
                GameMode = game.Value.GameMode
            });
            Log($"Game {gameId} transitioned to Starting state");
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

        PlayerProgress? existingProgress = null;
        foreach (var progress in ctx.Db.PlayerProgress.PlayerId.Filter(playerId))
        {
            if (progress.GameId == gameId)
            {
                existingProgress = progress;
                break;
            }
        }

        if (existingProgress == null)
        {
            Log($"No progress found for player {playerId} in game {gameId}");
            return;
        }

        ctx.Db.PlayerProgress.Id.Update(new PlayerProgress
        {
            Id = existingProgress.Value.Id,
            PlayerId = existingProgress.Value.PlayerId,
            GameId = existingProgress.Value.GameId,
            ProgressIndex = newIndex
        });
        Log($"Updated progress for player {playerId} in game {gameId} to {newIndex}");
    }
}
