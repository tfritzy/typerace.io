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
            case GameMode.French500:
                return GeneratePhrase(French500Words.Words, rng, 10);
            case GameMode.German500:
                return GeneratePhrase(German500Words.Words, rng, 10);
            case GameMode.Italian500:
                return GeneratePhrase(Italian500Words.Words, rng, 10);
            case GameMode.Portuguese500:
                return GeneratePhrase(Portuguese500Words.Words, rng, 10);
            case GameMode.Japanese500:
                return GeneratePhrase(Japanese500Words.Words, rng, 10);
            case GameMode.Korean500:
                return GeneratePhrase(Korean500Words.Words, rng, 10);
            case GameMode.Chinese500:
                return GeneratePhrase(Chinese500Words.Words, rng, 10);
            case GameMode.Ukrainian500:
                return GeneratePhrase(Ukrainian500Words.Words, rng, 10);
            case GameMode.Arabic500:
                return GeneratePhrase(Arabic500Words.Words, rng, 10);
            case GameMode.Hindi500:
                return GeneratePhrase(Hindi500Words.Words, rng, 10);
            case GameMode.Dutch500:
                return GeneratePhrase(Dutch500Words.Words, rng, 10);
            case GameMode.Swedish500:
                return GeneratePhrase(Swedish500Words.Words, rng, 10);
            case GameMode.Turkish500:
                return GeneratePhrase(Turkish500Words.Words, rng, 10);
            default:
                return "The quick brown fox jumps over the lazy dog";
        }
    }
}
