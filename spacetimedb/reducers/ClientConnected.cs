using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    [Reducer(ReducerKind.ClientConnected)]
    public static void clientConnected(ReducerContext ctx)
    {
        var existingPlayer = ctx.Db.player.Identity.Find(ctx.Sender);

        if (existingPlayer == null)
        {
            var animalName = AnimalNameGenerator.Generate(ctx.Rng);
            ctx.Db.player.Insert(new Player
            {
                Identity = ctx.Sender,
                PlayerId = IdGenerator.Generate("plyr_", ctx.Rng),
                Name = $"Anonymous {animalName}",
                TotalGames = 0,
                Wins = 0,
                Level = 1,
                Xp = 0,
                XpRequiredForNextLevel = XpRequiredForLevel(2),
                TotalWordsTyped = 0,
                TotalTimeSpentMs = 0,
                IsBot = false,
                BotConfig = null,
                Color = GenerateRandomColor(ctx.Rng),
                IsAnonymous = true,
                LastGameDate = 0
            });
            Log.Info($"Created player record for new client {ctx.Sender}");
        }
    }

}
