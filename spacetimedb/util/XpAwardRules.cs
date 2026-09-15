namespace StdbModule;

internal enum XpAwardOperator
{
    Add,
    Multiply
}

internal readonly record struct XpAwardEffect(
    string Category,
    string Label,
    XpAwardOperator Operator,
    float Value
);

internal static class XpAwardRules
{
    internal const int FirstPlaceBonus = 25;
    internal const int SecondPlaceBonus = 10;
    internal const int PlacementBonus = 3;
    internal const int HighAccuracyBonus = 15;
    internal const int PerfectAccuracyBonus = 25;
    internal const int AccuracyBonus = 3;
    internal const int StreakBonus = 100;
    internal const int WeeklyStreakBonus = 500;
    internal const int YearlyStreakBonus = 2_000;
    internal const double HighAccuracyThreshold = 95;

    internal static IReadOnlyList<XpAwardEffect> Calculate(
        int characterCount,
        bool isQuoteMode,
        int placement,
        double accuracy,
        int? advancedStreak)
    {
        var effects = new List<XpAwardEffect>();

        if (advancedStreak >= 1)
        {
            effects.Add(Add(
                "streak",
                $"{advancedStreak}-day streak",
                GetStreakBonus(advancedStreak.Value)
            ));
        }

        var characterXp = Math.Max(0, characterCount);
        effects.Add(Add("race", "Phrase length", characterXp));

        if (isQuoteMode)
        {
            effects.Add(Add("difficulty", "Quote difficulty", characterXp));
        }

        effects.Add(GetPlacementEffect(placement));
        effects.Add(GetAccuracyEffect(accuracy));

        return effects;
    }

    internal static int CalculateTotal(IEnumerable<XpAwardEffect> effects)
    {
        var total = 0f;
        foreach (var effect in effects)
        {
            total = effect.Operator switch
            {
                XpAwardOperator.Add => total + effect.Value,
                XpAwardOperator.Multiply => total * effect.Value,
                _ => throw new InvalidOperationException(
                    $"Unsupported XP operator: {effect.Operator}"
                )
            };
        }

        return (int)MathF.Round(total);
    }

    private static XpAwardEffect Add(string category, string label, float value)
    {
        return new XpAwardEffect(category, label, XpAwardOperator.Add, value);
    }

    private static XpAwardEffect GetPlacementEffect(int placement)
    {
        return placement switch
        {
            1 => Add("placement", "First place", FirstPlaceBonus),
            2 => Add("placement", "Second place", SecondPlaceBonus),
            3 => Add("placement", "Third place", PlacementBonus),
            _ => Add("placement", $"{Math.Max(placement, 1)}th place", PlacementBonus)
        };
    }

    private static XpAwardEffect GetAccuracyEffect(double accuracy)
    {
        if (accuracy >= 100)
        {
            return Add("accuracy", "Perfect accuracy", PerfectAccuracyBonus);
        }

        var roundedAccuracy = Math.Clamp(
            (int)Math.Round(accuracy, MidpointRounding.AwayFromZero),
            0,
            99
        );
        var label = $"{roundedAccuracy}% accuracy";

        if (accuracy >= HighAccuracyThreshold)
        {
            return Add("accuracy", label, HighAccuracyBonus);
        }

        return Add("accuracy", label, AccuracyBonus);
    }

    private static int GetStreakBonus(int streak)
    {
        if (streak % 365 == 0) return YearlyStreakBonus;
        if (streak % 7 == 0) return WeeklyStreakBonus;
        return StreakBonus;
    }
}
