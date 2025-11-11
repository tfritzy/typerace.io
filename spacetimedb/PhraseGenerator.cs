using System;
using System.Collections.Generic;
using System.Linq;

public static class PhraseGenerator
{
    private static Random random = new Random();

    public static string GeneratePhrase(int wordCount = 10)
    {
        var words = new List<string>();
        
        for (int i = 0; i < wordCount; i++)
        {
            int index = random.Next(English500Words.Words.Length);
            words.Add(English500Words.Words[index]);
        }
        
        return string.Join(" ", words);
    }

    public static string GeneratePhraseForMode(GameMode mode)
    {
        switch (mode)
        {
            case GameMode.English500:
                return GeneratePhrase(10);
            default:
                return "The quick brown fox jumps over the lazy dog";
        }
    }
}
