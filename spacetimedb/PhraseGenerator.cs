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

    public static (string Phrase, string? Attribution) GeneratePhraseForMode(GameMode mode, Random rng)
    {
        switch (mode)
        {
            case GameMode.English500:
                return (GeneratePhrase(English500Words.Words, rng), null);
            case GameMode.Spanish500:
                return (GeneratePhrase(Spanish500Words.Words, rng), null);
            case GameMode.French500:
                return (GeneratePhrase(French500Words.Words, rng), null);
            case GameMode.German500:
                return (GeneratePhrase(German500Words.Words, rng), null);
            case GameMode.Italian500:
                return (GeneratePhrase(Italian500Words.Words, rng), null);
            case GameMode.Portuguese500:
                return (GeneratePhrase(Portuguese500Words.Words, rng), null);
            case GameMode.Japanese500:
                return (GeneratePhrase(Japanese500Words.Words, rng), null);
            case GameMode.Korean500:
                return (GeneratePhrase(Korean500Words.Words, rng), null);
            case GameMode.Chinese500:
                return (GeneratePhrase(Chinese500Words.Words, rng), null);
            case GameMode.Ukrainian500:
                return (GeneratePhrase(Ukrainian500Words.Words, rng), null);
            case GameMode.Arabic500:
                return (GeneratePhrase(Arabic500Words.Words, rng), null);
            case GameMode.Hindi500:
                return (GeneratePhrase(Hindi500Words.Words, rng), null);
            case GameMode.Dutch500:
                return (GeneratePhrase(Dutch500Words.Words, rng), null);
            case GameMode.Swedish500:
                return (GeneratePhrase(Swedish500Words.Words, rng), null);
            case GameMode.Turkish500:
                return (GeneratePhrase(Turkish500Words.Words, rng), null);
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
                var quote = QuoteGenerator.GetRandomQuote(mode, rng);
                return (quote.Text, quote.Author);
            default:
                return ("The quick brown fox jumps over the lazy dog", null);
        }
    }
}
