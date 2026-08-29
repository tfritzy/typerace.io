using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private const int BOT_MATCHMAKING_POOL_SIZE = 20;
    private const int PREFERRED_BOT_ELO_GAP = 30;

    private static List<(Player Bot, int Elo)> SelectBots(ReducerContext ctx, GameMode gameMode, int targetElo, int count)
    {
        var bots = ctx.Db.player.IsBot.Filter(true)
            .Select(bot => (Bot: bot, Elo: GetBotElo(ctx, bot.Identity, gameMode)))
            .ToList();
        int preferredMaximumElo = targetElo - PREFERRED_BOT_ELO_GAP;
        var candidates = bots
            .Where(bot => bot.Elo <= preferredMaximumElo)
            .OrderByDescending(bot => bot.Elo)
            .Take(BOT_MATCHMAKING_POOL_SIZE)
            .ToList();

        if (candidates.Count < count)
        {
            candidates.AddRange(bots
                .Where(bot => bot.Elo > preferredMaximumElo)
                .OrderBy(bot => bot.Elo)
                .Take(count - candidates.Count));
        }

        int selectedCount = Math.Min(count, candidates.Count);
        for (int i = 0; i < selectedCount; i++)
        {
            int selectedIndex = ctx.Rng.Next(i, candidates.Count);
            (candidates[i], candidates[selectedIndex]) = (candidates[selectedIndex], candidates[i]);
        }

        return candidates.Take(selectedCount).ToList();
    }

    private static int GetBotElo(ReducerContext ctx, Identity botId, GameMode gameMode)
    {
        foreach (var elo in ctx.Db.elo.PlayerId_GameMode.Filter((botId, gameMode)))
        {
            return elo.Rating;
        }
        return INITIAL_BOT_ELO;
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
