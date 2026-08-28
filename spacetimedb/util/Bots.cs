using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static List<Player> GetEligibleBots(ReducerContext ctx, GameMode gameMode, int targetElo, string gameId)
    {
        var botsWithElo = new List<(Player bot, int elo)>();
        foreach (var bot in ctx.Db.player.IsBot.Filter(true))
        {
            int botElo = GetBotElo(ctx, bot.Identity, gameMode);
            botsWithElo.Add((bot, botElo));
        }

        botsWithElo.Sort((a, b) => a.elo.CompareTo(b.elo));

        int targetIndex = botsWithElo.Count / 2;
        for (int i = 0; i < botsWithElo.Count; i++)
        {
            if (botsWithElo[i].elo >= targetElo)
            {
                targetIndex = i;
                break;
            }
        }

        int startIndex = Math.Max(0, targetIndex - 10);
        int endIndex = Math.Min(botsWithElo.Count - 1, targetIndex + 10);

        var eligibleBots = new List<Player>();
        for (int i = startIndex; i <= endIndex; i++)
        {
            eligibleBots.Add(botsWithElo[i].bot);
        }

        return eligibleBots;
    }

    private static int GetBotElo(ReducerContext ctx, Identity botId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.elo.PlayerId_GameMode.Filter((botId, gameMode)))
        {
            return elo.Rating;
        }
        return 1000;
    }

    private static long GenerateRealisticBotDelay(Random rng, double baseTypingRate, bool justTypedSpace)
    {
        bool inBurst = rng.NextDouble() < BOT_BURST_PROBABILITY;
        bool hesitate = !inBurst && rng.NextDouble() < BOT_HESITATION_PROBABILITY;

        double rate = baseTypingRate;

        if (inBurst)
        {
            rate *= BOT_BURST_SPEED_MULTIPLIER;
        }

        if (justTypedSpace)
        {
            rate *= 1.5 + rng.NextDouble() * 1.0;
        }

        var variance = 0.2;
        var randomFactor = 1.0 + (rng.NextDouble() * 2.0 - 1.0) * variance;
        long delay = (long)(rate * randomFactor);

        if (hesitate)
        {
            delay += BOT_HESITATION_DELAY_MIN_MICROSECONDS + (long)(rng.NextDouble() * BOT_HESITATION_DELAY_RANGE_MICROSECONDS);
        }

        return Math.Max(delay, BOT_MIN_KEYSTROKE_DELAY_MICROSECONDS);
    }

    private static long GenerateBotDelayWithVariance(Random rng, double baseTypingRate)
    {
        var variance = 0.2;
        var randomFactor = 1.0 + (rng.NextDouble() * 2.0 - 1.0) * variance;
        return (long)(baseTypingRate * randomFactor);
    }

    private static long GenerateBotDelay(Random rng)
    {
        return 100_000 + rng.Next(150_000);
    }
}
