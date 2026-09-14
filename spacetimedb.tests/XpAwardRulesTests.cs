using Xunit;

namespace StdbModule;

public sealed class XpAwardRulesTests
{
    [Fact]
    public void AwardsFlatRacePlacementAccuracyAndStreakEffects()
    {
        var effects = XpAwardRules.Calculate(42, 1, 100, 7);

        Assert.Collection(
            effects,
            effect => Assert.Equal(new XpAwardEffect("race", "Race complete", XpAwardOperator.Add, 42), effect),
            effect => Assert.Equal(new XpAwardEffect("placement", "First place", XpAwardOperator.Add, 25), effect),
            effect => Assert.Equal(new XpAwardEffect("accuracy", "Perfect accuracy", XpAwardOperator.Add, 25), effect),
            effect => Assert.Equal(new XpAwardEffect("streak", "7-day streak", XpAwardOperator.Add, 500), effect)
        );
        Assert.Equal(592, XpAwardRules.CalculateTotal(effects));
    }

    [Fact]
    public void OnlyIncludesBonusesWhoseThresholdsWereMet()
    {
        var effects = XpAwardRules.Calculate(30, 2, 94.9, null);

        Assert.Equal(new XpAwardEffect("race", "Race complete", XpAwardOperator.Add, 30), Assert.Single(effects));
    }

    [Fact]
    public void HighAccuracyUsesOneFlatAccuracyBonus()
    {
        var effects = XpAwardRules.Calculate(30, 2, 97, null);

        Assert.Equal(new XpAwardEffect("accuracy", "High accuracy", XpAwardOperator.Add, 15), effects[1]);
        Assert.Equal(45, XpAwardRules.CalculateTotal(effects));
    }

    [Theory]
    [InlineData(1, 100)]
    [InlineData(2, 100)]
    [InlineData(7, 500)]
    [InlineData(14, 500)]
    [InlineData(365, 2_000)]
    [InlineData(730, 2_000)]
    public void UsesTheLargestStreakMilestoneBonus(int streak, int expectedXp)
    {
        var effects = XpAwardRules.Calculate(30, 2, 90, streak);

        Assert.Equal("streak", effects[1].Category);
        Assert.Equal(XpAwardOperator.Add, effects[1].Operator);
        Assert.Equal((float)expectedXp, effects[1].Value);
    }
}
