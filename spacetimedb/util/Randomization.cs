using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static double GenerateTypingRate(Random rng)
    {
        var meanWpm = 70.0;
        var stdDev = 20.0;
        var wpm = GenerateNormalDistribution(rng, meanWpm, stdDev);
        wpm = Math.Max(35.0, Math.Min(120.0, wpm));
        var charactersPerSecond = (wpm * 5.0) / 60.0;
        var microsecondsPerCharacter = 1_000_000.0 / charactersPerSecond;
        return microsecondsPerCharacter;
    }

    private static double GenerateErrorRate(Random rng)
    {
        var meanErrorRate = 0.05;
        var stdDev = 0.03;
        var errorRate = GenerateNormalDistribution(rng, meanErrorRate, stdDev);
        return Math.Max(0.0, Math.Min(0.15, errorRate));
    }

    private static double GenerateNormalDistribution(Random rng, double mean, double stdDev)
    {
        var u1 = 1.0 - rng.NextDouble();
        var u2 = 1.0 - rng.NextDouble();
        var randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        return mean + stdDev * randStdNormal;
    }

    private static PlayerColor GenerateRandomColor(Random rng)
    {
        var colors = Enum.GetValues<PlayerColor>();
        return colors[rng.Next(colors.Length)];
    }

    private static string GenerateNonAnonymousAdjective(Random rng)
    {
        string[] adjectives = { "Shiny", "Sparkly", "Exothermic", "Exuberant" };
        return adjectives[rng.Next(adjectives.Length)];
    }
}
