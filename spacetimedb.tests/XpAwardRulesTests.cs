using Xunit;

namespace StdbModule;

public sealed class XpAwardRulesTests
{
    [Fact]
    public void AwardsFlatRacePlacementAccuracyAndStreakEffects()
    {
        var effects = XpAwardRules.Calculate(42, true, 1, 100, 7);

        Assert.Collection(
            effects,
            effect => Assert.Equal(new XpAwardEffect("streak", "7-day streak", XpAwardOperator.Add, 500), effect),
            effect => Assert.Equal(new XpAwardEffect("race", "Phrase length", XpAwardOperator.Add, 42), effect),
            effect => Assert.Equal(new XpAwardEffect("difficulty", "Quote difficulty", XpAwardOperator.Add, 42), effect),
            effect => Assert.Equal(new XpAwardEffect("placement", "First place", XpAwardOperator.Add, 25), effect),
            effect => Assert.Equal(new XpAwardEffect("accuracy", "Perfect accuracy", XpAwardOperator.Add, 25), effect)
        );
        Assert.Equal(634, XpAwardRules.CalculateTotal(effects));
    }

    [Fact]
    public void AwardsOneBaseXpPerCharacterAndSmallerResultBonuses()
    {
        var characterXp = "one two".Length;
        var effects = XpAwardRules.Calculate(characterXp, false, 4, 72.4, null);

        Assert.Collection(
            effects,
            effect => Assert.Equal(new XpAwardEffect("race", "Phrase length", XpAwardOperator.Add, 7), effect),
            effect => Assert.Equal(new XpAwardEffect("placement", "4th place", XpAwardOperator.Add, 3), effect),
            effect => Assert.Equal(new XpAwardEffect("accuracy", "72% accuracy", XpAwardOperator.Add, 3), effect)
        );
        Assert.Equal(13, XpAwardRules.CalculateTotal(effects));
    }

    [Fact]
    public void HighAccuracyUsesOneFlatAccuracyBonus()
    {
        var effects = XpAwardRules.Calculate(30, false, 2, 97, null);

        Assert.Equal(new XpAwardEffect("placement", "Second place", XpAwardOperator.Add, 10), effects[1]);
        Assert.Equal(new XpAwardEffect("accuracy", "97% accuracy", XpAwardOperator.Add, 15), effects[2]);
        Assert.Equal(55, XpAwardRules.CalculateTotal(effects));
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
        var effects = XpAwardRules.Calculate(30, false, 2, 90, streak);

        Assert.Equal("streak", effects[0].Category);
        Assert.Equal(XpAwardOperator.Add, effects[0].Operator);
        Assert.Equal((float)expectedXp, effects[0].Value);
    }
}
