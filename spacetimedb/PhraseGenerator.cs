using System;
using System.Collections.Generic;
using System.Linq;

public static class PhraseGenerator
{
    [ThreadStatic]
    private static Random? random;

    private static Random GetRandom()
    {
        if (random == null)
        {
            random = new Random(Guid.NewGuid().GetHashCode());
        }
        return random;
    }

    public static string GeneratePhrase(string[] wordList, int wordCount = 10)
    {
        var words = new List<string>();
        var rng = GetRandom();
        
        for (int i = 0; i < wordCount; i++)
        {
            int index = rng.Next(wordList.Length);
            words.Add(wordList[index]);
        }
        
        return string.Join(" ", words);
    }

    public static string GeneratePhraseForMode(GameMode mode)
    {
        switch (mode)
        {
            case GameMode.English500:
                return GeneratePhrase(English500Words.Words, 10);
            case GameMode.Spanish500:
                return GeneratePhrase(Spanish500Words.Words, 10);
            default:
                return "The quick brown fox jumps over the lazy dog";
        }
    }
}
