using SpacetimeDB;

namespace StdbModule;

public static partial class Module
{
    private static bool IsValidScoreGameId(string gameId) =>
        IsValidScoreKey(gameId, 64, c => c == '_' || (c >= '0' && c <= '9'));

    private static bool IsValidScoreLanguage(string language) =>
        IsValidScoreKey(language, 16, c => c == '-');

    private static bool IsValidScoreKey(string value, int maxLength, Func<char, bool> allowExtra) =>
        value.Length > 0 && value.Length <= maxLength && value.All(c => (c >= 'a' && c <= 'z') || allowExtra(c));

    private const long ScoreProofMod = 2_147_483_647;

    private static bool IsValidScoreProof(string gameId, string language, int score, long scoreProof) =>
        scoreProof == CreateScoreProof(gameId, language, score);

    private static long CreateScoreProof(string gameId, string language, int score)
    {
        var proof = (score + 73_210_291L) % ScoreProofMod;
        proof = AddScoreProofText(proof, gameId);
        proof = AddScoreProofText(proof, language);
        return (proof * 97 + score * 13L + 1_664_525L) % ScoreProofMod;
    }

    private static long AddScoreProofText(long proof, string value)
    {
        foreach (var c in value)
        {
            proof = (proof * 31 + c) % ScoreProofMod;
        }
        return proof;
    }
}
