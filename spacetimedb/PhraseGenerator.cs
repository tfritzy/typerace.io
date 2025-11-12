using System;
using System.Collections.Generic;
using System.Linq;

public static class PhraseGenerator
{
    public static string GeneratePhrase(string[] wordList, Random rng, int wordCount = 10)
    {
        var words = new List<string>();

        for (int i = 0; i < wordCount; i++)
        {
            int index = rng.Next(wordList.Length);
            words.Add(wordList[index]);
        }

        return string.Join(" ", words);
    }

    public static string GeneratePhraseForMode(GameMode mode, Random rng)
    {
        switch (mode)
        {
            case GameMode.English500:
                return GeneratePhrase(English500Words.Words, rng, 10);
            case GameMode.Spanish500:
                return GeneratePhrase(Spanish500Words.Words, rng, 10);
            default:
                return "The quick brown fox jumps over the lazy dog";
        }
    }
}
