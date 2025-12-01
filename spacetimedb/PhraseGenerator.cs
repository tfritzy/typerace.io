using System;
using System.Collections.Generic;
using System.Linq;

public static class PhraseGenerator
{
    public static string GeneratePhrase(string[] wordList, Random rng, int minWordCount = 20, int maxWordCount = 35)
    {
        var words = new List<string>();
        int wordCount = rng.Next(minWordCount, maxWordCount + 1);

        for (int i = 0; i < wordCount; i++)
        {
            string selectedWord;
            int attempts = 0;
            do
            {
                int index = rng.Next(wordList.Length);
                selectedWord = wordList[index];
                attempts++;
            } while (i > 0 && selectedWord == words[i - 1] && attempts < 100);

            words.Add(selectedWord);
        }

        return string.Join(" ", words);
    }

    public static Phrase GeneratePhraseForMode(GameMode mode, Random rng)
    {
        switch (mode)
        {
            case GameMode.English500:
                return new Phrase(GeneratePhrase(English500Words.Words, rng));
            case GameMode.Spanish500:
                return new Phrase(GeneratePhrase(Spanish500Words.Words, rng));
            case GameMode.French500:
                return new Phrase(GeneratePhrase(French500Words.Words, rng));
            case GameMode.German500:
                return new Phrase(GeneratePhrase(German500Words.Words, rng));
            case GameMode.Italian500:
                return new Phrase(GeneratePhrase(Italian500Words.Words, rng));
            case GameMode.Portuguese500:
                return new Phrase(GeneratePhrase(Portuguese500Words.Words, rng));
            case GameMode.Japanese500:
                return new Phrase(GeneratePhrase(Japanese500Words.Words, rng));
            case GameMode.Korean500:
                return new Phrase(GeneratePhrase(Korean500Words.Words, rng));
            case GameMode.Chinese500:
                return new Phrase(GeneratePhrase(Chinese500Words.Words, rng));
            case GameMode.Ukrainian500:
                return new Phrase(GeneratePhrase(Ukrainian500Words.Words, rng));
            case GameMode.Arabic500:
                return new Phrase(GeneratePhrase(Arabic500Words.Words, rng));
            case GameMode.Hindi500:
                return new Phrase(GeneratePhrase(Hindi500Words.Words, rng));
            case GameMode.Dutch500:
                return new Phrase(GeneratePhrase(Dutch500Words.Words, rng));
            case GameMode.Swedish500:
                return new Phrase(GeneratePhrase(Swedish500Words.Words, rng));
            case GameMode.Turkish500:
                return new Phrase(GeneratePhrase(Turkish500Words.Words, rng));
            case GameMode.EnglishQuotes:
            case GameMode.SpanishQuotes:
            case GameMode.FrenchQuotes:
            case GameMode.GermanQuotes:
            case GameMode.ItalianQuotes:
            case GameMode.PortugueseQuotes:
            case GameMode.JapaneseQuotes:
            case GameMode.KoreanQuotes:
            case GameMode.ChineseQuotes:
            case GameMode.UkrainianQuotes:
            case GameMode.ArabicQuotes:
            case GameMode.HindiQuotes:
            case GameMode.DutchQuotes:
            case GameMode.SwedishQuotes:
            case GameMode.TurkishQuotes:
                return QuoteGenerator.GetRandomQuote(mode, rng);
            default:
                return new Phrase("The quick brown fox jumps over the lazy dog");
        }
    }
}
