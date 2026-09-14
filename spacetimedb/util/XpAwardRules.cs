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
    internal const int HighAccuracyBonus = 15;
    internal const int PerfectAccuracyBonus = 25;
    internal const int StreakBonus = 100;
    internal const int WeeklyStreakBonus = 500;
    internal const int YearlyStreakBonus = 2_000;
    internal const double HighAccuracyThreshold = 95;

    internal static IReadOnlyList<XpAwardEffect> Calculate(
        int baseRaceXp,
        int placement,
        double accuracy,
        int? advancedStreak)
    {
        var effects = new List<XpAwardEffect>
        {
            Add("race", "Race complete", Math.Max(0, baseRaceXp))
        };

        if (placement == 1)
        {
            effects.Add(Add("placement", "First place", FirstPlaceBonus));
        }

        if (accuracy >= 100)
        {
            effects.Add(Add("accuracy", "Perfect accuracy", PerfectAccuracyBonus));
        }
        else if (accuracy >= HighAccuracyThreshold)
        {
            effects.Add(Add("accuracy", "High accuracy", HighAccuracyBonus));
        }

        if (advancedStreak >= 1)
        {
            effects.Add(Add(
                "streak",
                $"{advancedStreak}-day streak",
                GetStreakBonus(advancedStreak.Value)
            ));
        }

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

    private static int GetStreakBonus(int streak)
    {
        if (streak % 365 == 0) return YearlyStreakBonus;
        if (streak % 7 == 0) return WeeklyStreakBonus;
        return StreakBonus;
    }
}
